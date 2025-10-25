const bcrypt = require('bcryptjs');
const config = require('./config');

// 检查是否有 Postgres 环境变量
const hasPostgres = !!process.env.POSTGRES_URL;

let sql;
let isMemoryDb = false;

try {
  if (hasPostgres) {
    // 使用 Vercel Postgres
    const postgres = require('@vercel/postgres');
    sql = postgres.sql;
    console.log('✅ 使用 Vercel Postgres 数据库');
  } else {
    // 降级使用内存数据库
    console.warn('⚠️  未检测到 POSTGRES_URL，使用内存模拟数据库（数据将在重启后丢失）');
    const memoryDb = require('./memoryDb');
    sql = memoryDb.sql;
    isMemoryDb = true;
  }
} catch (error) {
  console.error('数据库模块加载失败:', error);
  // 最后的降级方案
  const memoryDb = require('./memoryDb');
  sql = memoryDb.sql;
  isMemoryDb = true;
  console.warn('⚠️  降级到内存数据库');
}

// 数据库初始化标志
let dbInitialized = false;

/**
 * 初始化数据库表结构
 */
async function initializeDatabase() {
  if (dbInitialized) {
    console.log('数据库已初始化，跳过');
    return;
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
    const { rows: users } = await sql`SELECT COUNT(*) as count FROM users`;
    const userCount = parseInt(users[0].count || users[0].COUNT || 0);
    
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
    
    dbInitialized = true;
    console.log('🎉 数据库初始化完成！');
    
    if (isMemoryDb) {
      console.warn('⚠️  警告：当前使用内存数据库，数据将在服务器重启后丢失');
      console.warn('⚠️  建议：在 Vercel 设置 Postgres 数据库以实现数据持久化');
    }
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
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
