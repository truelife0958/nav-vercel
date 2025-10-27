/**
 * 数据库种子数据脚本
 * 用于初始化菜单、卡片、广告等测试数据
 * 运行: node api/seed.js
 */

const { sql, initializeDatabase, ensureDbInitialized } = require('./db');

// 种子数据
const seedData = {
  menus: [
    { name: '常用工具', sort_order: 1 },
    { name: '开发资源', sort_order: 2 },
    { name: '设计素材', sort_order: 3 },
    { name: '学习资源', sort_order: 4 },
  ],

  subMenus: [
    // 常用工具的子菜单
    { parent_menu: '常用工具', name: '在线工具', sort_order: 1 },
    { parent_menu: '常用工具', name: '效率工具', sort_order: 2 },

    // 开发资源的子菜单
    { parent_menu: '开发资源', name: '前端开发', sort_order: 1 },
    { parent_menu: '开发资源', name: '后端开发', sort_order: 2 },
    { parent_menu: '开发资源', name: 'API文档', sort_order: 3 },

    // 设计素材的子菜单
    { parent_menu: '设计素材', name: '图标素材', sort_order: 1 },
    { parent_menu: '设计素材', name: '配色方案', sort_order: 2 },
  ],

  cards: [
    // 常用工具 - 在线工具
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

    // 常用工具 - 效率工具
    {
      menu: '常用工具',
      sub_menu: '效率工具',
      title: 'Notion',
      url: 'https://www.notion.so/',
      description: '笔记和协作工具',
      sort_order: 1
    },

    // 开发资源 - 前端开发
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

    // 开发资源 - 后端开发
    {
      menu: '开发资源',
      sub_menu: '后端开发',
      title: 'Express.js',
      url: 'https://expressjs.com/',
      description: 'Node.js Web框架',
      sort_order: 1
    },

    // 设计素材 - 图标素材
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

async function clearData() {
  console.log('🧹 清空现有数据...');

  try {
    await sql`DELETE FROM cards`;
    await sql`DELETE FROM sub_menus`;
    await sql`DELETE FROM menus`;
    await sql`DELETE FROM ads`;
    await sql`DELETE FROM friends`;
    console.log('✅ 数据清空完成');
  } catch (error) {
    console.warn('⚠️  清空数据时出错(可能是表不存在):', error.message);
  }
}

async function seedMenus() {
  console.log('📝 创建菜单数据...');

  const menuMap = {};

  for (const menu of seedData.menus) {
    const result = await sql`
      INSERT INTO menus (name, sort_order)
      VALUES (${menu.name}, ${menu.sort_order})
      RETURNING id
    `;
    menuMap[menu.name] = result.rows[0].id;
    console.log(`  ✓ 创建菜单: ${menu.name}`);
  }

  return menuMap;
}

async function seedSubMenus(menuMap) {
  console.log('📝 创建子菜单数据...');

  const subMenuMap = {};

  for (const subMenu of seedData.subMenus) {
    const parentId = menuMap[subMenu.parent_menu];
    if (!parentId) {
      console.warn(`  ⚠️  跳过子菜单(父菜单不存在): ${subMenu.name}`);
      continue;
    }

    const result = await sql`
      INSERT INTO sub_menus (parent_id, name, sort_order)
      VALUES (${parentId}, ${subMenu.name}, ${subMenu.sort_order})
      RETURNING id
    `;

    const key = `${subMenu.parent_menu}/${subMenu.name}`;
    subMenuMap[key] = result.rows[0].id;
    console.log(`  ✓ 创建子菜单: ${subMenu.parent_menu} -> ${subMenu.name}`);
  }

  return subMenuMap;
}

async function seedCards(menuMap, subMenuMap) {
  console.log('📝 创建卡片数据...');

  for (const card of seedData.cards) {
    const menuId = menuMap[card.menu];
    const subMenuKey = `${card.menu}/${card.sub_menu}`;
    const subMenuId = subMenuMap[subMenuKey];

    if (!menuId) {
      console.warn(`  ⚠️  跳过卡片(菜单不存在): ${card.title}`);
      continue;
    }

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
    console.log(`  ✓ 创建卡片: ${card.title}`);
  }
}

async function seedAds() {
  console.log('📝 创建广告数据...');

  for (const ad of seedData.ads) {
    await sql`
      INSERT INTO ads (position, img, url)
      VALUES (${ad.position}, ${ad.img}, ${ad.url})
    `;
    console.log(`  ✓ 创建广告: ${ad.position}`);
  }
}

async function seedFriends() {
  console.log('📝 创建友情链接数据...');

  for (const friend of seedData.friends) {
    await sql`
      INSERT INTO friends (title, url, logo)
      VALUES (${friend.title}, ${friend.url}, ${friend.logo || null})
    `;
    console.log(`  ✓ 创建友链: ${friend.title}`);
  }
}

async function main() {
  console.log('🚀 开始数据库种子数据填充...\n');

  try {
    // 初始化数据库
    await initializeDatabase();
    await ensureDbInitialized();

    // 清空现有数据
    await clearData();

    // 填充数据
    const menuMap = await seedMenus();
    const subMenuMap = await seedSubMenus(menuMap);
    await seedCards(menuMap, subMenuMap);
    await seedAds();
    await seedFriends();

    console.log('\n🎉 种子数据填充完成!');
    console.log('');
    console.log('📊 统计:');
    console.log(`  - 菜单: ${seedData.menus.length} 个`);
    console.log(`  - 子菜单: ${seedData.subMenus.length} 个`);
    console.log(`  - 卡片: ${seedData.cards.length} 个`);
    console.log(`  - 广告: ${seedData.ads.length} 个`);
    console.log(`  - 友链: ${seedData.friends.length} 个`);
    console.log('');
    console.log('✨ 现在可以刷新页面查看效果了!');

    process.exit(0);
  } catch (error) {
    console.error('❌ 填充种子数据失败:', error);
    console.error('错误详情:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };
