import React, { useState, useEffect } from 'react';
import { postApi, uploadApi } from '../services/api.jsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const containerStyle = {
  width: '100%',
};

const backBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--color-accent)',
  fontSize: '0.95rem',
  cursor: 'pointer',
  padding: '0.5rem 0',
  marginBottom: '1.5rem',
  display: 'inline-flex',
  alignItems: 'center',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const groupStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem',
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

const textareaStyle = {
  ...inputStyle,
  minHeight: '350px',
  resize: 'vertical',
  lineHeight: '1.75',
  fontFamily: 'Consolas, Monaco, monospace',
  fontSize: '0.95rem',
};

const editorLayoutStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
  gap: '1.5rem',
  minHeight: '400px',
};

const previewStyle = {
  backgroundColor: 'white',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  overflowY: 'auto',
  maxHeight: '600px',
  lineHeight: '1.8',
};

const actionsStyle = {
  display: 'flex',
  gap: '1rem',
  marginTop: '1.5rem',
};

const btnStyle = (variant = 'default') => ({
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  border: variant === 'primary' ? 'none' : variant === 'danger' ? 'none' : '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: variant === 'primary' ? 'var(--color-accent)' : variant === 'danger' ? 'var(--color-danger)' : 'white',
  color: variant === 'default' ? 'var(--color-text)' : 'white',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
});

const uploadAreaStyle = {
  border: '2px dashed var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '2.5rem 2rem',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  backgroundColor: 'white',
};

const metaInfoStyle = {
  fontSize: '0.875rem',
  color: 'var(--color-text-muted)',
  marginBottom: '1.5rem',
  display: 'flex',
  gap: '2rem',
};

const imageSelectorStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '0.75rem',
  marginTop: '1rem',
};

const imageOptionStyle = {
  border: '2px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '4px',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
};

const imageOptionSelectedStyle = {
  borderColor: 'var(--color-accent)',
  boxShadow: '0 0 0 2px var(--color-accent)',
};

const selectorTabStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '1rem',
};

const tabBtnStyle = (active) => ({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: active ? 'var(--color-accent)' : 'var(--color-bg)',
  color: active ? 'white' : 'var(--color-text-secondary)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  transition: 'all var(--transition-fast)',
});

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

