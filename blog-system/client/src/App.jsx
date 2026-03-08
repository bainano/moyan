import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authApi } from './services/api.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Posts from './pages/Posts.jsx';
import Config from './pages/Config.jsx';
import Categories from './pages/Categories.jsx';
import Friends from './pages/Friends.jsx';
import Images from './pages/Images.jsx';
import GitHubPages from './pages/GitHubPages.jsx';
import Layout from './components/Layout.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        await authApi.verify();
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>加载中...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
        <Route path="/" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/posts" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Posts />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/config" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Config />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/categories" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Categories />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/friends" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Friends />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/images" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Images />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/github-pages" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <GitHubPages />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
