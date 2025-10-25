const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../db');
const authMiddleware = require('./authMiddleware');

const router = express.Router();

// Helper to convert sql.js output to a more usable format
const formatResult = (res) => {
  if (!res || res.length === 0) {
    return [];
  }
  const { columns, values } = res;
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
};

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT id, username FROM users WHERE id = ?', [req.user.id]);
  if (!result || result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }
  const userRow = result[0].values[0];
  const userObj = {};
  result[0].columns.forEach((col, i) => userObj[col] = userRow[i]);
  res.json({ data: userObj });
});

// 获取当前用户详细信息（包括登录信息）
router.get('/me', authMiddleware, async (req, res) => {
  const db = await getDb();
  const result = db.exec('SELECT id, username, last_login_time, last_login_ip FROM users WHERE id = ?', [req.user.id]);
  if (!result || result.length === 0 || result[0].values.length === 0) {
    return res.status(404).json({ message: '用户不存在' });
  }
  const userRow = result[0].values[0];
  const userObj = {};
  result[0].columns.forEach((col, i) => userObj[col] = userRow[i]);
  res.json({
    last_login_time: userObj.last_login_time || null,
    last_login_ip: userObj.last_login_ip || null
  });
});

// 修改密码
router.put('/password', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请提供旧密码和新密码' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少6位' });
    }

    // 验证旧密码
    const result = db.exec('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!result || result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const dbPassword = result[0].values[0][0];

    const isValidPassword = bcrypt.compareSync(oldPassword, dbPassword);
    if (!isValidPassword) {
      return res.status(400).json({ message: '旧密码错误' });
    }

    // 更新密码
    const newPasswordHash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, req.user.id]);
    saveDb();
    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password', details: error.message });
  }
});

// 获取所有用户（管理员功能）
router.get('/', authMiddleware, async (req, res) => {
  const db = await getDb();
  const { page, pageSize } = req.query;
  if (!page && !pageSize) {
    const result = db.exec('SELECT id, username FROM users');
    res.json({ data: formatResult(result[0]) });
  } else {
    const pageNum = parseInt(page) || 1;
    const size = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * size;
    const totalResult = db.exec('SELECT COUNT(*) as total FROM users');
    const total = totalResult[0].values[0][0];
    const rowsResult = db.exec(`SELECT id, username FROM users LIMIT ${size} OFFSET ${offset}`);
    res.json({
      total,
      page: pageNum,
      pageSize: size,
      data: formatResult(rowsResult[0])
    });
  }
});

module.exports = router;
