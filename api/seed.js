const bcrypt = require('bcryptjs');
const config = require('./config');

const defaultMenus = [
  ['首页', 1],
  ['AI工具', 2],
  ['云服务', 3],
  ['软件', 4],
  ['在线工具', 5],
  ['其他', 6]
];

const subMenus = [
  { parentMenu: 'AI工具', name: 'AI聊天', order: 1 },
  { parentMenu: 'AI工具', name: 'AI工具', order: 2 },
  { parentMenu: '在线工具', name: '开发工具', order: 1 },
  { parentMenu: '软件', name: 'Mac', order: 1 },
  { parentMenu: '软件', name: 'iOS', order: 2 },
  { parentMenu: '软件', name: 'Android', order: 3 },
  { parentMenu: '软件', name: 'Windows', order: 4 }
];

const cards = [
    // 首页
    { menu: '首页', title: 'Baidu', url: 'https://www.baidu.com', logo_url: '', desc: '全球最大的中文搜索引擎' },
    { menu: '首页', title: 'Youtube', url: 'https://www.youtube.com', logo_url: 'https://img.icons8.com/ios-filled/100/ff1d06/youtube-play.png', desc: '全球最大的视频社区' },
    { menu: '首页', title: 'Gmail', url: 'https://mail.google.com', logo_url: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', desc: '' },
    { menu: '首页', title: 'GitHub', url: 'https://github.com', logo_url: '', desc: '全球最大的代码托管平台' },
    { menu: '首页', title: 'ip.sb', url: 'https://ip.sb', logo_url: '', desc: 'ip地址查询' },
    { menu: '首页', title: 'Cloudflare', url: 'https://dash.cloudflare.com', logo_url: '', desc: '全球最大的cdn服务商' },
    { menu: '首页', title: 'ChatGPT', url: 'https://chat.openai.com', logo_url: 'https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico', desc: '人工智能AI聊天机器人' },
    { menu: '首页', title: 'Huggingface', url: 'https://huggingface.co', logo_url: '', desc: '全球最大的开源模型托管平台' },
    { menu: '首页', title: 'ITDOG - 在线ping', url: 'https://www.itdog.cn/tcping', logo_url: '', desc: '在线tcping' },
    { menu: '首页', title: 'Ping0', url: 'https://ping0.cc', logo_url: '', desc: 'ip地址查询' },
    { menu: '首页', title: '浏览器指纹', url: 'https://www.browserscan.net/zh', logo_url: '', desc: '浏览器指纹查询' },
    { menu: '首页', title: 'nezha面板', url: 'https://ssss.nyc.mn', logo_url: 'https://nezha.wiki/logo.png', desc: 'nezha面板' },
    { menu: '首页', title: 'Api测试', url: 'https://hoppscotch.io', logo_url: '', desc: '在线api测试工具' },
    { menu: '首页', title: '域名检查', url: 'https://who.cx', logo_url: '', desc: '域名可用性查询' },
    { menu: '首页', title: '域名比价', url: 'https://www.whois.com', logo_url: '', desc: '域名价格比较' },
    { menu: '首页', title: 'NodeSeek', url: 'https://www.nodeseek.com', logo_url: 'https://www.nodeseek.com/static/image/favicon/favicon-32x32.png', desc: '主机论坛' },
    { menu: '首页', title: 'Linux do', url: 'https://linux.do', logo_url: 'https://linux.do/uploads/default/optimized/3X/9/d/9dd49731091ce8656e94433a26a3ef36062b3994_2_32x32.png', desc: '新的理想型社区' },
    { menu: '首页', title: '在线音乐', url: 'https://music.eooce.com', logo_url: 'https://p3.music.126.net/tBTNafgjNnTL1KlZMt7lVA==/18885211718935735.jpg', desc: '在线音乐' },
    { menu: '首页', title: '在线电影', url: 'https://libretv.eooce.com', logo_url: 'https://img.icons8.com/color/240/cinema---v1.png', desc: '在线电影' },
    { menu: '首页', title: '免费接码', url: 'https://www.smsonline.cloud/zh', logo_url: '', desc: '免费接收短信验证码' },
    { menu: '首页', title: '订阅转换', url: 'https://sublink.eooce.com', logo_url: 'https://img.icons8.com/color/96/link--v1.png', desc: '最好用的订阅转换工具' },
    { menu: '首页', title: 'webssh', url: 'https://ssh.eooce.com', logo_url: 'https://img.icons8.com/fluency/240/ssh.png', desc: '最好用的webssh终端管理工具' },
    { menu: '首页', title: '文件快递柜', url: 'https://filebox.nnuu.nyc.mn', logo_url: 'https://img.icons8.com/nolan/256/document.png', desc: '文件输出分享' },
    { menu: '首页', title: '真实地址生成', url: 'https://address.nnuu.nyc.mn', logo_url: 'https://static11.meiguodizhi.com/favicon.ico', desc: '基于当前ip生成真实的地址' },
    // AI工具
    { menu: 'AI工具', title: 'ChatGPT', url: 'https://chat.openai.com', logo_url: 'https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico', desc: 'OpenAI官方AI对话' },
    { menu: 'AI工具', title: 'Deepseek', url: 'https://www.deepseek.com', logo_url: 'https://cdn.deepseek.com/chat/icon.png', desc: 'Deepseek AI搜索' },
    { menu: 'AI工具', title: 'Claude', url: 'https://claude.ai', logo_url: 'https://img.icons8.com/fluency/240/claude-ai.png', desc: 'Anthropic Claude AI' },
    { menu: 'AI工具', title: 'Google Gemini', url: 'https://gemini.google.com', logo_url: 'https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg', desc: 'Google Gemini大模型' },
    { menu: 'AI工具', title: '阿里千问', url: 'https://chat.qwenlm.ai', logo_url: 'https://g.alicdn.com/qwenweb/qwen-ai-fe/0.0.11/favicon.ico', desc: '阿里云千问大模型' },
    { menu: 'AI工具', title: 'Kimi', url: 'https://www.kimi.com', logo_url: '', desc: '月之暗面Moonshot AI' },
    // AI工具 - 子菜单卡片
    { subMenu: 'AI聊天', title: 'ChatGPT', url: 'https://chat.openai.com', logo_url: 'https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico', desc: 'OpenAI官方AI对话' },
    { subMenu: 'AI聊天', title: 'Deepseek', url: 'https://www.deepseek.com', logo_url: 'https://cdn.deepseek.com/chat/icon.png', desc: 'Deepseek AI搜索' },
    // AI工具 - 子菜单卡片
    { subMenu: 'AI工具', title: 'ChatGPT', url: 'https://chat.openai.com', logo_url: 'https://cdn.oaistatic.com/assets/favicon-eex17e9e.ico', desc: 'OpenAI官方AI对话' },
    { subMenu: 'AI工具', title: 'Deepseek', url: 'https://www.deepseek.com', logo_url: 'https://cdn.deepseek.com/chat/icon.png', desc: 'Deepseek AI搜索' },
    // 云服务
    { menu: '云服务', title: '阿里云', url: 'https://www.aliyun.com', logo_url: 'https://img.alicdn.com/tfs/TB1_ZXuNcfpK1RjSZFOXXa6nFXa-32-32.ico', desc: '阿里云官网' },
    { menu: '云服务', title: '腾讯云', url: 'https://cloud.tencent.com', logo_url: '', desc: '腾讯云官网' },
    { menu: '云服务', title: '甲骨文云', url: 'https://cloud.oracle.com', logo_url: '', desc: 'Oracle Cloud' },
    { menu: '云服务', title: '亚马逊云', url: 'https://aws.amazon.com', logo_url: 'https://img.icons8.com/color/144/amazon-web-services.png', desc: 'Amazon AWS' },
    { menu: '云服务', title: 'DigitalOcean', url: 'https://www.digitalocean.com', logo_url: 'https://www.digitalocean.com/_next/static/media/apple-touch-icon.d7edaa01.png', desc: 'DigitalOcean VPS' },
    { menu: '云服务', title: 'Vultr', url: 'https://www.vultr.com', logo_url: '', desc: 'Vultr VPS' },
    // 软件
    { menu: '软件', title: 'Hellowindows', url: 'https://hellowindows.cn', logo_url: 'https://hellowindows.cn/logo-s.png', desc: 'windows系统及office下载' },
    { menu: '软件', title: '奇迹秀', url: 'https://www.qijishow.com/down', logo_url: 'https://www.qijishow.com/img/ico.ico', desc: '设计师的百宝箱' },
    { menu: '软件', title: '易破解', url: 'https://www.ypojie.com', logo_url: 'https://www.ypojie.com/favicon.ico', desc: '精品windows软件' },
    { menu: '软件', title: '软件先锋', url: 'https://topcracked.com', logo_url: 'https://cdn.mac89.com/win_macxf_node/static/favicon.ico', desc: '精品windows软件' },
    { menu: '软件', title: 'Macwk', url: 'https://www.macwk.com', logo_url: 'https://www.macwk.com/favicon-32x32.ico', desc: '精品Mac软件' },
    { menu: '软件', title: 'Macsc', url: 'https://mac.macsc.com', logo_url: 'https://cdn.mac89.com/macsc_node/static/favicon.ico', desc: '' },
    // 在线工具
    { menu: '在线工具', title: 'JSON工具', url: 'https://www.json.cn', logo_url: 'https://img.icons8.com/nolan/128/json.png', desc: 'JSON格式化/校验' },
    { menu: '在线工具', title: 'base64工具', url: 'https://www.qqxiuzi.cn/bianma/base64.htm', logo_url: 'https://cdn.base64decode.org/assets/images/b64-180.webp', desc: '在线base64编码解码' },
    { menu: '在线工具', title: '二维码生成', url: 'https://cli.im', logo_url: 'https://img.icons8.com/fluency/96/qr-code.png', desc: '二维码生成工具' },
    { menu: '在线工具', title: 'JS混淆', url: 'https://obfuscator.io', logo_url: 'https://img.icons8.com/color/240/javascript--v1.png', desc: '在线Javascript代码混淆' },
    { menu: '在线工具', title: 'Python混淆', url: 'https://freecodingtools.org/tools/obfuscator/python', logo_url: 'https://img.icons8.com/color/240/python--v1.png', desc: '在线python代码混淆' },
    { menu: '在线工具', title: 'Remove.photos', url: 'https://remove.photos/zh-cn', logo_url: 'https://img.icons8.com/doodle/192/picture.png', desc: '一键抠图' },
    // 在线工具 - Dev Tools 子菜单卡片
    { subMenu: '开发工具', title: 'Uiverse', url: 'https://uiverse.io/elements', logo_url: 'https://img.icons8.com/fluency/96/web-design.png', desc: 'CSS动画和设计元素' },
    { subMenu: '开发工具', title: 'Icons8', url: 'https://igoutu.cn/icons', logo_url: 'https://maxst.icons8.com/vue-static/landings/primary-landings/favs/icons8_fav_32×32.png', desc: '免费图标和设计资源' },
    // 其他
    { menu: '其他', title: 'Gmail', url: 'https://mail.google.com', logo_url: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', desc: 'Google邮箱' },
    { menu: '其他', title: 'Outlook', url: 'https://outlook.live.com', logo_url: 'https://img.icons8.com/color/256/ms-outlook.png', desc: '微软Outlook邮箱' },
    { menu: '其他', title: 'Proton Mail', url: 'https://account.proton.me', logo_url: 'https://account.proton.me/assets/apple-touch-icon-120x120.png', desc: '安全加密邮箱' },
    { menu: '其他', title: 'QQ邮箱', url: 'https://mail.qq.com', logo_url: 'https://mail.qq.com/zh_CN/htmledition/images/favicon/qqmail_favicon_96h.png', desc: '腾讯QQ邮箱' },
    { menu: '其他', title: '雅虎邮箱', url: 'https://mail.yahoo.com', logo_url: 'https://img.icons8.com/color/240/yahoo--v2.png', desc: '雅虎邮箱' },
    { menu: '其他', title: '10分钟临时邮箱', url: 'https://linshiyouxiang.net', logo_url: 'https://linshiyouxiang.net/static/index/zh/images/favicon.ico', desc: '10分钟临时邮箱' },
  ];

const defaultFriends = [
  ['Noodseek图床', 'https://www.nodeimage.com', 'https://www.nodeseek.com/static/image/favicon/favicon-32x32.png'],
  ['Font Awesome', 'https://fontawesome.com', 'https://fontawesome.com/favicon.ico']
];

function seed(db) {
  const insertMenu = db.prepare('INSERT INTO menus (name, "order") VALUES (?, ?)');
  for (const menu of defaultMenus) {
    insertMenu.run(menu);
  }
  insertMenu.free();

  const menuMap = {};
  const menus = db.exec("SELECT * FROM menus");
  menus[0].values.forEach(row => {
    menuMap[row[1]] = row[0];
  });

  const subMenuMap = {};
  const insertSubMenu = db.prepare('INSERT INTO sub_menus (parent_id, name, "order") VALUES (?, ?, ?)');
  subMenus.forEach(subMenu => {
    if (menuMap[subMenu.parentMenu]) {
      insertSubMenu.run([menuMap[subMenu.parentMenu], subMenu.name, subMenu.order]);
      const row = db.exec("SELECT last_insert_rowid()");
      subMenuMap[`${subMenu.parentMenu}_${subMenu.name}`] = row[0].values[0][0];
    }
  });
  insertSubMenu.free();

  const insertCard = db.prepare('INSERT INTO cards (menu_id, sub_menu_id, title, url, logo_url, desc) VALUES (?, ?, ?, ?, ?, ?)');
  cards.forEach(card => {
    if (card.subMenu) {
      let subMenuId = null;
      for (const [key, id] of Object.entries(subMenuMap)) {
        if (key.endsWith(`_${card.subMenu}`)) {
          subMenuId = id;
          break;
        }
      }
      if (subMenuId) {
        insertCard.run([null, subMenuId, card.title, card.url, card.logo_url, card.desc]);
      }
    } else if (menuMap[card.menu]) {
      insertCard.run([menuMap[card.menu], null, card.title, card.url, card.logo_url, card.desc]);
    }
  });
  insertCard.free();

  const passwordHash = bcrypt.hashSync(config.admin.password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [config.admin.username, passwordHash]);

  const insertFriend = db.prepare('INSERT INTO friends (title, url, logo) VALUES (?, ?, ?)');
  defaultFriends.forEach(friend => insertFriend.run(friend));
  insertFriend.free();
}

module.exports = { seed };