const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sql, initializeDatabase, ensureDbInitialized } = require('./db');
const config = require('./config');

const app = express();
const JWT_SECRET = config.server.jwtSecret;
const isVercel = process.env.VERCEL === '1';

// ==================== 中间件 ====================

// 初始化数据库（仅在首次请求时）
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase().catch(err => {
      console.error('数据库初始化失败:', err);
      dbInitPromise = null;
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

// CORS 配置
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

// ==================== 认证中间件 ====================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided or token is malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    console.error('JWT verification error:', e);
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired, please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token, please log in again' });
  }
}

// ==================== 工具函数 ====================

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

// ==================== 健康检查 ====================

app.get('/api/health', async (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: dbInitPromise ? 'initialized' : 'pending',
      environment: isVercel ? 'Vercel Serverless' : 'Local'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// ==================== 认证路由 ====================

// 登录
app.post('/api/login', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    
    const { rows: users } = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    
    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const now = new Date();
    const ip = getClientIp(req);
    
    await sql`
      UPDATE users 
      SET last_login_time = ${now}, last_login_ip = ${ip}
      WHERE id = ${user.id}
    `;
    
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

// ==================== 菜单路由 ====================

// 获取所有菜单（包含子菜单）
app.get('/api/menus', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { page, pageSize } = req.query;
    
    if (!page && !pageSize) {
      const { rows: menus } = await sql`
        SELECT * FROM menus ORDER BY sort_order
      `;
      
      const menusWithSubMenus = await Promise.all(
        menus.map(async (menu) => {
          const { rows: subMenus } = await sql`
            SELECT * FROM sub_menus
            WHERE parent_id = ${menu.id}
            ORDER BY sort_order
          `;
          return { ...menu, subMenus };
        })
      );
      
      res.json(menusWithSubMenus);
    } else {
      const pageNum = parseInt(page) || 1;
      const size = parseInt(pageSize) || 10;
      const offset = (pageNum - 1) * size;
      
      const { rows: totalResult } = await sql`
        SELECT COUNT(*) as total FROM menus
      `;
      const total = parseInt(totalResult[0].total);
      
      const { rows: menus } = await sql`
        SELECT * FROM menus
        ORDER BY sort_order
        LIMIT ${size} OFFSET ${offset}
      `;
      
      res.json({
        total,
        page: pageNum,
        pageSize: size,
        data: menus
      });
    }
  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({ 
      error: 'Failed to get menus', 
      details: error.message 
    });
  }
});

// 获取指定菜单的子菜单
app.get('/api/menus/:id/submenus', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: subMenus } = await sql`
      SELECT * FROM sub_menus
      WHERE parent_id = ${req.params.id}
      ORDER BY sort_order
    `;
    
    res.json(subMenus);
  } catch (error) {
    console.error('Get submenus error:', error);
    res.status(500).json({ 
      error: 'Failed to get submenus', 
      details: error.message 
    });
  }
});

// 新增菜单
app.post('/api/menus', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rows } = await sql`
      INSERT INTO menus (name, sort_order)
      VALUES (${name}, ${sort_order || 0})
      RETURNING id
    `;
    
    res.json({ id: rows[0].id });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ 
      error: 'Failed to create menu', 
      details: error.message 
    });
  }
});

// 更新菜单
app.put('/api/menus/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rowCount } = await sql`
      UPDATE menus
      SET name = ${name}, sort_order = ${sort_order || 0}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ 
      error: 'Failed to update menu', 
      details: error.message 
    });
  }
});

// 删除菜单
app.delete('/api/menus/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM menus WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({ 
      error: 'Failed to delete menu', 
      details: error.message 
    });
  }
});

// 新增子菜单
app.post('/api/menus/:id/submenus', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rows } = await sql`
      INSERT INTO sub_menus (parent_id, name, sort_order)
      VALUES (${req.params.id}, ${name}, ${sort_order || 0})
      RETURNING id
    `;
    
    res.json({ id: rows[0].id });
  } catch (error) {
    console.error('Create submenu error:', error);
    res.status(500).json({ 
      error: 'Failed to create submenu', 
      details: error.message 
    });
  }
});

