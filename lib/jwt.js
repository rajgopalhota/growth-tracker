import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * Generate a JWT token
 * @param {Object} payload - The payload to encode
 * @param {Object} options - Token options
 * @returns {string} JWT token
 */
export function generateToken(payload, options = {}) {
  const defaultOptions = {
    expiresIn: options.expiresIn || '7d',
    ...options
  };
  
  return jwt.sign(payload, JWT_SECRET, defaultOptions);
}

/**
 * Verify and decode a JWT token
 * @param {string} token - The token to verify
 * @returns {Object} Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Generate access and refresh token pair
 * @param {Object} user - User object
 * @returns {Object} Tokens object
 */
export function generateTokenPair(user) {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role || 'user'
  };

  const accessToken = generateToken(payload, { expiresIn: '15m' });
  const refreshToken = generateToken(payload, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

export default { generateToken, verifyToken, generateTokenPair };
