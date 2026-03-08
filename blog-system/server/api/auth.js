const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, JWT_SECRET, ADMIN_DATA_PATH } = require('../middleware/auth');
const fileService = require('../services/fileService');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await fileService.readJsonFile(ADMIN_DATA_PATH);

    if (!admin) {
      return res.status(401).json({ error: '管理员不存在' });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: '密码错误' });
    }

    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: admin.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await fileService.readJsonFile(ADMIN_DATA_PATH);

    const passwordMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: '原密码错误' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await fileService.writeJsonFile(ADMIN_DATA_PATH, admin);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '密码修改失败' });
  }
});

router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