// 更新子菜单
app.put('/api/menus/submenus/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { name, sort_order } = req.body;
    const { rowCount } = await sql`
      UPDATE sub_menus
      SET name = ${name}, sort_order = ${sort_order || 0}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update submenu error:', error);
    res.status(500).json({ 
      error: 'Failed to update submenu', 
      details: error.message 
    });
  }
});

// 删除子菜单
app.delete('/api/menus/submenus/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM sub_menus WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete submenu error:', error);
    res.status(500).json({ 
      error: 'Failed to delete submenu', 
      details: error.message 
    });
  }
});

// ==================== 卡片路由 ====================

// 获取所有卡片（管理后台）
app.get('/api/cards', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: cards } = await sql`
      SELECT * FROM cards
      ORDER BY menu_id, sub_menu_id, sort_order
    `;
    
    cards.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    
    res.json(cards);
  } catch (error) {
    console.error('Get all cards error:', error);
    res.status(500).json({ 
      error: 'Failed to get cards', 
      details: error.message 
    });
  }
});

// 获取指定菜单的卡片
app.get('/api/cards/:menuId', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { menuId } = req.params;
    const { subMenuId } = req.query;
    
    let cards;
    if (subMenuId) {
      const result = await sql`
        SELECT * FROM cards
        WHERE menu_id = ${menuId} AND sub_menu_id = ${subMenuId}
        ORDER BY sort_order
      `;
      cards = result.rows;
    } else {
      const result = await sql`
        SELECT * FROM cards
        WHERE menu_id = ${menuId}
        ORDER BY sort_order
      `;
      cards = result.rows;
    }
    
    cards.forEach(card => {
      if (!card.custom_logo_path) {
        card.display_logo = card.logo_url || (card.url.replace(/\/+$/, '') + '/favicon.ico');
      } else {
        card.display_logo = '/uploads/' + card.custom_logo_path;
      }
    });
    
    res.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ 
      error: 'Failed to get cards', 
      details: error.message 
    });
  }
});

// 新增卡片
app.post('/api/cards', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const {
      menu_id,
      sub_menu_id,
      title,
      url,
      logo_url,
      custom_logo_path,
      description,
      sort_order
    } = req.body;

    const { rows } = await sql`
      INSERT INTO cards (
        menu_id,
        sub_menu_id,
        title,
        url,
        logo_url,
        custom_logo_path,
        description,
        sort_order
      )
      VALUES (
        ${menu_id || null},
        ${sub_menu_id || null},
        ${title},
        ${url},
        ${logo_url || null},
        ${custom_logo_path || null},
        ${description || null},
        ${sort_order || 0}
      )
      RETURNING *
    `;
    
    const newCard = rows[0];
    
    if (!newCard.custom_logo_path) {
      newCard.display_logo = newCard.logo_url || (newCard.url.replace(/\/+$/, '') + '/favicon.ico');
    } else {
      newCard.display_logo = '/uploads/' + newCard.custom_logo_path;
    }
    
    res.status(200).json(newCard);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ 
      error: 'Failed to create card', 
      details: error.message 
    });
  }
});

// 更新卡片
app.put('/api/cards/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const cardId = req.params.id;
    const fields = req.body;
    
    const { rows: existing } = await sql`
      SELECT * FROM cards WHERE id = ${cardId}
    `;
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    Object.keys(fields).forEach(key => {
      if (key !== 'id') {
        updates.push(`${key} = $${paramIndex}`);
        values.push(fields[key]);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      return res.json({ changed: 0 });
    }
    
    values.push(cardId);
    
    const query = `UPDATE cards SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    const result = await sql.query(query, values);
    
    res.json({ changed: result.rowCount });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ 
      error: 'Failed to update card', 
      details: error.message 
    });
  }
});

