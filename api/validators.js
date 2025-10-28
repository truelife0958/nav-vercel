/**
 * 老王的输入验证系统
 * 艹！不用什么Joi了，老王我自己写一个简单粗暴的！
 */

// 验证规则
const rules = {
  required: (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
      return `${fieldName}不能为空`;
    }
    return null;
  },

  string: (value, fieldName) => {
    if (typeof value !== 'string') {
      return `${fieldName}必须是字符串`;
    }
    return null;
  },

  number: (value, fieldName) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return `${fieldName}必须是数字`;
    }
    return null;
  },

  integer: (value, fieldName) => {
    if (!Number.isInteger(value)) {
      return `${fieldName}必须是整数`;
    }
    return null;
  },

  min: (minValue) => (value, fieldName) => {
    if (typeof value === 'string' && value.length < minValue) {
      return `${fieldName}长度不能少于${minValue}个字符`;
    }
    if (typeof value === 'number' && value < minValue) {
      return `${fieldName}不能小于${minValue}`;
    }
    return null;
  },

  max: (maxValue) => (value, fieldName) => {
    if (typeof value === 'string' && value.length > maxValue) {
      return `${fieldName}长度不能超过${maxValue}个字符`;
    }
    if (typeof value === 'number' && value > maxValue) {
      return `${fieldName}不能大于${maxValue}`;
    }
    return null;
  },

  url: (value, fieldName) => {
    try {
      const url = new URL(value);
      // 只允许 http 和 https 协议
      if (!['http:', 'https:'].includes(url.protocol)) {
        return `${fieldName}必须使用http或https协议`;
      }
      return null;
    } catch {
      return `${fieldName}必须是有效的URL`;
    }
  },

  email: (value, fieldName) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName}必须是有效的邮箱地址`;
    }
    return null;
  },

  // XSS 防护：检测危险字符
  noXSS: (value, fieldName) => {
    if (typeof value !== 'string') return null;
    
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(value)) {
        return `${fieldName}包含不安全的内容`;
      }
    }
    return null;
  },

  // SQL 注入防护：检测危险 SQL 关键字
  noSQLInjection: (value, fieldName) => {
    if (typeof value !== 'string') return null;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(--|\*\/|\/\*)/g,
      /(\bUNION\b.*\bSELECT\b)/gi,
      /(\bOR\b.*=.*)/gi,
      /(;.*DROP)/gi
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        return `${fieldName}包含不安全的字符`;
      }
    }
    return null;
  },

  // 字母数字验证
  alphanumeric: (value, fieldName) => {
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return `${fieldName}只能包含字母和数字`;
    }
    return null;
  },

  // 中英文字符验证
  textOnly: (value, fieldName) => {
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_.,!?，。！？、]+$/.test(value)) {
      return `${fieldName}包含不允许的特殊字符`;
    }
    return null;
  },

  // 枚举验证
  enum: (allowedValues) => (value, fieldName) => {
    if (!allowedValues.includes(value)) {
      return `${fieldName}必须是以下值之一: ${allowedValues.join(', ')}`;
    }
    return null;
  },

  // 正整数验证
  positiveInteger: (value, fieldName) => {
    if (!Number.isInteger(value) || value <= 0) {
      return `${fieldName}必须是正整数`;
    }
    return null;
  },

  optional: () => null // 可选字段，跳过验证
};

/**
 * 验证器类
 */
class Validator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(data) {
    const errors = [];
    const sanitized = {};

    for (const [field, fieldRules] of Object.entries(this.schema)) {
      const value = data[field];
      let currentValue = value;

      // 如果是可选字段且值为空，跳过
      if (fieldRules.includes('optional') && (value === undefined || value === null || value === '')) {
        continue;
      }

      // 执行所有验证规则
      for (const rule of fieldRules) {
        if (typeof rule === 'string') {
          const ruleFunc = rules[rule];
          if (ruleFunc) {
            const error = ruleFunc(currentValue, field);
            if (error) {
              errors.push(error);
              break;
            }
          }
        } else if (typeof rule === 'function') {
          const error = rule(currentValue, field);
          if (error) {
            errors.push(error);
            break;
          }
        }
      }

      sanitized[field] = currentValue;
    }

    if (errors.length > 0) {
      return { valid: false, errors, data: null };
    }

    return { valid: true, errors: [], data: sanitized };
  }
}

/**
 * 创建验证中间件
 */
function validate(schema) {
  const validator = new Validator(schema);

  return (req, res, next) => {
    const result = validator.validate(req.body);

    if (!result.valid) {
      return res.status(400).json({
        error: '参数验证失败',
        details: result.errors.join('; ')
      });
    }

    // 使用验证和清理后的数据
    req.body = result.data;
    next();
  };
}

// ==================== 预定义的验证规则 ====================

// 卡片验证（增强安全性）
const cardSchema = {
  menu_id: ['optional', 'integer', rules.min(1)],
  sub_menu_id: ['optional', 'integer', rules.min(1)],
  title: ['required', 'string', rules.min(1), rules.max(255), 'noXSS', 'textOnly'],
  url: ['required', 'string', 'url', 'noXSS'],
  logo_url: ['optional', 'string', 'noXSS'],
  custom_logo_path: ['optional', 'string', rules.max(500), 'noXSS'],
  description: ['optional', 'string', rules.max(1000), 'noXSS', 'textOnly'],
  sort_order: ['optional', 'integer', rules.min(0)]
};

// 菜单验证（增强安全性）
const menuSchema = {
  name: ['required', 'string', rules.min(1), rules.max(255), 'noXSS', 'noSQLInjection', 'textOnly'],
  sort_order: ['optional', 'integer', rules.min(0)]
};

// 子菜单验证（增强安全性）
const subMenuSchema = {
  name: ['required', 'string', rules.min(1), rules.max(255), 'noXSS', 'noSQLInjection', 'textOnly'],
  sort_order: ['optional', 'integer', rules.min(0)]
};

// 登录验证（增强安全性）
const loginSchema = {
  username: ['required', 'string', rules.min(3), rules.max(30), 'noXSS', 'noSQLInjection'],
  password: ['required', 'string', rules.min(6), rules.max(100)]
};

// 修改密码验证（增强安全性）
const changePasswordSchema = {
  oldPassword: ['required', 'string', rules.min(6), rules.max(100)],
  newPassword: ['required', 'string', rules.min(6), rules.max(100)]
};

// 广告验证（增强安全性）
const adSchema = {
  position: ['required', 'string', rules.min(1), rules.max(50), 'noXSS', rules.enum(['left', 'right', 'top', 'bottom'])],
  img: ['required', 'string', 'url', 'noXSS'],
  url: ['required', 'string', 'url', 'noXSS']
};

// 友链验证（增强安全性）
const friendSchema = {
  title: ['required', 'string', rules.min(1), rules.max(255), 'noXSS', 'textOnly'],
  url: ['required', 'string', 'url', 'noXSS'],
  logo: ['optional', 'string', 'noXSS']
};

// 品牌设置验证
const brandSchema = {
  site_name: ['optional', 'string', rules.min(1), rules.max(100), 'noXSS', 'textOnly'],
  site_logo: ['optional', 'string', 'noXSS'],
  site_description: ['optional', 'string', rules.max(500), 'noXSS', 'textOnly'],
  site_keywords: ['optional', 'string', rules.max(500), 'noXSS', 'textOnly'],
  footer_text: ['optional', 'string', rules.max(500), 'noXSS', 'textOnly'],
  icp_number: ['optional', 'string', rules.max(100), 'noXSS']
};

module.exports = {
  validate,
  rules,
  Validator,
  cardSchema,
  menuSchema,
  subMenuSchema,
  loginSchema,
  changePasswordSchema,
  adSchema,
  friendSchema,
  brandSchema
};
