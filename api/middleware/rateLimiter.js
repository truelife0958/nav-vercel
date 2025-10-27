/**
 * 老王的请求限流系统
 * 艹！防止暴力破解这种SB行为！
 */

/**
 * 简单的内存限流器
 * 注意：Vercel Serverless环境下这个会在每次冷启动时重置
 * 生产环境建议用Redis实现
 */
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 默认15分钟
    this.max = options.max || 100; // 默认最多100次请求
    this.message = options.message || '请求过于频繁，请稍后再试';
    this.keyGenerator = options.keyGenerator || ((req) => req.ip || req.connection.remoteAddress);
    this.skip = options.skip || (() => false);

    // 存储请求记录
    this.requests = new Map();

    // 定期清理过期记录
    setInterval(() => this.cleanup(), this.windowMs);
  }

  middleware() {
    return (req, res, next) => {
      // 如果应该跳过限流
      if (this.skip(req)) {
        return next();
      }

      const key = this.keyGenerator(req);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // 获取该key的请求记录
      if (!this.requests.has(key)) {
        this.requests.set(key, []);
      }

      const userRequests = this.requests.get(key);

      // 过滤掉窗口外的请求
      const recentRequests = userRequests.filter(time => time > windowStart);

      if (recentRequests.length >= this.max) {
        console.warn(`⚠️  限流触发: ${key} 已达到${this.max}次请求限制`);
        return res.status(429).json({
          error: this.message,
          retryAfter: Math.ceil((recentRequests[0] + this.windowMs - now) / 1000)
        });
      }

      // 记录本次请求
      recentRequests.push(now);
      this.requests.set(key, recentRequests);

      next();
    };
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

/**
 * 创建限流中间件
 */
function createRateLimiter(options) {
  const limiter = new RateLimiter(options);
  return limiter.middleware();
}

/**
 * 预定义的限流器
 */

// 登录限流：15分钟最多5次
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: '登录尝试次数过多，请15分钟后再试',
  keyGenerator: (req) => {
    // 艹！用IP+用户名组合来限流，更精准！
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const username = req.body?.username || 'unknown';
    return `${ip}:${username}`;
  }
});

// API通用限流：1分钟最多100次
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'API请求过于频繁，请稍后再试'
});

// 严格限流：用于敏感操作，1分钟最多10次
const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: '操作过于频繁，请稍后再试'
});

module.exports = {
  RateLimiter,
  createRateLimiter,
  loginLimiter,
  apiLimiter,
  strictLimiter
};