// 删除卡片
app.delete('/api/cards/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const cardId = req.params.id;
    
    const { rows: existing } = await sql`
      SELECT * FROM cards WHERE id = ${cardId}
    `;
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    const { rowCount } = await sql`
      DELETE FROM cards WHERE id = ${cardId}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ 
      error: 'Failed to delete card', 
      details: error.message 
    });
  }
});

// ==================== 广告路由 ====================

// 获取所有广告
app.get('/api/ads', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: ads } = await sql`
      SELECT * FROM ads
    `;
    
    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ 
      error: 'Failed to get ads', 
      details: error.message 
    });
  }
});

// 新增广告
app.post('/api/ads', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { position, img, url } = req.body;
    
    const { rows } = await sql`
      INSERT INTO ads (position, img, url)
      VALUES (${position}, ${img}, ${url})
      RETURNING *
    `;
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ 
      error: 'Failed to create ad', 
      details: error.message 
    });
  }
});

// 更新广告
app.put('/api/ads/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { position, img, url } = req.body;
    
    const { rowCount } = await sql`
      UPDATE ads 
      SET position = ${position}, img = ${img}, url = ${url}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ 
      error: 'Failed to update ad', 
      details: error.message 
    });
  }
});

// 删除广告
app.delete('/api/ads/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM ads WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ 
      error: 'Failed to delete ad', 
      details: error.message 
    });
  }
});

// ==================== 友情链接路由 ====================

// 获取所有友情链接
app.get('/api/friends', async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rows: friends } = await sql`
      SELECT * FROM friends
    `;
    
    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ 
      error: 'Failed to get friends', 
      details: error.message 
    });
  }
});

// 新增友情链接
app.post('/api/friends', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { title, url, logo } = req.body;
    
    const { rows } = await sql`
      INSERT INTO friends (title, url, logo)
      VALUES (${title}, ${url}, ${logo || null})
      RETURNING *
    `;
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Create friend error:', error);
    res.status(500).json({ 
      error: 'Failed to create friend', 
      details: error.message 
    });
  }
});

// 更新友情链接
app.put('/api/friends/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { title, url, logo } = req.body;
    
    const { rowCount } = await sql`
      UPDATE friends 
      SET title = ${title}, url = ${url}, logo = ${logo || null}
      WHERE id = ${req.params.id}
    `;
    
    res.json({ changed: rowCount });
  } catch (error) {
    console.error('Update friend error:', error);
    res.status(500).json({ 
      error: 'Failed to update friend', 
      details: error.message 
    });
  }
});

// 删除友情链接
app.delete('/api/friends/:id', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { rowCount } = await sql`
      DELETE FROM friends WHERE id = ${req.params.id}
    `;
    
    res.json({ deleted: rowCount });
  } catch (error) {
    console.error('Delete friend error:', error);
    res.status(500).json({ 
      error: 'Failed to delete friend', 
      details: error.message 
    });
  }
});

// ==================== 用户路由 ====================

// 获取当前用户信息
app.get('/api/users/me', authMiddleware, async (req, res) => {
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
app.get('/api/users/profile', authMiddleware, async (req, res) => {
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

// 修改密码
app.put('/api/users/password', authMiddleware, async (req, res) => {
  try {
    await ensureDbInitialized();
    
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: '旧密码和新密码不能为空' });
    }
    
    const { rows: users } = await sql`
      SELECT * FROM users WHERE id = ${req.user.id}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: '旧密码错误' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
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

// 获取所有用户
app.get('/api/users', authMiddleware, async (req, res) => {
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

// ==================== 根路径 ====================

app.get('/', (req, res) => {
  res.json({
    message: 'Nav API Server',
    version: '2.0.0',
    status: 'running',
    environment: isVercel ? 'Vercel Serverless' : 'Local'
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Nav API Server',
    version: '2.0.0',
    status: 'running',
    environment: isVercel ? 'Vercel Serverless' : 'Local'
  });
});

// ==================== 错误处理 ====================

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found',
    path: req.path
  });
});

// ==================== 启动服务器 ====================

if (require.main === module) {
  const port = config.server.port || 3001;
  app.listen(port, () => {
    console.log(`🚀 Nav API Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
  });
}

module.exports = app;
