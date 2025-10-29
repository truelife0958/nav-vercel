const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sql, initializeDatabase, ensureDbInitialized } = require('./db');
const config = require('./config');

// 艹！老王的新中间件系统，强大又好用！
const { authMiddleware } = require('./middleware/auth');
const { asyncHandler, errorHandler, notFoundHandler, createError } = require('./middleware/errorHandler');
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiter');
const { logger, requestLogger } = require('./middleware/logger');
const {
  validate,
  loginSchema,
  menuSchema,
  subMenuSchema,
  cardSchema,
  adSchema,
  friendSchema,
  changePasswordSchema,
  brandSchema
} = require('./validators');

const app = express();
const JWT_SECRET = config.server.jwtSecret;
const isVercel = process.env.VERCEL === '1';

// ==================== 中间件 ====================

// 初始化数据库（仅在首次请求时）
// 艹！老王加了锁，防止并发初始化这个憨批问题！
let dbInitPromise = null;
let dbInitLock = false;

app.use(async (req, res, next) => {
  // 如果已经初始化完成，直接通过
  if (dbInitPromise && !dbInitLock) {
    try {
      await dbInitPromise;
      return next();
    } catch (error) {
      return res.status(500).json({
        error: '数据库初始化失败',
        details: error.message
      });
    }
  }

  // 如果没有初始化且没有锁，开始初始化
  if (!dbInitPromise && !dbInitLock) {
    dbInitLock = true;
    console.log('🔒 数据库初始化锁已获取');

    dbInitPromise = initializeDatabase()
      .then(() => {
        console.log('✅ 数据库初始化完成，释放锁');
        dbInitLock = false;
        return Promise.resolve();
      })
      .catch(err => {
        console.error('❌ 数据库初始化失败:', err);
        dbInitPromise = null;
        dbInitLock = false;
        return Promise.reject(err);
      });
  }

  // 等待初始化完成（包括其他请求正在进行的初始化）
  if (dbInitLock) {
    // 如果有锁，说明正在初始化，等一下
    const maxWaitTime = 10000; // 最多等10秒
    const startTime = Date.now();

    while (dbInitLock && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (dbInitLock) {
      return res.status(503).json({
        error: '数据库初始化超时',
        details: '请稍后重试'
      });
    }
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

// 请求日志（老王的日志系统）
app.use(requestLogger);

app.use(express.json());
app.use(compression());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 限流（防止憨批搞暴力攻击）
app.use('/api', apiLimiter);

// ==================== 旧的认证中间件已移除（现在用middleware/auth.js） ====================
// 旧的authMiddleware函数定义已删除，直接使用require导入的版本

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

// ====================认证路由 ====================

// 登录（老王加了限流和验证，防止暴力破解！）
app.post('/api/login', loginLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();

  const { username, password } = req.body;

  const { rows: users } = await sql`
    SELECT * FROM users WHERE username = ${username}
  `;

  if (users.length === 0) {
    throw createError.unauthorized('用户名或密码错误');
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw createError.unauthorized('用户名或密码错误');
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

  logger.info(`用户登录成功: ${username}`, { ip });

  res.json({
    token,
    lastLoginTime: user.last_login_time,
    lastLoginIp: user.last_login_ip
  });
}));

// ==================== 菜单路由 ====================

// 获取所有菜单（包含子菜单）
// 艹！老王优化版，干掉N+1查询这个憨批性能杀手！
app.get('/api/menus', async (req, res) => {
  try {
    await ensureDbInitialized();

    const { page, pageSize } = req.query;

    if (!page && !pageSize) {
      // 一次性查出所有数据，不要tm在循环里查数据库！
      const { rows: menus } = await sql`
        SELECT * FROM menus ORDER BY sort_order
      `;

      const { rows: allSubMenus } = await sql`
        SELECT * FROM sub_menus ORDER BY parent_id, sort_order
      `;

      // 在内存中组装数据，性能杠杠的！
      const subMenuMap = {};
      allSubMenus.forEach(sub => {
        if (!subMenuMap[sub.parent_id]) {
          subMenuMap[sub.parent_id] = [];
        }
        subMenuMap[sub.parent_id].push(sub);
      });

      const menusWithSubMenus = menus.map(menu => ({
        ...menu,
        subMenus: subMenuMap[menu.id] || []
      }));

      res.json(menusWithSubMenus);
    } else {
      // 分页查询（保留原有逻辑）
      const pageNum = Math.max(parseInt(page) || 1, 1);
      const size = Math.min(Math.max(parseInt(pageSize) || 10, 1), 100); // 限制最大100条
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
app.post('/api/menus', authMiddleware, validate(menuSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { name, sort_order } = req.body;
  const { rows } = await sql`
    INSERT INTO menus (name, sort_order)
    VALUES (${name}, ${sort_order || 0})
    RETURNING id
  `;
  
  res.json({ id: rows[0].id });
}));

// 更新菜单
app.put('/api/menus/:id', authMiddleware, validate(menuSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { name, sort_order } = req.body;
  const { rowCount } = await sql`
    UPDATE menus
    SET name = ${name}, sort_order = ${sort_order || 0}
    WHERE id = ${req.params.id}
  `;
  
  res.json({ changed: rowCount });
}));

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
app.post('/api/menus/:id/submenus', authMiddleware, validate(subMenuSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { name, sort_order } = req.body;
  const { rows } = await sql`
    INSERT INTO sub_menus (parent_id, name, sort_order)
    VALUES (${req.params.id}, ${name}, ${sort_order || 0})
    RETURNING id
  `;
  
  res.json({ id: rows[0].id });
}));

// 更新子菜单
app.put('/api/menus/submenus/:id', authMiddleware, validate(subMenuSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { name, sort_order, menu_id } = req.body;
  
  // 如果提供了menu_id，则同时更新parent_id
  if (menu_id !== undefined) {
    const { rowCount } = await sql`
      UPDATE sub_menus
      SET name = ${name}, sort_order = ${sort_order || 0}, parent_id = ${menu_id}
      WHERE id = ${req.params.id}
    `;
    res.json({ changed: rowCount });
  } else {
    const { rowCount } = await sql`
      UPDATE sub_menus
      SET name = ${name}, sort_order = ${sort_order || 0}
      WHERE id = ${req.params.id}
    `;
    res.json({ changed: rowCount });
  }
}));

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
app.post('/api/cards', authMiddleware, validate(cardSchema), asyncHandler(async (req, res) => {
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
}));

// 更新卡片（老王的安全版本，艹掉SQL注入！）
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

    // 艹！白名单验证，防止SQL注入这个SB漏洞！
    const allowedFields = [
      'menu_id', 'sub_menu_id', 'title', 'url',
      'logo_url', 'custom_logo_path', 'description', 'sort_order'
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    // 只允许更新白名单中的字段
    Object.keys(fields).forEach(key => {
      if (allowedFields.includes(key)) {
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
app.post('/api/ads', authMiddleware, validate(adSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { position, img, url } = req.body;
  
  const { rows } = await sql`
    INSERT INTO ads (position, img, url)
    VALUES (${position}, ${img}, ${url})
    RETURNING *
  `;
  
  res.json(rows[0]);
}));

// 更新广告
app.put('/api/ads/:id', authMiddleware, validate(adSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { position, img, url } = req.body;
  
  const { rowCount } = await sql`
    UPDATE ads
    SET position = ${position}, img = ${img}, url = ${url}
    WHERE id = ${req.params.id}
  `;
  
  res.json({ changed: rowCount });
}));

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
app.post('/api/friends', authMiddleware, validate(friendSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { title, url, logo } = req.body;
  
  const { rows } = await sql`
    INSERT INTO friends (title, url, logo)
    VALUES (${title}, ${url}, ${logo || null})
    RETURNING *
  `;
  
  res.json(rows[0]);
}));

// 更新友情链接
app.put('/api/friends/:id', authMiddleware, validate(friendSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { title, url, logo } = req.body;
  
  const { rowCount } = await sql`
    UPDATE friends
    SET title = ${title}, url = ${url}, logo = ${logo || null}
    WHERE id = ${req.params.id}
  `;
  
  res.json({ changed: rowCount });
}));

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
app.put('/api/users/password', authMiddleware, validate(changePasswordSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { oldPassword, newPassword } = req.body;
  
  const { rows: users } = await sql`
    SELECT * FROM users WHERE id = ${req.user.id}
  `;
  
  if (users.length === 0) {
    throw createError.notFound('User not found');
  }
  
  const user = users[0];
  const isValid = await bcrypt.compare(oldPassword, user.password);
  
  if (!isValid) {
    throw createError.unauthorized('旧密码错误');
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await sql`
    UPDATE users
    SET password = ${hashedPassword}
    WHERE id = ${req.user.id}
  `;
  
  logger.info(`用户修改密码成功: ${user.username}`);
  res.json({ message: '密码修改成功' });
}));

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

// ==================== 品牌设置路由 ====================

// 获取品牌设置
app.get('/api/brand-settings', asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const { rows: settings } = await sql`
    SELECT * FROM brand_settings
    ORDER BY id DESC
    LIMIT 1
  `;
  
  if (settings.length === 0) {
    // 返回默认设置
    return res.json({
      site_name: '我的导航站',
      site_logo: null,
      site_description: '一个简洁优雅的导航网站',
      site_keywords: null,
      footer_text: null,
      icp_number: null
    });
  }
  
  res.json(settings[0]);
}));

// 更新品牌设置
app.put('/api/brand-settings', authMiddleware, validate(brandSchema), asyncHandler(async (req, res) => {
  await ensureDbInitialized();
  
  const {
    site_name,
    site_logo,
    site_description,
    site_keywords,
    footer_text,
    icp_number
  } = req.body;
  
  // 检查是否存在设置
  const { rows: existing } = await sql`
    SELECT * FROM brand_settings LIMIT 1
  `;
  
  if (existing.length === 0) {
    // 创建新设置
    const { rows } = await sql`
      INSERT INTO brand_settings (
        site_name,
        site_logo,
        site_description,
        site_keywords,
        footer_text,
        icp_number
      )
      VALUES (
        ${site_name || null},
        ${site_logo || null},
        ${site_description || null},
        ${site_keywords || null},
        ${footer_text || null},
        ${icp_number || null}
      )
      RETURNING *
    `;
    
    logger.info('品牌设置已创建', { user: req.user.username });
    return res.json(rows[0]);
  }
  
  // 更新现有设置
  const { rows } = await sql`
    UPDATE brand_settings
    SET
      site_name = ${site_name || null},
      site_logo = ${site_logo || null},
      site_description = ${site_description || null},
      site_keywords = ${site_keywords || null},
      footer_text = ${footer_text || null},
      icp_number = ${icp_number || null},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${existing[0].id}
    RETURNING *
  `;
  
  logger.info('品牌设置已更新', { user: req.user.username });
  res.json(rows[0]);
}));

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

// ==================== 错误处理（老王的统一错误处理系统） ====================

// 404处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// ==================== 启动服务器 ====================

if (require.main === module) {
  const port = config.server.port || 3001;
  app.listen(port, () => {
    console.log(`🚀 Nav API Server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api/health`);
  });
}

module.exports = app;
