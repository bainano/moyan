import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { githubPagesApi } from '../services/api.jsx';

const DeployContext = createContext();

export const useDeploy = () => useContext(DeployContext);

const sidebarStyle = {
  width: 'var(--sidebar-width)',
  height: '100vh',
  backgroundColor: 'var(--color-bg-secondary)',
  borderRight: '1px solid var(--color-border)',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  left: 0,
  top: 0,
};

const logoStyle = {
  padding: '2rem 1.5rem',
  fontFamily: 'var(--font-serif)',
  fontSize: '1.5rem',
  fontWeight: '500',
  color: 'var(--color-text)',
  borderBottom: '1px solid var(--color-border)',
};

const navStyle = {
  flex: 1,
  padding: '1rem 0',
  overflowY: 'auto',
};

const navItemStyle = (active) => ({
  display: 'block',
  padding: '0.875rem 1.5rem',
  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  backgroundColor: active ? 'var(--color-accent-soft)' : 'transparent',
  borderLeft: active ? '3px solid var(--color-accent)' : '3px solid transparent',
});

const navItemHover = {
  color: 'var(--color-text)',
  backgroundColor: 'var(--color-bg)',
};

const quickActionsStyle = {
  padding: '1rem 1.5rem',
  borderTop: '1px solid var(--color-border)',
};

const quickBtnStyle = (variant = 'default') => ({
  width: '100%',
  padding: '0.75rem 1rem',
  marginBottom: '0.5rem',
  backgroundColor: variant === 'primary' ? 'var(--color-accent)' : 'transparent',
  border: variant === 'primary' ? 'none' : '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: variant === 'primary' ? 'white' : 'var(--color-text-secondary)',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  opacity: variant === 'deploying' ? 0.7 : 1,
});

const statusStyle = (type) => ({
  padding: '0.75rem 1rem',
  marginBottom: '0.5rem',
  borderRadius: 'var(--radius-md)',
  fontSize: '0.825rem',
  backgroundColor: type === 'success' ? '#e8f5e9' : type === 'error' ? '#ffebee' : '#fff3e0',
  color: type === 'success' ? '#2e7d32' : type === 'error' ? '#c62828' : '#e65100',
  textAlign: 'center',
});

const logoutSectionStyle = {
  padding: '1rem 1.5rem',
  borderTop: '1px solid var(--color-border)',
};

const logoutBtnStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: 'transparent',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text-secondary)',
  fontSize: '0.875rem',
  transition: 'all var(--transition-fast)',
};

const mainStyle = {
  marginLeft: 'var(--sidebar-width)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  width: 'calc(100% - var(--sidebar-width))',
};

const headerStyle = {
  padding: '1.5rem var(--content-padding)',
  backgroundColor: 'var(--color-bg)',
  borderBottom: '1px solid var(--color-border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const contentStyle = {
  flex: 1,
  padding: 'var(--content-padding)',
  overflowY: 'auto',
  width: '100%',
};

const navItems = [
  { key: '', label: '控制台' },
  { key: 'posts', label: '文章管理' },
  { key: 'config', label: '网站配置' },
  { key: 'categories', label: '分类管理' },
  { key: 'friends', label: '友情链接' },
  { key: 'images', label: '图片管理' },
  { key: 'github-pages', label: 'GitHub Pages' },
];

export default function Layout({ children, setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/' ? '' : location.pathname.replace('/', ''));
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState(null);
  const [deployStep, setDeployStep] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await githubPagesApi.getConfig();
        setWebsiteUrl(res.data?.websiteUrl || '');
      } catch (err) {
        console.error('获取配置失败', err);
      }
    };
    fetchConfig();
  }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployStatus({ type: 'info', message: '准备部署...' });
    setDeployStep('准备部署...');
    try {
      await githubPagesApi.deploy();
      
      const checkStatus = setInterval(async () => {
        try {
          const res = await githubPagesApi.getStatus();
          setDeployStep(res.data.deployStep || '');
          
          if (res.data.lastStatus === 'success') {
            clearInterval(checkStatus);
            setDeploying(false);
            setDeployStatus({ type: 'success', message: '部署成功！' });
            setDeployStep('部署完成');
          } else if (res.data.lastStatus === 'failed') {
            clearInterval(checkStatus);
            setDeploying(false);
            setDeployStatus({ type: 'error', message: '部署失败：' + (res.data.lastError || '未知错误') });
          }
        } catch (err) {
          clearInterval(checkStatus);
          setDeploying(false);
          setDeployStatus({ type: 'error', message: '获取状态失败' });
        }
      }, 500);
      
    } catch (err) {
      setDeploying(false);
      setDeployStatus({ type: 'error', message: '触发部署失败' });
    }
  };

  const handleVisit = () => {
    if (websiteUrl) {
      window.open('https://' + websiteUrl, '_blank');
    } else {
      setDeployStatus({ type: 'error', message: '请先配置网站网址' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  const handleNavClick = (key) => {
    setActiveTab(key);
    navigate('/' + key);
  };

  return (
    <DeployContext.Provider value={{ deploying, deployStatus, setDeploying, setDeployStatus, deployStep, setDeployStep }}>
      <div style={{ display: 'flex' }}>
        <aside style={sidebarStyle}>
          <div style={logoStyle}>墨言 · 管理</div>
          <nav style={navStyle}>
            {navItems.map(item => (
              <div
                key={item.key}
                style={navItemStyle(activeTab === item.key)}
                onClick={() => handleNavClick(item.key)}
                onMouseEnter={(e) => {
                  if (activeTab !== item.key) {
                    Object.assign(e.target.style, navItemHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== item.key) {
                    Object.assign(e.target.style, navItemStyle(false));
                  }
                }}
              >
                {item.label}
              </div>
            ))}
          </nav>
          <div style={quickActionsStyle}>
            {deployStatus && (
              <div style={statusStyle(deployStatus.type)}>
                {deploying && deployStep ? deployStep : deployStatus.message}
              </div>
            )}
            <button
              style={quickBtnStyle(deploying ? 'deploying' : 'primary')}
              onClick={handleDeploy}
              disabled={deploying}
              onMouseEnter={(e) => {
                if (!deploying) {
                  e.target.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = '1';
              }}
            >
              {deploying ? '部署中...' : '快捷部署'}
            </button>
            <button
              style={quickBtnStyle()}
              onClick={handleVisit}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--color-bg)';
                e.target.style.color = 'var(--color-text)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--color-text-secondary)';
              }}
            >
              访问网站
            </button>
          </div>
          <div style={logoutSectionStyle}>
            <button
              style={logoutBtnStyle}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--color-danger)';
                e.target.style.borderColor = 'var(--color-danger)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.color = 'var(--color-text-secondary)';
              }}
            >
              退出登录
            </button>
          </div>
        </aside>
        <main style={mainStyle}>
          <header style={headerStyle}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {navItems.find(n => n.key === activeTab)?.label || '控制台'}
            </h2>
          </header>
          <div style={contentStyle}>
            {children}
          </div>
        </main>
      </div>
    </DeployContext.Provider>
  );
}
