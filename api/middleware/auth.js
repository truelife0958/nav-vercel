/**
 * 老王的认证中间件
 * 艹！把认证逻辑单独提取出来，符合单一职责原则！
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { createError } = require('./errorHandler');

const JWT_SECRET = config.server.jwtSecret;

/**
 * JWT认证中间件
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError.unauthorized(
      '未提供认证令牌',
      '请在请求头中添加 Authorization: Bearer <token>'
    ));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    console.error('JWT verification error:', e);

    if (e.name === 'TokenExpiredError') {
      return next(createError.unauthorized(
        'Token已过期，请重新登录',
        '令牌有效期为24小时'
      ));
    }

    return next(createError.unauthorized(
      'Token无效，请重新登录',
      e.message
    ));
  }
}

/**
 * 可选认证中间件（认证失败也允许通过，但不设置req.user）
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (e) {
    // 艹！可选认证失败不报错，直接放行
    console.warn('Optional auth failed:', e.message);
  }

  next();
}

module.exports = {
  authMiddleware,
  optionalAuth
};
