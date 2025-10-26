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
    
    // 创建 menus 表
    await sql`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        "order" INTEGER DEFAULT 0
      )
    `;
    
    // 创建 sub_menus 表
    await sql`
      CREATE TABLE IF NOT EXISTS sub_menus (
        id SERIAL PRIMARY KEY,
        parent_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        "order" INTEGER DEFAULT 0,
        FOREIGN KEY(parent_id) REFERENCES menus(id) ON DELETE CASCADE
      )
    `;
    
    // 创建 cards 表
    await sql`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER,
        sub_menu_id INTEGER,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        logo_url TEXT,
        custom_logo_path TEXT,
        desc TEXT,
        "order" INTEGER DEFAULT 0,
        FOREIGN KEY(menu_id) REFERENCES menus(id) ON DELETE CASCADE,
        FOREIGN KEY(sub_menu_id) REFERENCES sub_menus(id) ON DELETE CASCADE
      )
    `;
    
    // 创建 users 表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        last_login_time TIMESTAMP,
        last_login_ip VARCHAR(45)
      )
    `;
    
    // 创建 ads 表
    await sql`
      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        position VARCHAR(50) NOT NULL,
        img TEXT NOT NULL,
        url TEXT NOT NULL
      )
    `;
    
    // 创建 friends 表
    await sql`
      CREATE TABLE IF NOT EXISTS friends (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        logo TEXT
      )
    `;
    
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

module.exports = {
  sql,
  initializeDatabase,
  ensureDbInitialized,
  isMemoryDb
};
