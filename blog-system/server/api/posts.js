const express = require('express');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');
const deleteRecordService = require('../services/deleteRecordService');

const router = express.Router();

async function updateCategoryPostIds(blogPagesPath, postId, oldCategory, newCategory) {
  try {
    const categoriesPath = path.join(blogPagesPath, 'categories', 'categories.json');
    const data = await fileService.readJsonFile(categoriesPath);
    if (!data || !data.categories) return;

    data.categories.forEach(cat => {
      if (!cat.postIds) cat.postIds = [];
      if (oldCategory && cat.name === oldCategory) {
        cat.postIds = cat.postIds.filter(id => id !== postId);
      }
      if (newCategory && cat.name === newCategory) {
        if (!cat.postIds.includes(postId)) {
          cat.postIds.push(postId);
        }
      }
    });

    await fileService.writeJsonFile(categoriesPath, data);
  } catch (error) {
    console.error('更新分类文章ID失败', error);
  }
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const postIdsPath = path.join(req.blogPagesPath, 'posts', 'post-ids.json');
    const postIds = await fileService.readJsonFile(postIdsPath);

    if (!postIds) {
      return res.json([]);
    }

    const posts = [];
    for (const id of postIds) {
      const postPath = path.join(req.blogPagesPath, 'posts', id + '.json');
      const post = await fileService.readJsonFile(postPath);
      if (post) {
        posts.push(post);
      }
    }

    posts.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const postPath = path.join(req.blogPagesPath, 'posts', req.params.id + '.json');
    const post = await fileService.readJsonFile(postPath);
    
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const markdownPath = path.join(req.blogPagesPath, 'posts', 'markdown', req.params.id + '.md');
    const markdown = await fileService.readTextFile(markdownPath);

    res.json({ ...post, content: markdown || '' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取文章失败' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    
    const postIdsPath = path.join(req.blogPagesPath, 'posts', 'post-ids.json');
    let postIds = await fileService.readJsonFile(postIdsPath) || [];
    
    let sequence = 1;
    while (postIds.includes(dateStr + '-' + sequence)) {
      sequence++;
    }
    const newId = dateStr + '-' + sequence;

    const { title, excerpt, category, image, content, ignore } = req.body;
    const postData = {
      id: newId,
      title,
      excerpt,
      category,
      image,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      author: 'admin',
      contentFile: 'posts/markdown/' + newId + '.md',
      ignore: ignore || false
    };

    const postPath = path.join(req.blogPagesPath, 'posts', newId + '.json');
    await fileService.writeJsonFile(postPath, postData);

    const markdownPath = path.join(req.blogPagesPath, 'posts', 'markdown', newId + '.md');
    await fileService.writeTextFile(markdownPath, content || '');

    postIds.unshift(newId);
    await fileService.writeJsonFile(postIdsPath, postIds);

    await updateCategoryPostIds(req.blogPagesPath, newId, null, category);

    res.json({ message: '文章创建成功', post: postData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '创建文章失败' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const postPath = path.join(req.blogPagesPath, 'posts', req.params.id + '.json');
    const existingPost = await fileService.readJsonFile(postPath);
    
    if (!existingPost) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const { title, excerpt, category, image, content, ignore } = req.body;
    const updatedPost = {
      ...existingPost,
      title,
      excerpt,
      category,
      image,
      ignore: ignore !== undefined ? ignore : existingPost.ignore,
      updatedAt: new Date().toISOString()
    };

    await fileService.writeJsonFile(postPath, updatedPost);

    if (content !== undefined) {
      const markdownPath = path.join(req.blogPagesPath, 'posts', 'markdown', req.params.id + '.md');
      await fileService.writeTextFile(markdownPath, content);
    }

    await updateCategoryPostIds(req.blogPagesPath, req.params.id, existingPost.category, category);

    res.json({ message: '文章更新成功', post: updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新文章失败' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postIdsPath = path.join(req.blogPagesPath, 'posts', 'post-ids.json');
    let postIds = await fileService.readJsonFile(postIdsPath) || [];
    
    if (!postIds.includes(req.params.id)) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const postPath = path.join(req.blogPagesPath, 'posts', req.params.id + '.json');
    const existingPost = await fileService.readJsonFile(postPath);
    
    await fileService.deleteFile(postPath);

    const markdownPath = path.join(req.blogPagesPath, 'posts', 'markdown', req.params.id + '.md');
    await fileService.deleteFile(markdownPath);

    postIds = postIds.filter(id => id !== req.params.id);
    await fileService.writeJsonFile(postIdsPath, postIds);

    await updateCategoryPostIds(req.blogPagesPath, req.params.id, existingPost ? existingPost.category : null, null);

    const dataDir = path.join(__dirname, '../data');
    await deleteRecordService.recordDeletedPost(dataDir, req.params.id);

    res.json({ message: '文章删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '删除文章失败' });
  }
});

module.exports = router;
