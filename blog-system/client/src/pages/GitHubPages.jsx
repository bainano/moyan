import React, { useState, useEffect } from 'react';
import { githubPagesApi } from '../services/api.jsx';
import { useDeploy } from '../components/Layout.jsx';

const containerStyle = {
  width: '100%',
  maxWidth: '800px',
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

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '2rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  marginBottom: '1.5rem',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '500',
  color: 'var(--color-text)',
  marginBottom: '0.5rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.875rem 1.125rem',
  fontSize: '1rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'white',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'all var(--transition-fast)',
  boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const checkboxContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const checkboxStyle = {
  width: '20px',
  height: '20px',
  cursor: 'pointer',
};

const btnStyle = (variant = 'primary') => ({
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  border: variant === 'primary' ? 'none' : '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: variant === 'primary' ? 'var(--color-accent)' : 'white',
  color: variant === 'primary' ? 'white' : 'var(--color-text)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
});

const actionsStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1.5rem',
};

const helpTextStyle = {
  fontSize: '0.825rem',
  color: 'var(--color-text-muted)',
  marginTop: '0.5rem',
  lineHeight: '1.6',
};

const formGroupStyle = {
  marginBottom: '1.5rem',
};

const urlInputContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
};

const urlPrefixStyle = {
  ...inputStyle,
  width: '120px',
  backgroundColor: 'var(--color-bg)',
  cursor: 'default',
};

export default function GitHubPages() {
  const { deploying, setDeploying, setDeployStatus, setDeployStep } = useDeploy();
  const [config, setConfig] = useState({
    websiteUrl: '',
    apiServer: 'api.github.com',
    username: '',
    repository: '',
    branch: 'gh-pages',
    token: '',
    parallelUploads: 1,
    apiRateLimiting: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const configRes = await githubPagesApi.getConfig();
      setConfig({
        websiteUrl: configRes.data?.websiteUrl || '',
        apiServer: configRes.data?.apiServer || 'api.github.com',
        username: configRes.data?.username || '',
        repository: configRes.data?.repository || '',
        branch: configRes.data?.branch || 'gh-pages',
        token: configRes.data?.token || '',
        parallelUploads: configRes.data?.parallelUploads || 1,
        apiRateLimiting: true,
      });
    } catch (err) {
      console.error('获取数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await githubPagesApi.updateConfig(config);
      alert('配置保存成功');
    } catch (err) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeploy = async () => {
    if (!config.username || !config.repository) {
      setDeployStatus({ type: 'error', message: '请先配置用户名和仓库名' });
      return;
    }
    if (!config.token) {
      setDeployStatus({ type: 'error', message: '请先配置 Personal Access Token' });
      return;
    }
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>GitHub Pages 部署</h1>
        <p style={descStyle}>配置并一键部署博客到 GitHub Pages</p>
      </div>

      <div style={cardStyle}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>网站网址</label>
          <div style={urlInputContainerStyle}>
            <select 
              style={urlPrefixStyle}
              value="https://"
              disabled
            >
              <option value="https://">https://</option>
              <option value="http://">http://</option>
            </select>
            <input
              style={inputStyle}
              value={config.websiteUrl}
              onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
              placeholder="your-username.github.io/your-repo"
            />
          </div>
          <p style={helpTextStyle}>
            这将是你的 GitHub 仓库路径，应使用以下格式：<br />
            <strong>YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME</strong>。<br />
            如果你使用自定义域名，只需在此字段填写自定义域名即可。
          </p>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>API 服务器</label>
          <input
            style={inputStyle}
            value={config.apiServer}
            onChange={(e) => setConfig({ ...config, apiServer: e.target.value })}
            placeholder="api.github.com"
          />
          <p style={helpTextStyle}>
            仅当你使用自己的 GitHub 实例（企业版）时才需要更改此值。
          </p>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>用户名 / 组织名</label>
          <input
            style={inputStyle}
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            placeholder="your-username"
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>仓库名</label>
          <input
            style={inputStyle}
            value={config.repository}
            onChange={(e) => setConfig({ ...config, repository: e.target.value })}
            placeholder="your-repo"
          />
          <p style={helpTextStyle}>
            填写仓库的名称，例如：my-blog
          </p>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>分支</label>
          <input
            style={inputStyle}
            value={config.branch}
            onChange={(e) => setConfig({ ...config, branch: e.target.value })}
            placeholder="gh-pages"
          />
          <p style={helpTextStyle}>
            示例：<em>gh-pages</em>、<em>docs</em> 或 <em>main</em>。
          </p>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>令牌</label>
          <input
            style={inputStyle}
            type="password"
            value={config.token}
            onChange={(e) => setConfig({ ...config, token: e.target.value })}
            placeholder="ghp_xxxxxxxxxx"
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>并行上传数</label>
          <select
            style={selectStyle}
            value={config.parallelUploads}
            onChange={(e) => setConfig({ ...config, parallelUploads: parseInt(e.target.value) })}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
          <p style={helpTextStyle}>
            更多并行操作可能会在慢速网络连接时导致上传错误，或因 API 速率限制遇到 403 错误。
          </p>
        </div>

        <div style={formGroupStyle}>
          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              style={checkboxStyle}
              checked={true}
              disabled={true}
            />
            <label style={{ ...labelStyle, marginBottom: 0 }}>API 速率限制</label>
          </div>
          <p style={helpTextStyle}>
            仅当你使用禁用了 API 速率限制的 GitHub Enterprise 时才禁用此选项。否则禁用此选项可能会导致部署错误。
          </p>
        </div>

        <div style={actionsStyle}>
          <button
            style={btnStyle()}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
          <button
            style={{ ...btnStyle('primary'), opacity: deploying ? 0.7 : 1 }}
            onClick={handleDeploy}
            disabled={deploying || !config.username || !config.repository}
          >
            {deploying ? '部署中...' : '立即部署'}
          </button>
        </div>
      </div>
    </div>
  );
}
