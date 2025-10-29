/**
 * 检查数据库中的数据
 */

require('dotenv').config();
const { sql, initializeDatabase } = require('../api/db');

/**
 * 检查数据库状态
 */
async function checkDatabase() {
  try {
    console.log('🔍 检查数据库状态...\n');
    
    // 确保数据库已初始化
    await initializeDatabase();
    
    // 查询菜单
    console.log('📁 菜单列表:');
    const menus = await sql`SELECT id, name, sort_order FROM menus ORDER BY sort_order`;
    if (menus.rows && menus.rows.length > 0) {
      menus.rows.forEach(menu => {
        console.log(`  [${menu.id}] ${menu.name} (排序: ${menu.sort_order})`);
      });
      console.log(`  总计: ${menus.rows.length} 个菜单\n`);
    } else {
      console.log('  (空)\n');
    }
    
    // 查询子菜单
    console.log('📂 子菜单列表:');
    const subMenus = await sql`
      SELECT sm.id, sm.name, m.name as parent_name, sm.sort_order 
      FROM sub_menus sm
      JOIN menus m ON sm.parent_id = m.id
      ORDER BY m.sort_order, sm.sort_order
    `;
    if (subMenus.rows && subMenus.rows.length > 0) {
      subMenus.rows.forEach(sm => {
        console.log(`  [${sm.id}] ${sm.parent_name} -> ${sm.name} (排序: ${sm.sort_order})`);
      });
      console.log(`  总计: ${subMenus.rows.length} 个子菜单\n`);
    } else {
      console.log('  (空)\n');
    }
    
    // 查询卡片数量
    console.log('🔗 网址卡片统计:');
    const cardCount = await sql`SELECT COUNT(*) as count FROM cards`;
    const count = parseInt(cardCount.rows[0]?.count || 0);
    console.log(`  总计: ${count} 个卡片\n`);
    
    // 按菜单统计卡片
    if (count > 0) {
      console.log('📊 按菜单统计卡片:');
      const cardsByMenu = await sql`
        SELECT m.name as menu_name, COUNT(c.id) as card_count
        FROM menus m
        LEFT JOIN cards c ON m.id = c.menu_id
        GROUP BY m.id, m.name
        ORDER BY m.name
      `;
      if (cardsByMenu.rows && cardsByMenu.rows.length > 0) {
        cardsByMenu.rows.forEach(row => {
          const cardCount = parseInt(row.card_count || 0);
          if (cardCount > 0) {
            console.log(`  ${row.menu_name}: ${cardCount} 个卡片`);
          }
        });
      }
      console.log();
    }
    
    // 查询最近添加的卡片
    console.log('🆕 最近的10个卡片:');
    const recentCards = await sql`
      SELECT c.id, c.title, c.url, m.name as menu_name
      FROM cards c
      LEFT JOIN menus m ON c.menu_id = m.id
      ORDER BY c.id DESC
      LIMIT 10
    `;
    if (recentCards.rows && recentCards.rows.length > 0) {
      recentCards.rows.forEach(card => {
        console.log(`  [${card.id}] ${card.title} (${card.menu_name})`);
        console.log(`       ${card.url}`);
      });
    } else {
      console.log('  (空)');
    }
    
    console.log('\n✅ 检查完成！');
    
  } catch (error) {
    console.error('\n❌ 检查失败:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// 执行检查
if (require.main === module) {
  checkDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      console.error('\n💥 程序异常:', err);
      process.exit(1);
    });
}

module.exports = { checkDatabase };