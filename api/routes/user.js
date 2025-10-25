const express = require('express');
const { sql, ensureDbInitialized } = require('../db');
const bcrypt = require('bcryptjs');
const auth = require('./authMiddleware');
const router = express.Router();

// 获取当前用户信息 - 需要认证
router.get('/me', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: users } = await sql`
      SELECT id, username, last_login_time, last_login_ip 
      FROM users 
      WHERE id = ${req.user.id}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile', 
      details: error.message 
    });
  }
});

// 备用获取用户信息接口
router.get('/profile', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: users } = await sql`
      SELECT id, username, last_login_time, last_login_ip 
      FROM users 
      WHERE id = ${req.user.id}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile', 
      details: error.message 
    });
  }
});

// 修改密码 - 需要认证
router.put('/password', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }
    
    // 获取当前用户
    const { rows: users } = await sql`
      SELECT * FROM users WHERE id = ${req.user.id}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: '旧密码错误' });
    }
    
    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // 更新密码
    await sql`
      UPDATE users 
      SET password = ${hashedPassword}
      WHERE id = ${req.user.id}
    `;
    
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password', 
      details: error.message 
    });
  }
});

// 获取所有用户 - 需要认证（管理员功能）
router.get('/', auth, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: users } = await sql`
      SELECT id, username, last_login_time, last_login_ip 
      FROM users
    `;
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users', 
      details: error.message 
    });
  }
});

module.exports = router;
