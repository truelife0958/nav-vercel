/**
 * 老王的日志系统
 * 艹！不用什么winston了，老王我自己写一个简单的！
 */

const fs = require('fs');
const path = require('path');

// 日志级别
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// 日志级别名称
const LevelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

class Logger {
  constructor(options = {}) {
    this.level = options.level || LogLevel.INFO;
    this.logToConsole = options.logToConsole !== false;
    this.logToFile = options.logToFile || false;
    this.logDir = options.logDir || path.join(__dirname, '../logs');

    // 如果需要记录到文件，确保目录存在
    if (this.logToFile && !fs.existsSync(this.logDir)) {
      try {
        fs.mkdirSync(this.logDir, { recursive: true });
      } catch (err) {
        console.error('创建日志目录失败:', err);
        this.logToFile = false;
      }
    }
  }

  formatMessage(level, message, meta) {
    const timestamp = new Date().toISOString();
    const levelName = LevelNames[level];

    let formatted = `[${timestamp}] [${levelName}] ${message}`;

    if (meta && Object.keys(meta).length > 0) {
      formatted += ' ' + JSON.stringify(meta);
    }

    return formatted;
  }

  log(level, message, meta = {}) {
    if (level < this.level) {
      return;
    }

    const formatted = this.formatMessage(level, message, meta);

    // 输出到控制台
    if (this.logToConsole) {
      const consoleMethod = level >= LogLevel.ERROR ? console.error : console.log;
      consoleMethod(formatted);
    }

    // 写入文件
    if (this.logToFile) {
      this.writeToFile(level, formatted);
    }
  }

  writeToFile(level, message) {
    const date = new Date().toISOString().split('T')[0];
    const filename = level >= LogLevel.ERROR ? `error-${date}.log` : `app-${date}.log`;
    const filepath = path.join(this.logDir, filename);

    try {
      fs.appendFileSync(filepath, message + '\n', 'utf8');
    } catch (err) {
      console.error('写入日志文件失败:', err);
    }
  }

  debug(message, meta) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message, meta) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message, meta) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message, meta) {
    this.log(LogLevel.ERROR, message, meta);
  }

  fatal(message, meta) {
    this.log(LogLevel.FATAL, message, meta);
  }
}

// 创建全局日志实例
const logger = new Logger({
  level: process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG : LogLevel.INFO,
  logToConsole: true,
  // 艹！Vercel Serverless环境写不了文件，所以默认关闭
  logToFile: process.env.LOG_TO_FILE === 'true'
});

/**
 * 请求日志中间件
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // 记录请求
  logger.info(`→ ${req.method} ${req.path}`, {
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  // 记录响应
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    logger.log(level, `← ${req.method} ${req.path} ${res.statusCode} ${duration}ms`, {
      statusCode: res.statusCode,
      duration
    });
  });

  next();
}

module.exports = {
  Logger,
  LogLevel,
  logger,
  requestLogger
};
