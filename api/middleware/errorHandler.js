/**
 * 老王的统一错误处理系统
 * 艹！再也不用每个路由都写try-catch了！
 */

/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 异步路由包装器
 * 艹！这个SB包装器可以让你不用写try-catch了！
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 记录错误日志
  console.error('=== 错误详情 ===');
  console.error('路径:', req.method, req.path);
  console.error('错误:', err.message);
  console.error('堆栈:', err.stack);
  console.error('================');

  // 确定状态码
  let statusCode = 500;
  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
  }

  // 构建错误响应
  const response = {
    error: err.message || 'Internal Server Error',
    status: statusCode
  };

  // 在开发环境返回详细信息
  if (process.env.NODE_ENV === 'development') {
    response.details = err.details || err.stack;
    response.path = req.path;
    response.method = req.method;
  } else if (err.details) {
    // 生产环境只返回有意义的details（不返回stack）
    response.details = err.details;
  }

  res.status(statusCode).json(response);
}

/**
 * 404处理中间件
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(
    `路由不存在: ${req.method} ${req.path}`,
    404,
    '请检查API文档确认正确的路由'
  );
  next(error);
}

/**
 * 常用错误创建函数
 */
const createError = {
  badRequest: (message, details) => new AppError(message, 400, details),
  unauthorized: (message, details) => new AppError(message, 401, details),
  forbidden: (message, details) => new AppError(message, 403, details),
  notFound: (message, details) => new AppError(message, 404, details),
  conflict: (message, details) => new AppError(message, 409, details),
  internal: (message, details) => new AppError(message, 500, details)
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  createError
};
