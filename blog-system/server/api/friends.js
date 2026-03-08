const express = require('express');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const configPath = path.join(req.blogPagesPath, 'config.json');
    const config = await fileService.readJsonFile(configPath);
    res.json(config?.friends || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '获取友情链接失败' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const configPath = path.join(req.blogPagesPath, 'config.json');
    const config = await fileService.readJsonFile(configPath) || {};
    config.friends = req.body;
    await fileService.writeJsonFile(configPath, config);
    res.json({ message: '友情链接更新成功', friends: req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '更新友情链接失败' });
  }
});

module.exports = router;
