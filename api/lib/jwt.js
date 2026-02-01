import jwt from 'jsonwebtoken';

// Use environment variables for secrets
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';   // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';   // 7 days

/**
 * Generate an access token for a user
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      playerId: user.id,
      name: user.name,
      isAdmin: user.isAdmin || false
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(user, tokenVersion = 0) {
  return jwt.sign(
    {
      playerId: user.id,
      tokenVersion
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify an access token and return the decoded payload
 * Returns null if invalid or expired
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token and return the decoded payload
 * Returns null if invalid or expired
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 * Expects format: "Bearer <token>"
 */
export function extractTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Extract refresh token from cookie
 */
export function extractRefreshTokenFromCookie(req) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const match = cookies.match(/refreshToken=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Set refresh token as httpOnly cookie
 */
export function setRefreshTokenCookie(res, token) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  res.setHeader('Set-Cookie',
    `refreshToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
  );
}

/**
 * Clear refresh token cookie (for logout)
 */
export function clearRefreshTokenCookie(res) {
  res.setHeader('Set-Cookie',
    'refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  );
}
