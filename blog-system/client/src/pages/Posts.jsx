import React, { useState, useEffect } from 'react';
import { postApi, configApi } from '../services/api.jsx';
import PostEditor from '../components/PostEditor.jsx';

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  marginBottom: '1rem',
  transition: 'all var(--transition-fast)',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.75rem',
};

const titleStyle = {
  fontSize: '1.125rem',
  fontWeight: '500',
  color: 'var(--color-text)',
  margin: 0,
  fontFamily: 'var(--font-serif)',
};

const metaStyle = {
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  display: 'flex',
  gap: '1rem',
  marginBottom: '0.5rem',
};

const excerptStyle = {
  fontSize: '0.95rem',
  color: 'var(--color-text-secondary)',
  lineHeight: '1.6',
  marginBottom: '1rem',
};

const actionsStyle = {
  display: 'flex',
  gap: '0.75rem',
};

const btnStyle = (variant = 'primary') => ({
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  border: variant === 'outline' ? '1px solid var(--color-border)' : 'none',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: variant === 'primary' ? 'var(--color-accent)' : variant === 'danger' ? 'var(--color-danger)' : 'transparent',
  color: variant === 'outline' ? 'var(--color-text-secondary)' : 'white',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
});

const createBtnStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  marginBottom: '1.5rem',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.5rem',
};

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const [postsRes, catsRes] = await Promise.all([
        postApi.getPosts(),
        configApi.getCategories(),
      ]);
      setPosts(postsRes.data);
      setCategories(catsRes.data);
    } catch (err) {
      console.error('获取文章失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定删除这篇文章？')) return;
    try {
      await postApi.deletePost(id);
      fetchPosts();
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditingPost(null);
    fetchPosts();
  };

  if (showEditor) {
    return <PostEditor post={editingPost} categories={categories} onClose={handleEditorClose} />;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={headerStyle}>
        <div>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
            共 {posts.length} 篇文章
          </p>
        </div>
        <button
          style={createBtnStyle}
          onClick={() => setShowEditor(true)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#725c44'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-accent)'}
        >
          新建文章
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>
      ) : (
        posts.map(post => (
          <div key={post.id} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <div>
                <h3 style={titleStyle}>{post.title}</h3>
                <div style={metaStyle}>
                  <span>{post.category || '未分类'}</span>
                  <span>创建: {new Date(post.createdAt || post.date).toLocaleDateString('zh-CN')}</span>
                  {post.updatedAt && <span>更新: {new Date(post.updatedAt).toLocaleDateString('zh-CN')}</span>}
                </div>
              </div>
            </div>
            {post.excerpt && <p style={excerptStyle}>{post.excerpt}</p>}
            <div style={actionsStyle}>
              <button style={btnStyle('outline')} onClick={() => handleEdit(post)}>编辑</button>
              <button style={btnStyle('danger')} onClick={() => handleDelete(post.id)}>删除</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
