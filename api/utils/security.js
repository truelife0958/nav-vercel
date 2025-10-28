/**
 * 老王的安全工具集
 * 艹！这些安全工具能让你的API更安全！
 */

/**
 * HTML 转义，防止 XSS 攻击
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * 清理用户输入，移除危险字符
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  
  // 移除控制字符
  let cleaned = str.replace(/[\x00-\x1F\x7F]/g, '');
  
  // 移除多余空白
  cleaned = cleaned.trim().replace(/\s+/g, ' ');
  
  return cleaned;
}

/**
 * 验证并清理 URL
 */
function sanitizeUrl(url) {
  if (typeof url !== 'string') return null;
  
  try {
    const parsed = new URL(url);
    
    // 只允许 http 和 https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // 防止 JavaScript 伪协议
    if (url.toLowerCase().includes('javascript:')) {
      return null;
    }
    
    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * 检测 SQL 注入尝试
 */
function detectSqlInjection(str) {
  if (typeof str !== 'string') return false;
  
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*\/|\/\*)/g,
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bOR\b.*=.*)/gi,
    /(;.*DROP)/gi,
    /(\bAND\b.*=.*)/gi
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(str));
}

/**
 * 检测 XSS 尝试
 */
function detectXss(str) {
  if (typeof str !== 'string') return false;
  
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<img[^>]+src[^>]*>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(str));
}

/**
 * 生成安全的随机字符串
 */
function generateSecureToken(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 安全地比较两个字符串（防止时序攻击）
 */
function secureCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  
  if (a.length !== b.length) {
    return false;
  }
  
  const crypto = require('crypto');
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * 限制对象的字段（白名单）
 */
function filterObjectFields(obj, allowedFields) {
  const filtered = {};
  
  for (const field of allowedFields) {
    if (obj.hasOwnProperty(field)) {
      filtered[field] = obj[field];
    }
  }
  
  return filtered;
}

/**
 * 验证整数 ID
 */
function validateId(id) {
  const numId = parseInt(id, 10);
  
  if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
    return null;
  }
  
  return numId;
}

/**
 * 验证分页参数
 */
function validatePagination(page, pageSize, maxPageSize = 100) {
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const size = Math.min(
    Math.max(parseInt(pageSize) || 10, 1),
    maxPageSize
  );
  
  return {
    page: pageNum,
    pageSize: size,
    offset: (pageNum - 1) * size
  };
}

/**
 * 检查是否为有效的排序字段
 */
function validateSortField(field, allowedFields) {
  if (!allowedFields.includes(field)) {
    return allowedFields[0]; // 返回默认字段
  }
  return field;
}

/**
 * 检查是否为有效的排序方向
 */
function validateSortDirection(direction) {
  const dir = (direction || 'asc').toLowerCase();
  return ['asc', 'desc'].includes(dir) ? dir : 'asc';
}

/**
 * 安全地解析 JSON
 */
function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}

/**
 * 移除对象中的空值
 */
function removeNullValues(obj) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

/**
 * 速率限制键生成器
 */
function getRateLimitKey(req, prefix = 'ratelimit') {
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             'unknown';
  
  return `${prefix}:${ip}`;
}

module.exports = {
  escapeHtml,
  sanitizeInput,
  sanitizeUrl,
  detectSqlInjection,
  detectXss,
  generateSecureToken,
  secureCompare,
  filterObjectFields,
  validateId,
  validatePagination,
  validateSortField,
  validateSortDirection,
  safeJsonParse,
  removeNullValues,
  getRateLimitKey
};