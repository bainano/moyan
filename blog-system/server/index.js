const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./api/auth');
const configRoutes = require('./api/config');
const postRoutes = require('./api/posts');
const uploadRoutes = require('./api/upload');
const friendRoutes = require('./api/friends');
const githubPagesRoutes = require('./api/github-pages');

const app = express();
const PORT = process.env.PORT || 3001;

const BLOG_PAGES_PATH = path.join(__dirname, '../../blog-pages');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/images', express.static(path.join(BLOG_PAGES_PATH, 'images')));

app.use((req, res, next) => {
  req.blogPagesPath = BLOG_PAGES_PATH;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/github-pages', githubPagesRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '墨言博客管理系统运行正常' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
