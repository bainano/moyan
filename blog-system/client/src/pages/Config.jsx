import React, { useState, useEffect } from 'react';
import { configApi } from '../services/api.jsx';

const sectionStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
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
  marginTop: '1rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'white',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'all var(--transition-fast)',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '100px',
  resize: 'vertical',
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
};

const smallBtnStyle = {
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  marginLeft: '0.5rem',
};

const deleteBtnStyle = {
  ...smallBtnStyle,
  backgroundColor: 'var(--color-danger)',
};

const linkRowStyle = {
  display: 'flex',
  gap: '0.75rem',
  marginBottom: '0.75rem',
  alignItems: 'flex-end',
};

const linkInputStyle = {
  flex: 1,
  padding: '0.75rem 1rem',
  fontSize: '0.95rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'white',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'all var(--transition-fast)',
};

export default function Config() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await configApi.getConfig();
      setConfig(res.data);
    } catch (err) {
      console.error('获取配置失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await configApi.updateConfig(config);
      alert('保存成功');
    } catch (err) {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (path, value) => {
    setConfig(prev => {
      const keys = path.split('.');
      const newConfig = { ...prev };
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleLinkChange = (navType, index, field, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      newConfig[navType] = [...(newConfig[navType] || [])];
      newConfig[navType][index] = { ...newConfig[navType][index], [field]: value };
      return newConfig;
    });
  };

  const handleAddLink = (navType) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      newConfig[navType] = [...(newConfig[navType] || []), { text: '', url: '' }];
      return newConfig;
    });
  };

  const handleDeleteLink = (navType, index) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      newConfig[navType] = newConfig[navType].filter((_, i) => i !== index);
      return newConfig;
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)' }}>网站信息</h3>
        <label style={labelStyle}>网站名称</label>
        <input
          style={inputStyle}
          value={config.site?.name || ''}
          onChange={(e) => handleChange('site.name', e.target.value)}
        />
        <label style={labelStyle}>网站描述</label>
        <textarea
          style={textareaStyle}
          value={config.site?.description || ''}
          onChange={(e) => handleChange('site.description', e.target.value)}
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)' }}>页面头部</h3>
        <label style={labelStyle}>标题</label>
        <input
          style={inputStyle}
          value={config.header?.title || ''}
          onChange={(e) => handleChange('header.title', e.target.value)}
        />
        <label style={labelStyle}>副标题</label>
        <input
          style={inputStyle}
          value={config.header?.subtitle || ''}
          onChange={(e) => handleChange('header.subtitle', e.target.value)}
        />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-serif)' }}>页脚</h3>
        <label style={labelStyle}>描述第一行</label>
        <input
          style={inputStyle}
          value={config.footer?.description || ''}
          onChange={(e) => handleChange('footer.description', e.target.value)}
        />
        <label style={labelStyle}>描述第二行</label>
        <input
          style={inputStyle}
          value={config.footer?.descriptionLine2 || ''}
          onChange={(e) => handleChange('footer.descriptionLine2', e.target.value)}
        />
        <label style={labelStyle}>版权信息</label>
        <input
          style={inputStyle}
          value={config.footer?.copyright || ''}
          onChange={(e) => handleChange('footer.copyright', e.target.value)}
        />
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>顶部导航栏</h3>
          <button style={smallBtnStyle} onClick={() => handleAddLink('headerNav')}>
            + 添加链接
          </button>
        </div>
        {(config.headerNav || []).map((link, index) => (
          <div key={index} style={linkRowStyle}>
            <input
              style={linkInputStyle}
              placeholder="链接文字"
              value={link.text}
              onChange={(e) => handleLinkChange('headerNav', index, 'text', e.target.value)}
            />
            <input
              style={linkInputStyle}
              placeholder="链接地址"
              value={link.url}
              onChange={(e) => handleLinkChange('headerNav', index, 'url', e.target.value)}
            />
            <button style={deleteBtnStyle} onClick={() => handleDeleteLink('headerNav', index)}>
              删除
            </button>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)' }}>底部导航栏</h3>
          <button style={smallBtnStyle} onClick={() => handleAddLink('footerNav')}>
            + 添加链接
          </button>
        </div>
        {(config.footerNav || []).map((link, index) => (
          <div key={index} style={linkRowStyle}>
            <input
              style={linkInputStyle}
              placeholder="链接文字"
              value={link.text}
              onChange={(e) => handleLinkChange('footerNav', index, 'text', e.target.value)}
            />
            <input
              style={linkInputStyle}
              placeholder="链接地址"
              value={link.url}
              onChange={(e) => handleLinkChange('footerNav', index, 'url', e.target.value)}
            />
            <button style={deleteBtnStyle} onClick={() => handleDeleteLink('footerNav', index)}>
              删除
            </button>
          </div>
        ))}
      </div>

      <button
        style={{ ...btnStyle, opacity: saving ? 0.7 : 1 }}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '保存中...' : '保存配置'}
      </button>
    </div>
  );
}
