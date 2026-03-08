import React, { useState, useEffect } from 'react';
import { configApi } from '../services/api.jsx';

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
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'white',
  fontFamily: 'inherit',
  outline: 'none',
  marginBottom: '0.75rem',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
};

const btnStyle = (variant = 'primary') => ({
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  border: variant === 'outline' ? '1px solid var(--color-border)' : 'none',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: variant === 'primary' ? 'var(--color-accent)' : variant === 'danger' ? 'var(--color-danger)' : 'transparent',
  color: variant === 'outline' ? 'var(--color-text-secondary)' : 'white',
  cursor: 'pointer',
  marginLeft: '0.75rem',
});

const addSectionStyle = {
  backgroundColor: 'white',
  borderRadius: 'var(--radius-md)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--color-border-light)',
  marginBottom: '1.5rem',
};

const addBtnStyle = {
  padding: '0.75rem 1.5rem',
  fontSize: '0.95rem',
  backgroundColor: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
};

const categoryMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
  marginBottom: '0.5rem',
};

const categoryNameStyle = {
  fontSize: '1.1rem',
  fontWeight: '500',
  color: 'var(--color-text)',
};

const categoryDescStyle = {
  color: 'var(--color-text-secondary)',
  fontSize: '0.9rem',
  marginTop: '0.5rem',
};

const categoryCountStyle = {
  color: 'var(--color-text-muted)',
  fontSize: '0.85rem',
  marginTop: '0.5rem',
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    try {
      const res = await configApi.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('获取分类失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.name.trim()) return;
    const updated = [...categories, {
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      postIds: []
    }];
    try {
      await configApi.updateCategories(updated);
      setCategories(updated);
      setNewCategory({ name: '', description: '' });
    } catch (err) {
      alert('添加失败');
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('确定删除这个分类？')) return;
    const updated = categories.filter((_, i) => i !== index);
    try {
      await configApi.updateCategories(updated);
      setCategories(updated);
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditValue({
      name: categories[index].name,
      description: categories[index].description
    });
  };

  const handleSaveEdit = async () => {
    if (!editValue.name.trim()) return;
    const updated = [...categories];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: editValue.name.trim(),
      description: editValue.description.trim()
    };
    try {
      await configApi.updateCategories(updated);
      setCategories(updated);
      setEditingIndex(null);
    } catch (err) {
      alert('保存失败');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={addSectionStyle}>
        <input
          style={inputStyle}
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          placeholder="输入新分类名称"
        />
        <textarea
          style={textareaStyle}
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          placeholder="输入分类描述（可选）"
        />
        <button style={addBtnStyle} onClick={handleAdd}>添加分类</button>
      </div>

      {categories.map((cat, index) => (
        <div key={index} style={cardStyle}>
          {editingIndex === index ? (
            <>
              <input
                style={inputStyle}
                value={editValue.name}
                onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                placeholder="分类名称"
              />
              <textarea
                style={textareaStyle}
                value={editValue.description}
                onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
                placeholder="分类描述"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={btnStyle('outline')} onClick={() => setEditingIndex(null)}>取消</button>
                <button style={btnStyle('primary')} onClick={handleSaveEdit}>保存</button>
              </div>
            </>
          ) : (
            <>
              <div style={categoryMetaStyle}>
                <div style={{ flex: 1 }}>
                  <div style={categoryNameStyle}>{cat.name}</div>
                  {cat.description && <div style={categoryDescStyle}>{cat.description}</div>}
                  <div style={categoryCountStyle}>{(cat.postIds || []).length} 篇文章</div>
                </div>
                <div>
                  <button style={btnStyle('outline')} onClick={() => handleEdit(index)}>编辑</button>
                  <button style={btnStyle('danger')} onClick={() => handleDelete(index)}>删除</button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
          暂无分类，点击上方添加
        </div>
      )}
    </div>
  );
}
