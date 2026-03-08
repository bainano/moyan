const jwt = require('jsonwebtoken');
const path = require('path');
const fileService = require('../services/fileService');

const JWT_SECRET = 'moyan-blog-secret-key-2024';
const ADMIN_DATA_PATH = path.join(__dirname, '../data/admin.json');

async function initAdmin() {
  const adminExists = await fileService.readJsonFile(ADMIN_DATA_PATH);
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const defaultAdmin = {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10)
    };
    await fileService.writeJsonFile(ADMIN_DATA_PATH, defaultAdmin);
  }
}

initAdmin();

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '无效的认证令牌' });
    }
    req.user = user;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
  ADMIN_DATA_PATH
};
