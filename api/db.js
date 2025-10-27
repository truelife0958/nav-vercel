const bcrypt = require('bcryptjs');
const config = require('./config');

// 检查是否有 Postgres 环境变量
const hasPostgres = !!process.env.POSTGRES_URL;

// 使用对象包装 sql，这样可以动态切换
const sqlWrapper = {
  current: null
};

let isMemoryDb = false;

try {
  if (hasPostgres) {
    console.log('✅ 检测到 POSTGRES_URL，尝试连接数据库...');
    
    // 使用 @neondatabase/serverless 包，它兼容 Supabase
    const { neon } = require('@neondatabase/serverless');
    const sqlClient = neon(process.env.POSTGRES_URL);
    
    // 创建一个兼容的 sql 函数
    const createSqlFunction = (client) => {
      const sqlFunc = async (strings, ...values) => {
        try {
          // 构建 SQL 查询
          let query = '';
          const params = [];
          
          for (let i = 0; i < strings.length; i++) {
            query += strings[i];
            if (i < values.length) {
              params.push(values[i]);
              query += `$${params.length}`;
            }
          }
          
          const result = await client(query, params);
          return { rows: result, rowCount: result.length };
        } catch (error) {
          console.error('SQL 执行错误:', error);
          throw error;
        }
      };
      
      // 添加 query 方法用于动态查询
      sqlFunc.query = async (query, params) => {
        const result = await client(query, params);
        return { rows: result, rowCount: result.length };
      };
      
      return sqlFunc;
    };
    
    sqlWrapper.current = createSqlFunction(sqlClient);
    console.log('✅ 使用 Neon Serverless 连接 Postgres 数据库');
  } else {
    // 降级使用内存数据库
    console.warn('⚠️  未检测到 POSTGRES_URL，使用内存模拟数据库（数据将在重启后丢失）');
    const memoryDb = require('./memoryDb');
    sqlWrapper.current = memoryDb.sql;
    isMemoryDb = true;
  }
} catch (error) {
  console.error('数据库模块加载失败:', error);
  // 最后的降级方案
  const memoryDb = require('./memoryDb');
  sqlWrapper.current = memoryDb.sql;
  isMemoryDb = true;
  console.warn('⚠️  降级到内存数据库');
}

// 导出一个代理函数，总是使用当前的 sql
const sql = new Proxy(function() {}, {
  apply(target, thisArg, args) {
    return sqlWrapper.current.apply(thisArg, args);
  },
  get(target, prop) {
    return sqlWrapper.current[prop];
  }
});

// 数据库初始化标志
let dbInitialized = false;
let initializationError = null;

/**
 * 初始化数据库表结构
 */
