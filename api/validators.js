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
      new URL(value);
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

// 卡片验证
const cardSchema = {
  menu_id: ['optional', 'integer', rules.min(1)],
  sub_menu_id: ['optional', 'integer', rules.min(1)],
  title: ['required', 'string', rules.min(1), rules.max(255)],
  url: ['required', 'string', 'url'],
  logo_url: ['optional', 'string'],
  custom_logo_path: ['optional', 'string', rules.max(500)],
  description: ['optional', 'string', rules.max(1000)],
  sort_order: ['optional', 'integer', rules.min(0)]
};

// 菜单验证
const menuSchema = {
  name: ['required', 'string', rules.min(1), rules.max(255)],
  sort_order: ['optional', 'integer', rules.min(0)]
};

// 子菜单验证
const subMenuSchema = {
  name: ['required', 'string', rules.min(1), rules.max(255)],
  sort_order: ['optional', 'integer', rules.min(0)]
};

// 登录验证
const loginSchema = {
  username: ['required', 'string', rules.min(3), rules.max(30)],
  password: ['required', 'string', rules.min(6)]
};

// 修改密码验证
const changePasswordSchema = {
  oldPassword: ['required', 'string', rules.min(6)],
  newPassword: ['required', 'string', rules.min(6)]
};

// 广告验证
const adSchema = {
  position: ['required', 'string', rules.min(1), rules.max(50)],
  img: ['required', 'string', 'url'],
  url: ['required', 'string', 'url']
};

// 友链验证
const friendSchema = {
  title: ['required', 'string', rules.min(1), rules.max(255)],
  url: ['required', 'string', 'url'],
  logo: ['optional', 'string']
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
  friendSchema
};
