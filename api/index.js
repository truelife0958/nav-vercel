const express = require('express');
const cors = require('cors');
const path = require('path');
const menuRoutes = require('./routes/menu');
const cardRoutes = require('./routes/card');
const uploadRoutes = require('./routes/upload');
const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ad');
const friendRoutes = require('./routes/friend');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');
const compression = require('compression');
const { initializeDatabase } = require('./db');
const config = require('./config');
const auth = require('./routes/authMiddleware');
const app = express();

// Vercel Serverless 配置
const isVercel = process.env.VERCEL === '1';

// 初始化数据库（仅在首次请求时）
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase().catch(err => {
      console.error('数据库初始化失败:', err);
      dbInitPromise = null; // 重置以便下次重试
      throw err;
    });
  }
  try {
    await dbInitPromise;
    next();
  } catch (error) {
    res.status(500).json({
      error: '数据库初始化失败',
      details: error.message
    });
  }
});

// 配置CORS允许跨域请求
app.use(cors({
  origin: [
    'https://nav-pro-inky.vercel.app',
    'https://nav-vercel-jade.vercel.app',
    'https://nav-vercel-eight.vercel.app',
    'https://nav.weny888.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查端点
app.get('/api/health', async (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbInitPromise ? 'initialized' : 'pending'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// API 路由 - 注意：在 Vercel 中，路径已经包含 /api 前缀
app.use('/api/menus', menuRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/upload', auth, uploadRoutes);
app.use('/api', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// 根路径处理
app.get('/', (req, res) => {
  res.json({
    message: 'Nav API Server',
    version: '1.0.0',
    status: 'running',
    environment: isVercel ? 'Vercel Serverless' : 'Local'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Nav API Server',
    version: '1.0.0',
    status: 'running',
    environment: isVercel ? 'Vercel Serverless' : 'Local'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found',
    path: req.path
  });
});

// 启动服务器（仅在本地运行时）
if (require.main === module) {
  const port = config.server.port || 3001;
  app.listen(port, () => {
    console.log(`🚀 Nav API Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
  });
}

// Export for Vercel Serverless Function
module.exports = app;
