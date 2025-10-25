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
const db = require('./db');
const config = require('./config');
const auth = require('./routes/authMiddleware');
const app = express();
const listEndpoints = require('express-list-endpoints');

// Vercel Serverless 配置
const isVercel = process.env.VERCEL === '1';

// 配置CORS允许跨域请求
app.use(cors({
  origin: [
    'https://nav-pro-inky.vercel.app',
    'https://nav.weny888.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: db ? 'connected' : 'disconnected'
  });
});

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
    status: 'running'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found'
  });
});

// 启动服务器
// Start server only if the script is executed directly
if (require.main === module) {
  const port = config.server.port || 3000;
  app.listen(port, () => {
    console.log(`🚀 Nav API Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log('Registered routes:', listEndpoints(app));
  });
}

// Export the app for testing and Vercel
module.exports = { app };
