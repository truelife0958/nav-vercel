const express = require('express');
const { getDb, saveDb } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const router = express.Router();

const JWT_SECRET = config.server.jwtSecret;

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

function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  if (typeof ip === 'string' && ip.includes(',')) ip = ip.split(',').trim();
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  return ip;
}

function getShanghaiTime() {
  const date = new Date();
  // 获取上海时区时间
  const shanghaiTime = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Shanghai"}));
  
  // 格式化为 YYYY-MM-DD HH:mm:ss
  const year = shanghaiTime.getFullYear();
  const month = String(shanghaiTime.getMonth() + 1).padStart(2, '0');
  const day = String(shanghaiTime.getDate()).padStart(2, '0');
  const hours = String(shanghaiTime.getHours()).padStart(2, '0');
  const minutes = String(shanghaiTime.getMinutes()).padStart(2, '0');
  const seconds = String(shanghaiTime.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

router.post('/login', async (req, res) => {
  const db = await getDb();
  const { username, password } = req.body;

  try {
    // 使用正确的查询语法
    const result = db.exec('SELECT * FROM users WHERE username=?', [username]);
    const user = result.length > 0 ? result[0] : null;

    if (!user || user.values.length === 0) {
      console.log('Login failed: User not found for username:', username);
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const userRow = user.values[0];
    const userObj = {};
    user.columns.forEach((col, i) => userObj[col] = userRow[i]);

    const { id: userId, username: dbUsername, password: dbPassword, last_login_time: lastLoginTime, last_login_ip: lastLoginIp } = userObj;

    bcrypt.compare(password, dbPassword, (err, result) => {
      if (err) {
        console.error('Error during bcrypt.compare:', err);
        return res.status(500).json({ error: 'Login error', details: err.message });
      }
      
      if (result) {
        // 更新为本次登录（上海时间）
        const now = getShanghaiTime();
        const ip = getClientIp(req);
        db.run('UPDATE users SET last_login_time=?, last_login_ip=? WHERE id=?', [now, ip, userId]);
        saveDb();
        const token = jwt.sign({ id: userId, username: dbUsername }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, lastLoginTime, lastLoginIp });
      } else {
        res.status(401).json({ error: '用户名或密码错误' });
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
});

module.exports = router;
