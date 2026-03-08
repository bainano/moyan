const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const fsSync = require('fs');
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');
const deleteRecordService = require('../services/deleteRecordService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(req.blogPagesPath, 'images');
    try {
      fsSync.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      console.error('创建上传目录失败:', err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

router.post('/image', authenticateToken, (req, res) => {
  const uploadHandler = upload.single('image');
  
  uploadHandler(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer错误:', err);
      return res.status(400).json({ error: '文件上传错误: ' + err.message });
    } else if (err) {
      console.error('上传错误:', err);
      return res.status(400).json({ error: err.message || '上传失败' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }

    res.json({
      message: '上传成功',
      filename: req.file.filename,
      url: '/api/images/' + req.file.filename
    });
  });
});

router.get('/images', authenticateToken, async (req, res) => {
  try {
    const imagesDir = path.join(req.blogPagesPath, 'images');
    
    try {
      await fileService.ensureDirectory(imagesDir);
      const files = await fs.readdir(imagesDir);
      
      const images = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      }).map(file => ({
        filename: file,
        url: '/api/images/' + file
      }));
      
      res.json(images);
    } catch (err) {
      console.error('读取图片目录失败:', err);
      res.json([]);
    }
  } catch (error) {
    console.error('获取图片列表失败:', error);
    res.status(500).json({ error: '获取图片列表失败' });
  }
});

router.delete('/images/:filename', authenticateToken, async (req, res) => {
  try {
    const imagePath = path.join(req.blogPagesPath, 'images', req.params.filename);
    const deleted = await fileService.deleteFile(imagePath);
    if (deleted) {
      const dataDir = path.join(__dirname, '../data');
      await deleteRecordService.recordDeletedImage(dataDir, req.params.filename);
      res.json({ message: '删除成功' });
    } else {
      res.status(404).json({ error: '图片不存在' });
    }
  } catch (error) {
    console.error('删除图片失败:', error);
    res.status(500).json({ error: '删除图片失败' });
  }
});

module.exports = router;
