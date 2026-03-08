const express = require('express');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const configPath = path.join(req.blogPagesPath, 'config.json');
    const config = await fileService.readJsonFile(configPath);
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const configPath = path.join(req.blogPagesPath, 'config.json');
    await fileService.writeJsonFile(configPath, req.body);
    res.json({ message: '配置更新成功', config: req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新配置失败' });
  }
});

router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categoriesPath = path.join(req.blogPagesPath, 'categories', 'categories.json');
    const data = await fileService.readJsonFile(categoriesPath);
    res.json(data.categories || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取分类失败' });
  }
});

router.put('/categories', authenticateToken, async (req, res) => {
  try {
    const categoriesPath = path.join(req.blogPagesPath, 'categories', 'categories.json');
    const data = { categories: req.body };
    await fileService.writeJsonFile(categoriesPath, data);
    res.json({ message: '分类更新成功', categories: req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新分类失败' });
  }
});

module.exports = router;