export default function PostEditor({ post, categories, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    image: '',
    content: '',
    ignore: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [metaInfo, setMetaInfo] = useState({
    createdAt: null,
    updatedAt: null,
  });
  const [images, setImages] = useState([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [selectorTab, setSelectorTab] = useState('upload');
  const [uploadAreaHover, setUploadAreaHover] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const fetchImages = async () => {
    try {
      const res = await uploadApi.getImages();
      setImages(res.data || []);
    } catch (err) {
      console.error('获取图片失败', err);
    }
  };

  useEffect(() => {
    if (post) {
      const loadPost = async () => {
        try {
          const res = await postApi.getPost(post.id);
          setFormData({
            title: res.data.title || '',
            excerpt: res.data.excerpt || '',
            category: res.data.category || '',
            image: res.data.image || '',
            content: res.data.content || '',
            ignore: res.data.ignore || false,
          });
          setMetaInfo({
            createdAt: res.data.createdAt || res.data.date,
            updatedAt: res.data.updatedAt,
          });
        } catch (err) {
          console.error('加载文章失败', err);
        }
      };
      loadPost();
    }
    fetchImages();
  }, [post]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadAreaHover(false);
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      setFormData(prev => ({ ...prev, image: res.data.url }));
    } catch (err) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
    };

    try {
      if (post) {
        await postApi.updatePost(post.id, data);
      } else {
        await postApi.createPost(data);
      }
      onClose();
    } catch (err) {
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <button style={backBtnStyle} onClick={onClose}>← 返回</button>
      <h2 style={{ margin: '0 0 1.5rem 0', fontFamily: 'var(--font-serif)' }}>
        {post ? '编辑文章' : '新建文章'}
      </h2>
      {metaInfo.createdAt && (
        <div style={metaInfoStyle}>
          <span>创建时间：{new Date(metaInfo.createdAt).toLocaleString('zh-CN')}</span>
          {metaInfo.updatedAt && (
            <span>更新时间：{new Date(metaInfo.updatedAt).toLocaleString('zh-CN')}</span>
          )}
        </div>
      )}

      <form style={formStyle} onSubmit={handleSubmit}>
        <div>
          <label style={labelStyle}>标题</label>
          <input
            style={inputStyle}
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="输入文章标题"
            required
          />
        </div>

        <div style={groupStyle}>
          <div>
            <label style={labelStyle}>分类</label>
            <select
              style={inputStyle}
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">选择分类</option>
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>显示设置</label>
            <div style={checkboxContainerStyle}>
              <input
                type="checkbox"
                style={checkboxStyle}
                checked={formData.ignore}
                onChange={(e) => handleChange('ignore', e.target.checked)}
              />
              <label style={{ ...labelStyle, marginBottom: 0 }}>在列表中隐藏此文章</label>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', margin: 0 }}>
              勾选后文章不会在文章列表中显示，但可通过链接直接访问
            </p>
          </div>
        </div>

        <div>
          <label style={labelStyle}>封面图片</label>
          {formData.image ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={formData.image} alt="" style={{ maxWidth: '400px', borderRadius: 'var(--radius-md)', display: 'block' }} />
              <button
                type="button"
                style={{ 
                  position: 'absolute', 
                  top: '0.75rem', 
                  right: '0.75rem', 
                  ...btnStyle('danger'), 
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem',
                }}
                onClick={() => handleChange('image', '')}
              >
                移除图片
              </button>
            </div>
          ) : (
            <div>
              <div style={selectorTabStyle}>
                <button 
                  type="button" 
                  style={tabBtnStyle(selectorTab === 'upload')}
                  onClick={() => setSelectorTab('upload')}
                >
                  上传图片
                </button>
                <button 
                  type="button" 
                  style={tabBtnStyle(selectorTab === 'select')}
                  onClick={() => setSelectorTab('select')}
                >
                  选择已有
                </button>
                <button 
                  type="button" 
                  style={tabBtnStyle(selectorTab === 'url')}
                  onClick={() => setSelectorTab('url')}
                >
                  网络链接
                </button>
              </div>
              
              {selectorTab === 'upload' ? (
                <div 
                  style={{ 
                    ...uploadAreaStyle, 
                    position: 'relative',
                    borderColor: uploadAreaHover ? 'var(--color-accent)' : 'var(--color-border)'
                  }}
                  onMouseEnter={() => setUploadAreaHover(true)}
                  onMouseLeave={() => setUploadAreaHover(false)}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="image-upload" 
                    style={{ 
                      cursor: 'pointer', 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {uploading ? '上传中...' : '点击上传图片'}
                  </label>
                </div>
              ) : selectorTab === 'url' ? (
                <div>
                  <input
                    style={inputStyle}
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="输入图片链接 (https://...)"
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      style={btnStyle('primary')}
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          handleChange('image', imageUrlInput.trim());
                        }
                      }}
                      disabled={!imageUrlInput.trim()}
                    >
                      确认使用
                    </button>
                    {imageUrlInput && (
                      <img
                        src={imageUrlInput}
                        alt="预览"
                        style={{ 
                          maxWidth: '150px', 
                          maxHeight: '100px', 
                          borderRadius: 'var(--radius-md)',
                          objectFit: 'cover'
                        }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div style={imageSelectorStyle}>
                  {images.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                      暂无图片，请先上传
                    </div>
                  ) : (
                    images.map((img, index) => (
                      <div
                        key={index}
                        style={{
                          ...imageOptionStyle,
                          ...(formData.image === img.url ? imageOptionSelectedStyle : {})
                        }}
                        onClick={() => handleChange('image', img.url)}
                      >
                        <img
                          src={img.url}
                          alt=""
                          style={{ 
                            width: '100%', 
                            aspectRatio: '1', 
                            objectFit: 'cover',
                            borderRadius: 'calc(var(--radius-md) - 4px)'
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>摘要</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px' }}
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            placeholder="文章摘要"
          />
        </div>

        <div>
          <label style={labelStyle}>内容（Markdown）</label>
          <div style={editorLayoutStyle}>
            <textarea
              style={textareaStyle}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="使用 Markdown 编写文章内容..."
            />
            <div style={previewStyle}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content || '预览区域'}</ReactMarkdown>
            </div>
          </div>
        </div>

        <div style={actionsStyle}>
          <button type="button" style={btnStyle()} onClick={onClose} disabled={loading}>
            取消
          </button>
          <button type="submit" style={{ ...btnStyle('primary'), opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
