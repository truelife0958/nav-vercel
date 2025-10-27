require('dotenv').config();

// 艹！老王的安全配置，不许用弱密码！
const isProduction = process.env.NODE_ENV === 'production';

// 检查管理员密码
const getAdminPassword = () => {
  if (!process.env.ADMIN_PASSWORD) {
    if (isProduction) {
      console.error('❌ 严重错误：生产环境未设置ADMIN_PASSWORD环境变量！');
      throw new Error('生产环境必须设置ADMIN_PASSWORD环境变量');
    }
    console.warn('⚠️  开发环境使用默认密码123456，生产环境禁止使用！');
    return '123456';
  }

  // 密码强度检查
  const password = process.env.ADMIN_PASSWORD;
  if (isProduction && password.length < 8) {
    console.error('❌ 密码太弱！生产环境密码至少需要8位');
    throw new Error('ADMIN_PASSWORD密码强度不足');
  }

  return password;
};

// 检查JWT密钥
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    if (isProduction) {
      console.error('❌ 严重错误：生产环境未设置JWT_SECRET环境变量！');
      throw new Error('生产环境必须设置JWT_SECRET环境变量');
    }
    console.warn('⚠️  开发环境使用默认JWT密钥，生产环境禁止使用！');
    return 'nav-item-jwt-secret-2024-secure-key';
  }

  const secret = process.env.JWT_SECRET;
  if (isProduction && secret.length < 32) {
    console.error('❌ JWT密钥太短！生产环境密钥至少需要32位');
    throw new Error('JWT_SECRET密钥强度不足');
  }

  return secret;
};

module.exports = {
  /**
   * 管理员配置（老王的安全版本）
   */
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: getAdminPassword()
  },
  /**
   * 服务器配置
   */
  server: {
    port: process.env.PORT || 3000,
    jwtSecret: getJwtSecret()
  }
};