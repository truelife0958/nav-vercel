const jwt = require('jsonwebtoken');
const config = require('../config');
const JWT_SECRET = config.server.jwtSecret;

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth middleware: No or invalid Authorization header');
    return res.status(401).json({ error: 'No token provided or token is malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    console.error('JWT verification error:', e);
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired, please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token, please log in again' });
  }
}

module.exports = authMiddleware; 