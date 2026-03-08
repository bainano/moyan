import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const loginContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-bg)',
  padding: '2rem',
};

const loginBoxStyle = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: 'white',
  borderRadius: 'var(--radius-lg)',
  padding: '2.5rem 2rem',
  boxShadow: 'var(--shadow-md)',
};

const logoStyle = {
  fontFamily: 'var(--font-serif)',
  fontSize: '2rem',
  fontWeight: '500',
  textAlign: 'center',
  marginBottom: '0.5rem',
  color: 'var(--color-text)',
};

const subtitleStyle = {
  textAlign: 'center',
  color: 'var(--color-text-muted)',
  fontSize: '0.875rem',
  marginBottom: '2rem',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
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
  padding: '0.875rem 1rem',
  fontSize: '1rem',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
  fontFamily: 'inherit',
  transition: 'all var(--transition-fast)',
  outline: 'none',
};

const inputFocus = {
  borderColor: 'var(--color-accent)',
  backgroundColor: 'white',
  boxShadow: '0 0 0 3px var(--color-accent-soft)',
};

const buttonStyle = {
  width: '100%',
  padding: '0.875rem 1.5rem',
  fontSize: '1rem',
  fontWeight: '500',
  color: 'white',
  backgroundColor: 'var(--color-accent)',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'all var(--transition-fast)',
  marginTop: '0.5rem',
};

const buttonHover = {
  backgroundColor: '#725c44',
};

const errorStyle = {
  color: 'var(--color-danger)',
  fontSize: '0.875rem',
  textAlign: 'center',
  marginTop: '1rem',
};

export default function Login({ setAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ username, password });
      localStorage.setItem('token', response.data.token);
      setAuth(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginContainerStyle}>
      <div style={loginBoxStyle}>
        <div style={logoStyle}>墨言</div>
        <div style={subtitleStyle}>博客管理系统</div>
        <form style={formStyle} onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle} htmlFor="username">用户名</label>
            <input
              id="username"
              type="text"
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              disabled={loading}
              autoComplete="off"
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => Object.assign(e.target.style, inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, inputStyle)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) Object.assign(e.target.style, buttonHover);
            }}
            onMouseLeave={(e) => {
              if (!loading) Object.assign(e.target.style, buttonStyle);
            }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </div>
  );
}
