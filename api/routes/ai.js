const express = require('express');
const auth = require('./authMiddleware');
const router = express.Router();

// AI辅助处理网站信息
router.post('/enhance-websites', auth, async (req, res) => {
  try {
    const { websites } = req.body;

    if (!websites || !Array.isArray(websites)) {
      return res.status(400).json({ error: 'Invalid websites data' });
    }

    const enhancedWebsites = [];

    for (const website of websites) {
      const enhanced = await enhanceWebsiteInfo(website);
      enhancedWebsites.push(enhanced);
    }

    res.json({
      success: true,
      data: enhancedWebsites
    });
  } catch (error) {
    console.error('AI enhance error:', error);
    res.status(500).json({ error: 'AI处理失败' });
  }
});

// AI辅助获取网站信息
router.post('/get-website-info', auth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const websiteInfo = await getWebsiteInfo(url);

    res.json({
      success: true,
      data: websiteInfo
    });
  } catch (error) {
    console.error('Get website info error:', error);
    res.status(500).json({ error: '获取网站信息失败' });
  }
});

// 辅助函数：增强网站信息
async function enhanceWebsiteInfo(website) {
  try {
    const url = new URL(website.url);
    const hostname = url.hostname;

    // 生成favicon URL
    const faviconUrl = `${url.protocol}//${hostname}/favicon.ico`;

    // 改善标题
    let enhancedTitle = website.title;
    if (!enhancedTitle || enhancedTitle === '未命名') {
      enhancedTitle = hostname;
    }

    // 清理标题中的特殊字符
    enhancedTitle = enhancedTitle.replace(/[\r\n\t]+/g, ' ').trim();

    // 生成描述
    let enhancedDescription = website.description || '';
    if (!enhancedDescription) {
      enhancedDescription = generateDescription(hostname, enhancedTitle);
    }

    return {
      ...website,
      title: enhancedTitle,
      description: enhancedDescription,
      logo_url: website.logo_url || faviconUrl
    };
  } catch (error) {
    console.error('Enhance website error:', error);
    return {
      ...website,
      description: website.description || '网站'
    };
  }
}

// 辅助函数：生成网站描述
function generateDescription(hostname, title) {
  // 常见网站的描述映射
  const descriptions = {
    'github.com': '代码托管平台，全球最大的开源社区',
    'stackoverflow.com': '程序员问答社区，技术问题解答平台',
    'google.com': '全球最大的搜索引擎',
    'youtube.com': '视频分享平台，全球最大的视频网站',
    'facebook.com': '社交网络平台',
    'twitter.com': '微博社交平台',
    'linkedin.com': '职业社交网络',
    'instagram.com': '图片分享社交平台',
    'reddit.com': '社交新闻聚合网站',
    'wikipedia.org': '在线百科全书',
    'medium.com': '在线写作和发布平台',
    'zhihu.com': '知识问答社区',
    'bilibili.com': '视频弹幕网站',
    'weibo.com': '微博社交平台',
    'taobao.com': '网购平台',
    'jd.com': '电商购物网站',
    'baidu.com': '中文搜索引擎',
    'qq.com': '腾讯官网',
    'wechat.com': '微信官网',
    'alipay.com': '支付宝官网'
  };

  // 检查是否有预定义的描述
  for (const [domain, description] of Object.entries(descriptions)) {
    if (hostname.includes(domain)) {
      return description;
    }
  }

  // 根据域名类型生成描述
  if (hostname.includes('blog')) {
    return '博客网站';
  } else if (hostname.includes('news')) {
    return '新闻资讯网站';
  } else if (hostname.includes('docs')) {
    return '文档网站';
  } else if (hostname.includes('api')) {
    return 'API接口文档';
  } else if (hostname.includes('tool')) {
    return '在线工具网站';
  } else if (hostname.includes('edu')) {
    return '教育网站';
  } else if (hostname.includes('gov')) {
    return '政府官网';
  } else if (hostname.includes('shop') || hostname.includes('store')) {
    return '购物网站';
  } else if (hostname.includes('wiki')) {
    return '知识库网站';
  }

  // 默认描述
  return `来自 ${hostname} 的网站`;
}

// 辅助函数：获取网站信息（可以扩展为爬虫功能）
async function getWebsiteInfo(url) {
  try {
    // 这里可以实现网站信息爬取功能
    // 目前返回基本信息
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    return {
      title: hostname,
      description: generateDescription(hostname, hostname),
      logo_url: `${urlObj.protocol}//${hostname}/favicon.ico`,
      url: url
    };
  } catch (error) {
    throw new Error('Invalid URL');
  }
}

module.exports = router;