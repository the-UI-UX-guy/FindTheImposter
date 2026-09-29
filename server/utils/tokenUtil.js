const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate a signed JWT token
 * @param {Object} payload - Data to encode in token (e.g. { id, role, email, username })
 * @param {string|number} [expiresIn] - Optional custom expiration
 * @returns {string} - JWT token
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = {
  generateToken,
  verifyToken
};
