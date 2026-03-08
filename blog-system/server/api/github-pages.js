const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const https = require('https');
const { authenticateToken } = require('../middleware/auth');
const fileService = require('../services/fileService');
const deleteRecordService = require('../services/deleteRecordService');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const router = express.Router();

const getConfigPath = (req) => {
  return path.join(__dirname, '../data/github-pages.json');
};

const getAllFiles = (dirPath, arrayOfFiles = [], basePath = dirPath) => {
  const files = fs.readdirSync(dirPath);
  
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles, basePath);
    } else {
      const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
      arrayOfFiles.push({
        path: relativePath,
        fullPath: filePath
      });
    }
  });
  
  return arrayOfFiles;
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateDeployStatus = async (configPath, status, step, error = null) => {
  const config = await fileService.readJsonFile(configPath) || {};
  config.lastStatus = status;
  config.deployStep = step;
  if (error) config.lastError = error;
  await fileService.writeJsonFile(configPath, config);
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const configPath = getConfigPath(req);
    const config = await fileService.readJsonFile(configPath) || {};
    res.json(config);
  } catch (error) {
    console.error('获取配置失败', error);
    res.status(500).json({ error: '获取配置失败' });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const configPath = getConfigPath(req);
    const {
      websiteUrl,
      apiServer,
      username,
      repository,
      branch,
      token,
      parallelUploads
    } = req.body;
    
    const existingConfig = await fileService.readJsonFile(configPath) || {};
    
    const newConfig = {
      ...existingConfig,
      websiteUrl: websiteUrl !== undefined ? websiteUrl : existingConfig.websiteUrl,
      apiServer: apiServer !== undefined ? apiServer : existingConfig.apiServer,
      username: username !== undefined ? username : existingConfig.username,
      repository: repository !== undefined ? repository : existingConfig.repository,
      branch: branch !== undefined ? branch : existingConfig.branch,
      token: token !== undefined ? token : existingConfig.token,
      parallelUploads: parallelUploads !== undefined ? parallelUploads : existingConfig.parallelUploads,
      apiRateLimiting: true
    };
    
    await fileService.writeJsonFile(configPath, newConfig);
    res.json({ message: '配置保存成功', config: newConfig });
  } catch (error) {
    console.error('保存配置失败', error);
    res.status(500).json({ error: '保存配置失败' });
  }
});

router.post('/deploy', authenticateToken, async (req, res) => {
  try {
    const configPath = getConfigPath(req);
    const config = await fileService.readJsonFile(configPath);
    
    if (!config || !config.username || !config.repository) {
      return res.status(400).json({ error: '请先配置用户名和仓库名' });
    }
    if (!config.token) {
      return res.status(400).json({ error: '请先配置 Personal Access Token' });
    }

    await updateDeployStatus(configPath, 'deploying', '准备部署...');
    res.json({ message: '部署已开始', status: 'deploying' });

    (async () => {
      try {
        const { username: owner, repository: repo, branch, token, apiServer, apiRateLimiting } = config;
        const blogPagesPath = req.blogPagesPath;
        const dataDir = path.join(__dirname, '../data');
        
        await updateDeployStatus(configPath, 'deploying', '扫描本地文件...');
        const files = getAllFiles(blogPagesPath);
        console.log(`准备上传 ${files.length} 个文件到 GitHub`);
        
        const apiBase = `https://${apiServer || 'api.github.com'}`;
        const headers = {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'moyan-blog'
        };

        await updateDeployStatus(configPath, 'deploying', `上传 ${files.length} 个文件...`);
        
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          try {
            const fileContent = fs.readFileSync(file.fullPath);
            const base64Content = fileContent.toString('base64');
            
            const filePath = file.path;
            
            let sha = null;
            try {
              const getRes = await axios.get(`${apiBase}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, { headers, httpsAgent });
              sha = getRes.data.sha;
            } catch (e) {
            }
            
            const payload = {
              message: `Update ${filePath}`,
              content: base64Content,
              branch: branch
            };
            
            if (sha) {
              payload.sha = sha;
            }
            
            await axios.put(`${apiBase}/repos/${owner}/${repo}/contents/${filePath}`, payload, { headers, httpsAgent });
            successCount++;
            
            if ((i + 1) % 5 === 0 || i === files.length - 1) {
              await updateDeployStatus(configPath, 'deploying', `上传文件 ${i + 1}/${files.length}...`);
            }
            
            if (apiRateLimiting) {
              await delay(300);
            }
            
          } catch (fileErr) {
            console.error(`上传文件失败: ${file.path}`, fileErr.response?.data || fileErr.message);
            failCount++;
          }
        }

        await deleteRecordService.clearDeletedRecords(dataDir);

        console.log(`部署完成: 成功 ${successCount}, 失败 ${failCount}`);
        
        if (failCount === 0) {
          await updateDeployStatus(configPath, 'success', '部署完成');
        } else {
          await updateDeployStatus(configPath, 'success', `部署完成 (${successCount}成功, ${failCount}失败)`);
        }
      } catch (error) {
        console.error('部署失败', error);
        await updateDeployStatus(configPath, 'failed', '部署失败', error.response?.data?.message || error.message);
      }
    })();

  } catch (error) {
    console.error('触发部署失败', error);
    res.status(500).json({ error: '触发部署失败' });
  }
});

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const configPath = getConfigPath(req);
    const config = await fileService.readJsonFile(configPath);
    res.json({
      lastDeploy: config?.lastDeploy,
      lastStatus: config?.lastStatus,
      lastError: config?.lastError,
      deployStep: config?.deployStep
    });
  } catch (error) {
    console.error('获取状态失败', error);
    res.status(500).json({ error: '获取状态失败' });
  }
});

module.exports = router;
