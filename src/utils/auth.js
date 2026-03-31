
const jwt = require('jsonwebtoken');
require('dotenv').config();

const COOKIE_NAME = 'auth_token';

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
}

module.exports = { COOKIE_NAME, createToken, verifyToken };
