import React, { useState, useEffect } from 'react';
import { friendApi } from '../services/api.jsx';

const cardStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  marginBottom: '1rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.95rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'white',
  fontFamily: 'inherit',
  outline: 'none',
  marginBottom: '0.75rem',
};

const btnStyle = (variant = 'primary') => ({
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  border: variant === 'outline' ? '1px solid var(--color-border)' : 'none',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: variant === 'primary' ? 'var(--color-accent)' : variant === 'danger' ? 'var(--color-danger)' : 'transparent',
  color: variant === 'outline' ? 'var(--color-text-secondary)' : 'white',
  cursor: 'pointer',
  marginRight: '0.75rem',
});

const addBtnStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  marginBottom: '1.5rem',
};

const friendContentStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'flex-start',
};

const avatarStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  objectFit: 'cover',
  backgroundColor: 'var(--color-bg-secondary)',
};

const emptyStyle = {
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  padding: '2rem',
};

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', url: '', image: '' });

  const fetchFriends = async () => {
    try {
      const res = await friendApi.getFriends();
      setFriends(res.data || []);
    } catch (err) {
      console.error('获取友情链接失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSave = async () => {
    try {
      await friendApi.updateFriends(friends);
      alert('保存成功');
    } catch (err) {
      alert('保存失败');
    }
  };

  const handleAdd = () => {
    setFriends([...friends, { title: '新链接', url: 'https://', image: '' }]);
  };

  const handleDelete = (index) => {
    if (!window.confirm('确定删除这个链接？')) return;
    setFriends(friends.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditForm(friends[index]);
  };

  const handleSaveEdit = () => {
    const updated = [...friends];
    updated[editingIndex] = editForm;
    setFriends(updated);
    setEditingIndex(null);
  };

  const handleChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button style={addBtnStyle} onClick={handleAdd}>添加链接</button>
        <button style={{ ...addBtnStyle, backgroundColor: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} onClick={handleSave}>保存所有</button>
      </div>

      {friends.length === 0 ? (
        <div style={emptyStyle}>
          暂无友情链接
        </div>
      ) : (
        friends.map((friend, index) => (
          <div key={index} style={cardStyle}>
            {editingIndex === index ? (
              <div>
                <input
                  style={inputStyle}
                  value={editForm.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="名称"
                />
                <input
                  style={inputStyle}
                  value={editForm.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="链接"
                />
                <input
                  style={inputStyle}
                  value={editForm.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="图片 URL"
                />
                <button style={btnStyle('outline')} onClick={() => setEditingIndex(null)}>取消</button>
                <button style={btnStyle('primary')} onClick={handleSaveEdit}>确定</button>
              </div>
            ) : (
              <div style={friendContentStyle}>
                <img
                  src={friend.image || 'https://via.placeholder.com/60'}
                  alt=""
                  style={avatarStyle}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{friend.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{friend.url}</div>
                </div>
                <div>
                  <button style={btnStyle('outline')} onClick={() => handleEdit(index)}>编辑</button>
                  <button style={btnStyle('danger')} onClick={() => handleDelete(index)}>删除</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
