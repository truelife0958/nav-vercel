const jwt = require('jsonwebtoken');
const config = require('./config');

const user = { id: 1, username: 'admin' };
const token = jwt.sign(user, config.server.jwtSecret, { expiresIn: '1h' });
console.log(token);