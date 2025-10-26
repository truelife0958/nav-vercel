/**
 * 自动化数据库迁移脚本
 * 用途：将旧的保留关键字字段名改为新字段名
 *
 * 使用方法：
 * 1. 确保 .env 文件中有 POSTGRES_URL
 * 2. 运行：node migrate-db.js
 */

require('dotenv').config();
// 使用api目录下的依赖
const { neon } = require('./api/node_modules/@neondatabase/serverless');

async function migrate() {
  const POSTGRES_URL = process.env.POSTGRES_URL;

  if (!POSTGRES_URL) {
    console.error('❌ 错误：未找到 POSTGRES_URL 环境变量');
    console.log('请在 .env 文件中设置 POSTGRES_URL');
    process.exit(1);
  }

  console.log('🔧 开始数据库迁移...\n');

  const sql = neon(POSTGRES_URL);

  try {
    // 检查表是否存在
    console.log('📊 检查现有表结构...');

    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('menus', 'sub_menus', 'cards')
    `;

    console.log(`找到 ${tables.length} 个表：`, tables.map(t => t.table_name).join(', '));
    console.log('');

    // 检查旧列是否存在
    console.log('🔍 检查旧列名是否存在...');

    const oldColumns = await sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_name IN ('menus', 'sub_menus', 'cards')
      AND column_name IN ('order', 'desc')
    `;

    if (oldColumns.length === 0) {
      console.log('✅ 没有发现旧列名，可能已经迁移过了');
      console.log('');

      // 显示当前列名
      const currentColumns = await sql`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_name IN ('menus', 'sub_menus', 'cards')
        ORDER BY table_name, ordinal_position
      `;

      console.log('📋 当前表结构：');
      let currentTable = '';
      currentColumns.forEach(col => {
        if (col.table_name !== currentTable) {
          currentTable = col.table_name;
          console.log(`\n${currentTable}:`);
        }
        console.log(`  - ${col.column_name}`);
      });

      return;
    }

    console.log('发现需要迁移的旧列：');
    oldColumns.forEach(col => {
      console.log(`  - ${col.table_name}.${col.column_name}`);
    });
    console.log('');

    // 执行迁移
    console.log('🚀 开始执行迁移...\n');

    // 1. 修改 menus 表
    if (oldColumns.some(c => c.table_name === 'menus' && c.column_name === 'order')) {
      console.log('  修改 menus.order → menus.sort_order');
      await sql`ALTER TABLE menus RENAME COLUMN "order" TO sort_order`;
      console.log('  ✅ menus 表迁移完成');
    }

    // 2. 修改 sub_menus 表
    if (oldColumns.some(c => c.table_name === 'sub_menus' && c.column_name === 'order')) {
      console.log('  修改 sub_menus.order → sub_menus.sort_order');
      await sql`ALTER TABLE sub_menus RENAME COLUMN "order" TO sort_order`;
      console.log('  ✅ sub_menus 表迁移完成');
    }

    // 3. 修改 cards 表
    const cardsNeedsMigration = oldColumns.filter(c => c.table_name === 'cards');
    if (cardsNeedsMigration.length > 0) {
      console.log('  修改 cards 表字段：');

      if (cardsNeedsMigration.some(c => c.column_name === 'desc')) {
        console.log('    - desc → description');
        await sql`ALTER TABLE cards RENAME COLUMN "desc" TO description`;
      }

      if (cardsNeedsMigration.some(c => c.column_name === 'order')) {
        console.log('    - order → sort_order');
        await sql`ALTER TABLE cards RENAME COLUMN "order" TO sort_order`;
      }

      console.log('  ✅ cards 表迁移完成');
    }

    console.log('\n🎉 数据库迁移完成！\n');

    // 验证迁移结果
    console.log('📋 迁移后的表结构：\n');

    const finalColumns = await sql`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name IN ('menus', 'sub_menus', 'cards')
      ORDER BY table_name, ordinal_position
    `;

    let prevTable = '';
    finalColumns.forEach(col => {
      if (col.table_name !== prevTable) {
        prevTable = col.table_name;
        console.log(`\n${col.table_name}:`);
      }
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ 迁移成功！现在可以正常使用新字段名了');

  } catch (error) {
    console.error('\n❌ 迁移失败：', error.message);
    console.error('\n错误详情：');
    console.error(error);
    console.log('\n💡 建议：');
    console.log('1. 检查数据库连接是否正常');
    console.log('2. 检查是否有足够的权限执行 ALTER TABLE');
    console.log('3. 查看上面的错误详情了解具体问题');
    process.exit(1);
  }
}

// 执行迁移
migrate().catch(error => {
  console.error('未捕获的错误：', error);
  process.exit(1);
});
