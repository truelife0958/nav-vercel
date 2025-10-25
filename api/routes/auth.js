const express = require('express');
const { sql, ensureDbInitialized } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const router = express.Router();

const JWT_SECRET = config.server.jwtSecret;

function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           '';
  
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  return ip;
}

router.post('/login', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    // 查询用户
    const { rows: users } = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    
    if (users.length === 0) {
      console.log('Login failed: User not found for username:', username);
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = users[0];
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      console.log('Login failed: Invalid password for username:', username);
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 更新登录信息
    const now = new Date();
    const ip = getClientIp(req);
    
    await sql`
      UPDATE users 
      SET last_login_time = ${now}, last_login_ip = ${ip}
      WHERE id = ${user.id}
    `;
    
    // 生成 token
    const token = jwt.sign(
      { id: user.id, username: user.username }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      lastLoginTime: user.last_login_time,
      lastLoginIp: user.last_login_ip
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed', 
      details: error.message 
    });
  }
});

module.exports = router;