async function initializeDatabase() {
  if (dbInitialized) {
    console.log('数据库已初始化，跳过');
    return;
  }
  
  // 如果之前初始化失败过，尝试降级到内存数据库
  if (initializationError && !isMemoryDb) {
    console.warn('⚠️  之前的数据库初始化失败，降级到内存数据库');
    const memoryDb = require('./memoryDb');
    sqlWrapper.current = memoryDb.sql;
    isMemoryDb = true;
    initializationError = null;
  }
  
  try {
    console.log('开始初始化数据库...');

    // 艹！Neon这个SB对模板字符串中的双引号处理有问题，老王改用query方法！

    // 创建 menus 表
    await sql.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sort_order INTEGER DEFAULT 0
      )
    `, []);

    // 创建 sub_menus 表
    await sql.query(`
      CREATE TABLE IF NOT EXISTS sub_menus (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(parent_id) REFERENCES menus(id) ON DELETE CASCADE
      )
    `, []);

    // 创建 cards 表
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER,
        sub_menu_id INTEGER,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        logo_url TEXT,
        custom_logo_path TEXT,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        FOREIGN KEY(sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE
      )
    `, []);

    // 创建 users 表
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        last_login_time TIMESTAMP,
        last_login_ip VARCHAR(45)
      )
    `, []);

    // 创建 ads 表
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        position VARCHAR(50) NOT NULL,
        img TEXT NOT NULL,
        url TEXT NOT NULL
      )
    `, []);

    // 创建 friends 表
    await sql.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        logo TEXT
      )
    `, []);
    
    console.log('✅ 数据库表结构创建完成');
    
    // 检查是否需要创建默认管理员
    try {
      const result = await sql`SELECT COUNT(*) as count FROM users`;
      console.log('查询用户数量结果:', JSON.stringify(result));
      
      const users = result.rows || result;
      if (!users || users.length === 0) {
        console.warn('⚠️  无法查询用户数量，创建默认管理员');
        const hashedPassword = await bcrypt.hash(config.admin.password, 10);
        await sql`
          INSERT INTO users (username, password)
          VALUES (${config.admin.username}, ${hashedPassword})
        `;
        console.log(`✅ 默认管理员账户已创建: ${config.admin.username}`);
      } else {
        const firstRow = users[0];
        const userCount = parseInt(
          firstRow?.count || 
          firstRow?.COUNT || 
          firstRow?.['count(*)'] || 
          0
        );
        
        console.log(`当前用户数量: ${userCount}`);
        
        if (userCount === 0) {
          console.log('创建默认管理员账户...');
          const hashedPassword = await bcrypt.hash(config.admin.password, 10);
          await sql`
            INSERT INTO users (username, password)
            VALUES (${config.admin.username}, ${hashedPassword})
          `;
          console.log(`✅ 默认管理员账户已创建: ${config.admin.username}`);
        } else {
          console.log(`✅ 已存在 ${userCount} 个用户账户`);
        }
      }
    } catch (userCheckError) {
      console.error('检查用户时出错:', userCheckError);
      console.warn('⚠️  尝试创建默认管理员（忽略可能的重复错误）');
      try {
        const hashedPassword = await bcrypt.hash(config.admin.password, 10);
        await sql`
          INSERT INTO users (username, password)
          VALUES (${config.admin.username}, ${hashedPassword})
        `;
        console.log(`✅ 默认管理员账户已创建: ${config.admin.username}`);
      } catch (insertError) {
        if (insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
          console.log('✅ 管理员账户已存在');
        } else {
          console.error('创建管理员失败:', insertError);
        }
      }
    }
    
    dbInitialized = true;
    console.log('🎉 数据库初始化完成！');

    if (isMemoryDb) {
      console.warn('⚠️  警告：当前使用内存数据库，数据将在服务器重启后丢失');
      console.warn('⚠️  建议：检查 Supabase 数据库连接配置');

      // 自动加载种子数据到内存数据库
      try {
        console.log('📦 检测到内存数据库,自动加载种子数据...');
        await loadSeedData();
        console.log('✅ 种子数据加载完成!');
      } catch (seedError) {
        console.warn('⚠️  加载种子数据失败:', seedError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    
    // 如果是 Postgres 连接失败，尝试降级到内存数据库
    if (!isMemoryDb && (
      error.message.includes('fetch failed') || 
      error.message.includes('ENOTFOUND') || 
      error.message.includes('connect') ||
      error.message.includes('Cannot read properties')
    )) {
      console.warn('⚠️  Postgres 初始化失败，自动降级到内存数据库');
      initializationError = error;
      
      // 重置标志并使用内存数据库重试
      dbInitialized = false;
      const memoryDb = require('./memoryDb');
      sqlWrapper.current = memoryDb.sql;
      isMemoryDb = true;
      
      // 递归调用，使用内存数据库重新初始化
      return await initializeDatabase();
    }
    
    throw error;
  }
}

/**
 * 确保数据库已初始化
 */
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
  }
}

/**
 * 加载种子数据(仅用于内存数据库)
 */
async function loadSeedData() {
  const seedData = {
    menus: [
      { name: '常用工具', sort_order: 1 },
      { name: '开发资源', sort_order: 2 },
      { name: '设计素材', sort_order: 3 },
      { name: '学习资源', sort_order: 4 },
    ],
    subMenus: [
      { parent_menu: '常用工具', name: '在线工具', sort_order: 1 },
      { parent_menu: '常用工具', name: '效率工具', sort_order: 2 },
      { parent_menu: '开发资源', name: '前端开发', sort_order: 1 },
      { parent_menu: '开发资源', name: '后端开发', sort_order: 2 },
      { parent_menu: '开发资源', name: 'API文档', sort_order: 3 },
      { parent_menu: '设计素材', name: '图标素材', sort_order: 1 },
      { parent_menu: '设计素材', name: '配色方案', sort_order: 2 },
    ],
    cards: [
      {
        menu: '常用工具',
        sub_menu: '在线工具',
        title: 'JSON格式化',
        url: 'https://www.json.cn/',
        description: '在线JSON格式化工具',
        sort_order: 1
      },
      {
        menu: '常用工具',
        sub_menu: '在线工具',
        title: '正则表达式测试',
        url: 'https://regex101.com/',
        description: '在线正则表达式测试',
        sort_order: 2
      },
      {
        menu: '常用工具',
        sub_menu: '效率工具',
        title: 'Notion',
        url: 'https://www.notion.so/',
        description: '笔记和协作工具',
        sort_order: 1
      },
      {
        menu: '开发资源',
        sub_menu: '前端开发',
        title: 'Vue.js',
        url: 'https://cn.vuejs.org/',
        description: 'Vue.js官方文档',
        sort_order: 1
      },
      {
        menu: '开发资源',
        sub_menu: '前端开发',
        title: 'React',
        url: 'https://react.dev/',
        description: 'React官方文档',
        sort_order: 2
      },
      {
        menu: '开发资源',
        sub_menu: '后端开发',
        title: 'Express.js',
        url: 'https://expressjs.com/',
        description: 'Node.js Web框架',
        sort_order: 1
      },
      {
        menu: '设计素材',
        sub_menu: '图标素材',
        title: 'iconfont',
        url: 'https://www.iconfont.cn/',
        description: '阿里巴巴图标库',
        sort_order: 1
      },
    ],
    ads: [
      {
        position: 'left',
        img: 'https://via.placeholder.com/90x160/667eea/ffffff?text=Left+Ad',
        url: 'https://example.com'
      },
      {
        position: 'right',
        img: 'https://via.placeholder.com/90x160/764ba2/ffffff?text=Right+Ad',
        url: 'https://example.com'
      },
    ],
    friends: [
      {
        title: 'GitHub',
        url: 'https://github.com',
        logo: 'https://github.githubassets.com/favicons/favicon.svg'
      },
      {
        title: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        logo: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico'
      },
      {
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        logo: 'https://developer.mozilla.org/favicon-48x48.cbbd161b.png'
      },
    ]
  };

  // 创建菜单
  const menuMap = {};
  for (const menu of seedData.menus) {
    const result = await sql`
      INSERT INTO menus (name, sort_order)
      VALUES (${menu.name}, ${menu.sort_order})
      RETURNING id
    `;
    menuMap[menu.name] = result.rows[0].id;
  }

  // 创建子菜单
  const subMenuMap = {};
  for (const subMenu of seedData.subMenus) {
    const parentId = menuMap[subMenu.parent_menu];
    if (parentId) {
      const result = await sql`
        INSERT INTO sub_menus (parent_id, name, sort_order)
        VALUES (${parentId}, ${subMenu.name}, ${subMenu.sort_order})
        RETURNING id
      `;
      const key = `${subMenu.parent_menu}/${subMenu.name}`;
      subMenuMap[key] = result.rows[0].id;
    }
  }

  // 创建卡片
  for (const card of seedData.cards) {
    const menuId = menuMap[card.menu];
    const subMenuKey = `${card.menu}/${card.sub_menu}`;
    const subMenuId = subMenuMap[subMenuKey];

    if (menuId) {
      await sql`
        INSERT INTO cards (
          menu_id,
          sub_menu_id,
          title,
          url,
          description,
          sort_order
        )
        VALUES (
          ${menuId},
          ${subMenuId || null},
          ${card.title},
          ${card.url},
          ${card.description || null},
          ${card.sort_order}
        )
      `;
    }
  }

  // 创建广告
  for (const ad of seedData.ads) {
    await sql`
      INSERT INTO ads (position, img, url)
      VALUES (${ad.position}, ${ad.img}, ${ad.url})
    `;
  }

  // 创建友链
  for (const friend of seedData.friends) {
    await sql`
      INSERT INTO friends (title, url, logo)
      VALUES (${friend.title}, ${friend.url}, ${friend.logo || null})
    `;
  }
}

module.exports = {
  sql,
  initializeDatabase,
  ensureDbInitialized,
  isMemoryDb
};
