# 墨言博客管理系统

一个基于 Node.js + React 的博客管理系统，与 `blog-pages` 博客网站无缝集成。

## 技术栈

- **后端**: Node.js + Express.js
- **前端**: React 18
- **认证**: JWT
- **数据存储**: JSON 文件（与 blog-pages 兼容）

## 功能模块

- 用户登录认证
- 文章管理（创建、编辑、删除，支持 Markdown）
- 网站配置管理
- 分类管理
- 友情链接管理
- 图片上传与管理

## 快速开始

### 1. 安装后端依赖

```bash
cd server
npm install
```

### 2. 安装前端依赖

```bash
cd client
npm install
```

### 3. 启动后端服务

```bash
cd server
npm run dev
```

后端服务运行在 http://localhost:3001

### 4. 启动前端应用

新开一个终端：

```bash
cd client
npm start
```

前端应用运行在 http://localhost:3000

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

首次登录后请立即修改密码。

## 项目结构

```
blog-system/
├── server/          # 后端服务
│   ├── api/        # API 路由
│   ├── middleware/ # 中间件（认证）
│   ├── services/   # 文件服务
│   ├── data/       # 管理员数据
│   ├── index.js    # 入口文件
│   └── package.json
└── client/         # 前端应用
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── styles/
    │   ├── App.js
    │   └── index.js
    ├── public/
    └── package.json
```

## 注意事项

- 确保 `blog-pages` 目录与 `blog-system` 在同一级目录
- 图片会上传至 `blog-pages/images` 目录
- 所有数据修改会直接反映到 `blog-pages` 的相应文件中
