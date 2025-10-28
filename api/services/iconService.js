/**
 * 老王的图标获取服务
 * 艹！多种策略，自动降级，还有缓存！牛逼！
 */

const axios = require('axios');
const { sanitizeUrl } = require('../utils/security');

/**
 * 图标获取策略配置
 */
const ICON_STRATEGIES = [
  {
    name: 'google',
    url: (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    priority: 1
  },
  {
    name: 'duckduckgo',
    url: (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    priority: 2
  },
  {
    name: 'favicon',
    url: (domain) => `https://${domain}/favicon.ico`,
    priority: 3
  },
  {
    name: 'apple-touch-icon',
    url: (domain) => `https://${domain}/apple-touch-icon.png`,
    priority: 4
  },
  {
    name: 'direct',
    url: (url) => url,
    priority: 5
  }
];

/**
 * 默认图标（base64编码的透明1x1像素PNG）
 */
const DEFAULT_ICON = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * 内存缓存（简单实现）
 */
class IconCache {
  constructor(maxSize = 1000, ttl = 3600000) { // 默认1小时
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// 创建全局缓存实例
const iconCache = new IconCache();

/**
 * 从URL提取域名
 */
function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

/**
 * 检查URL是否可访问
 */
async function checkUrl(url, timeout = 5000) {
  try {
    const response = await axios.head(url, {
      timeout,
      maxRedirects: 3,
      validateStatus: (status) => status < 400
    });
    return response.status >= 200 && response.status < 300;
  } catch {
    return false;
  }
}

/**
 * 获取图标URL（使用策略模式）
 */
async function getIconUrl(siteUrl, options = {}) {
  const {
    preferredStrategy = null,
    useCache = true,
    timeout = 5000
  } = options;

  // 验证和清理URL
  const cleanUrl = sanitizeUrl(siteUrl);
  if (!cleanUrl) {
    return DEFAULT_ICON;
  }

  // 尝试从缓存获取
  if (useCache) {
    const cached = iconCache.get(cleanUrl);
    if (cached) {
      return cached;
    }
  }

  // 提取域名
  const domain = extractDomain(cleanUrl);
  if (!domain) {
    return DEFAULT_ICON;
  }

  // 排序策略（优先级）
  let strategies = [...ICON_STRATEGIES];
  if (preferredStrategy) {
    strategies.sort((a, b) => {
      if (a.name === preferredStrategy) return -1;
      if (b.name === preferredStrategy) return 1;
      return a.priority - b.priority;
    });
  } else {
    strategies.sort((a, b) => a.priority - b.priority);
  }

  // 尝试每个策略
  for (const strategy of strategies) {
    try {
      const iconUrl = strategy.url(domain);
      const isValid = await checkUrl(iconUrl, timeout);
      
      if (isValid) {
        // 缓存成功的结果
        if (useCache) {
          iconCache.set(cleanUrl, iconUrl);
        }
        return iconUrl;
      }
    } catch (error) {
      console.warn(`图标策略 ${strategy.name} 失败:`, error.message);
      continue;
    }
  }

  // 所有策略都失败，返回默认图标
  return DEFAULT_ICON;
}

/**
 * 批量获取图标URL
 */
async function getBatchIconUrls(urls, options = {}) {
  const {
    concurrency = 5,
    ...otherOptions
  } = options;

  const results = [];
  
  // 分批处理
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(url => getIconUrl(url, otherOptions))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * 预加载常用网站图标
 */
async function preloadCommonIcons(urls) {
  console.log(`预加载 ${urls.length} 个网站图标...`);
  
  const results = await getBatchIconUrls(urls, {
    useCache: true,
    timeout: 3000
  });
  
  const successCount = results.filter(url => url !== DEFAULT_ICON).length;
  console.log(`预加载完成: ${successCount}/${urls.length} 成功`);
  
  return results;
}

/**
 * 清除图标缓存
 */
function clearIconCache() {
  iconCache.clear();
  console.log('图标缓存已清除');
}

/**
 * 获取缓存统计信息
 */
function getCacheStats() {
  return {
    size: iconCache.size(),
    maxSize: iconCache.maxSize,
    ttl: iconCache.ttl
  };
}

/**
 * 从HTML解析图标链接
 */
async function parseIconFromHtml(url, timeout = 5000) {
  try {
    const response = await axios.get(url, {
      timeout,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const html = response.data;
    
    // 尝试匹配各种图标标签
    const iconPatterns = [
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i,
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i
    ];

    for (const pattern of iconPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let iconUrl = match[1];
        
        // 处理相对路径
        if (iconUrl.startsWith('//')) {
          iconUrl = 'https:' + iconUrl;
        } else if (iconUrl.startsWith('/')) {
          const parsed = new URL(url);
          iconUrl = `${parsed.protocol}//${parsed.host}${iconUrl}`;
        } else if (!iconUrl.startsWith('http')) {
          const parsed = new URL(url);
          iconUrl = `${parsed.protocol}//${parsed.host}/${iconUrl}`;
        }
        
        return iconUrl;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('解析HTML图标失败:', error.message);
    return null;
  }
}

/**
 * 智能获取图标（结合HTML解析）
 */
async function getIconUrlSmart(siteUrl, options = {}) {
  // 首先尝试标准策略
  let iconUrl = await getIconUrl(siteUrl, options);
  
  // 如果失败，尝试解析HTML
  if (iconUrl === DEFAULT_ICON) {
    const parsedIcon = await parseIconFromHtml(siteUrl);
    if (parsedIcon) {
      iconUrl = parsedIcon;
      // 缓存解析结果
      if (options.useCache !== false) {
        iconCache.set(siteUrl, iconUrl);
      }
    }
  }
  
  return iconUrl;
}

module.exports = {
  getIconUrl,
  getBatchIconUrls,
  getIconUrlSmart,
  parseIconFromHtml,
  preloadCommonIcons,
  clearIconCache,
  getCacheStats,
  DEFAULT_ICON,
  ICON_STRATEGIES
};