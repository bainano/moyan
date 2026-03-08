import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postApi, configApi } from '../services/api.jsx';

const containerStyle = {
  width: '100%',
  maxWidth: '1000px',
};

const headerStyle = {
  marginBottom: '2rem',
};

const titleStyle = {
  fontSize: '1.75rem',
  fontWeight: '600',
  color: 'var(--color-text)',
  margin: '0 0 0.5rem 0',
  fontFamily: 'var(--font-serif)',
};

const descStyle = {
  fontSize: '0.95rem',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem',
};

const statCardStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  transition: 'all var(--transition-fast)',
};

const statNumberStyle = {
  fontSize: '2.5rem',
  fontWeight: '600',
  color: 'var(--color-accent)',
  margin: '0 0 0.25rem 0',
};

const statLabelStyle = {
  fontSize: '0.95rem',
  color: 'var(--color-text-secondary)',
  margin: 0,
};

const sectionStyle = {
  marginBottom: '2rem',
};

const sectionTitleStyle = {
  fontSize: '1.125rem',
  fontWeight: '600',
  color: 'var(--color-text)',
  margin: '0 0 1rem 0',
};

const quickActionsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '1rem',
};

const actionCardStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1.25rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  textDecoration: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
};

const actionIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-accent-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
};

const actionTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '500',
  color: 'var(--color-text)',
  margin: 0,
};

const actionDescStyle = {
  fontSize: '0.825rem',
  color: 'var(--color-text-muted)',
  margin: 0,
};

const recentPostsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const postItemStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1rem 1.25rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  transition: 'all var(--transition-fast)',
  cursor: 'pointer',
};

const postTitleStyle = {
  fontSize: '0.95rem',
  color: 'var(--color-text)',
  margin: 0,
};

const postMetaStyle = {
  fontSize: '0.825rem',
  color: 'var(--color-text-muted)',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    postCount: 0,
    categoryCount: 0,
    friendCount: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [postsRes, configRes] = await Promise.all([
        postApi.getPosts(),
        configApi.getConfig(),
      ]);
      
      const posts = postsRes.data || [];
      setStats({
        postCount: posts.length,
        categoryCount: configRes.data?.categories?.length || 0,
        friendCount: configRes.data?.friends?.length || 0,
      });
      setRecentPosts(posts.slice(0, 5));
    } catch (err) {
      console.error('获取数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const quickActions = [
    {
      key: 'posts',
      icon: '✏️',
      title: '文章管理',
      desc: '管理所有文章',
      onClick: () => navigate('/posts'),
    },
    {
      key: 'categories',
      icon: '📁',
      title: '分类管理',
      desc: '管理文章分类',
      onClick: () => navigate('/categories'),
    },
    {
      key: 'images',
      icon: '🖼️',
      title: '图片管理',
      desc: '管理上传的图片',
      onClick: () => navigate('/images'),
    },
    {
      key: 'config',
      icon: '⚙️',
      title: '网站配置',
      desc: '配置网站信息',
      onClick: () => navigate('/config'),
    },
    {
      key: 'friends',
      icon: '🔗',
      title: '友情链接',
      desc: '管理友情链接',
      onClick: () => navigate('/friends'),
    },
    {
      key: 'github',
      icon: '🚀',
      title: 'GitHub Pages',
      desc: '一键部署博客',
      onClick: () => navigate('/github-pages'),
    },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>控制台</h1>
        <p style={descStyle}>欢迎回来，这是你的博客概览</p>
      </div>

      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>{stats.postCount}</p>
          <p style={statLabelStyle}>篇文章</p>
        </div>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>{stats.categoryCount}</p>
          <p style={statLabelStyle}>个分类</p>
        </div>
        <div style={statCardStyle}>
          <p style={statNumberStyle}>{stats.friendCount}</p>
          <p style={statLabelStyle}>个友链</p>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>快捷操作</h2>
        <div style={quickActionsStyle}>
          {quickActions.map((action) => (
            <div
              key={action.key}
              style={actionCardStyle}
              onClick={action.onClick}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={actionIconStyle}>{action.icon}</div>
              <p style={actionTitleStyle}>{action.title}</p>
              <p style={actionDescStyle}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {recentPosts.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>最近文章</h2>
          <div style={recentPostsStyle}>
            {recentPosts.map((post) => (
              <div
                key={post.id}
                style={postItemStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-bg)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                }}
              >
                <div>
                  <p style={postTitleStyle}>{post.title}</p>
                  <p style={postMetaStyle}>{post.category || '未分类'}</p>
                </div>
                <p style={postMetaStyle}>
                  {new Date(post.createdAt || post.date).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
