const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 * @param {string} id      - MongoDB user _id
 * @param {string} role    - user | admin
 * @returns {string}       - signed JWT string
 */
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
