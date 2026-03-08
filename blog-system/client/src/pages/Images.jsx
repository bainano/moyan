import React, { useState, useEffect } from 'react';
import { uploadApi } from '../services/api.jsx';

const uploadAreaStyle = {
  border: '2px dashed var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '3rem 2rem',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  marginBottom: '0',
  backgroundColor: 'white',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
  width: '100%',
};

const imageCardStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
};

const imageStyle = {
  width: '100%',
  aspectRatio: '1',
  objectFit: 'cover',
  display: 'block',
  cursor: 'pointer',
};

const deleteBtnStyle = {
  position: 'absolute',
  top: '0.75rem',
  right: '0.75rem',
  backgroundColor: 'var(--color-danger)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '0.35rem 0.75rem',
  fontSize: '0.8rem',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity var(--transition-fast)',
  zIndex: 10,
};

const copyBtnStyle = {
  position: 'absolute',
  top: '0.75rem',
  left: '0.75rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  padding: '0.35rem 0.75rem',
  fontSize: '0.8rem',
  cursor: 'pointer',
  opacity: 0,
  transition: 'opacity var(--transition-fast)',
  zIndex: 10,
};

const infoSectionStyle = {
  padding: '1rem',
  flexShrink: 0,
};

const urlInputStyle = {
  width: '100%',
  padding: '0.6rem 0.8rem',
  fontSize: '0.825rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--color-bg)',
  fontFamily: 'Consolas, Monaco, monospace',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  boxSizing: 'border-box',
};

const emptyStyle = {
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  padding: '3rem 2rem',
  gridColumn: '1 / -1',
};

const toastStyle = {
  position: 'fixed',
  bottom: '2rem',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'var(--color-text)',
  color: 'white',
  padding: '0.875rem 1.75rem',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 1000,
  opacity: 0,
  transition: 'opacity 0.3s',
  pointerEvents: 'none',
};

export default function Images() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [uploadAreaHover, setUploadAreaHover] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const fetchImages = async () => {
    try {
      const res = await uploadApi.getImages();
      setImages(res.data || []);
    } catch (err) {
      console.error('获取图片失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadAreaHover(false);
    setUploading(true);
    try {
      for (const file of files) {
        await uploadApi.uploadImage(file);
      }
      fetchImages();
      showToast('上传成功');
    } catch (err) {
      console.error('上传失败', err);
      showToast('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm('确定删除这张图片？')) return;
    try {
      await uploadApi.deleteImage(filename);
      fetchImages();
      showToast('删除成功');
    } catch (err) {
      console.error('删除失败', err);
      showToast('删除失败');
    }
  };

  const getDisplayUrl = (filename) => {
    return '../images/' + filename;
  };

  const copyUrl = (filename) => {
    navigator.clipboard.writeText(getDisplayUrl(filename));
    showToast('链接已复制');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={gridStyle}>
        <div
          style={{ 
            ...uploadAreaStyle, 
            gridColumn: '1 / -1', 
            position: 'relative',
            borderColor: uploadAreaHover ? 'var(--color-accent)' : 'var(--color-border)'
          }}
          onMouseEnter={() => setUploadAreaHover(true)}
          onMouseLeave={() => setUploadAreaHover(false)}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
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
            {uploading ? '上传中...' : '点击或拖拽图片到此处上传'}
          </label>
        </div>

        {images.length === 0 ? (
          <div style={emptyStyle}>
            暂无图片
          </div>
        ) : (
          images.map((img, index) => (
            <div
              key={index}
              style={imageCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.querySelectorAll('button').forEach(btn => btn.style.opacity = 1);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelectorAll('button').forEach(btn => btn.style.opacity = 0);
              }}
            >
              <img
                src={img.url}
                alt=""
                style={imageStyle}
                onClick={() => copyUrl(img.filename)}
                title="点击复制链接"
              />
              <button
                style={copyBtnStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  copyUrl(img.filename);
                }}
              >
                复制链接
              </button>
              <button
                style={deleteBtnStyle}
                onClick={() => handleDelete(img.filename)}
              >
                删除
              </button>
              <div style={infoSectionStyle}>
                <input
                  type="text"
                  value={getDisplayUrl(img.filename)}
                  readOnly
                  style={urlInputStyle}
                  onClick={() => copyUrl(img.filename)}
                  title="点击复制链接"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ ...toastStyle, opacity: toastVisible ? 1 : 0 }}>
        {toastMessage}
      </div>
    </div>
  );
}
