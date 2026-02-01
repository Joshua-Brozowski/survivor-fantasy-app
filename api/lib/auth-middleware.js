import { verifyAccessToken, extractTokenFromHeader } from './jwt.js';

/**
 * Verify the request has a valid access token
 * Returns the decoded user payload or null
 */
export function authenticateRequest(req) {
  const token = extractTokenFromHeader(req);
  if (!token) {
    return null;
  }
  return verifyAccessToken(token);
}

/**
 * Check if request is authenticated and return user
 * Sends 401 response if not authenticated
 * Returns user object if authenticated, or null if response was sent
 */
export function requireAuth(req, res) {
  const user = authenticateRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return user;
}

/**
 * Check if request is from an admin user
 * Sends 401/403 response if not authenticated or not admin
 * Returns user object if admin, or null if response was sent
 */
export function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null; // 401 already sent

  if (!user.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return null;
  }
  return user;
}

/**
 * Check if the authenticated user can modify data for a specific player
 * Admins can modify anyone, players can only modify themselves
 */
export function canModifyPlayer(user, targetPlayerId) {
  if (!user) return false;
  if (user.isAdmin) return true;
  return user.playerId === targetPlayerId;
}

/**
 * List of storage keys that are public (readable without auth)
 * These are needed for app loading and display before authentication
 */
const PUBLIC_READ_KEYS = [
  // Global data
  'players',
  'contestants',
  'leagues',
  'leagueMemberships',
  // League-specific data (needed for app display)
  'picks',
  'picksLocked',
  'questionnaires',
  'submissions',
  'qotWVotes',
  'pickScores',
  'playerScores',
  'latePenalties',
  'playerAdvantages',
  'advantages',
  'episodes',
  'notifications',
  'challenges',
  'challengeAttempts',
  'gamePhase',
  'currentSeason',
  'seasonHistory',
  'seasonFinalized'
];

/**
 * List of storage keys that only admins can write
 */
const ADMIN_ONLY_WRITE_KEYS = [
  'contestants',
  'gamePhase',
  'picksLocked',
  'currentSeason',
  'seasonHistory',
  'seasonFinalized'
];

/**
 * Check if a key is publicly readable
 */
export function isPublicReadKey(key) {
  // Check exact match or league-prefixed version
  const baseKey = key.replace(/^league_\d+_/, '');

  // Security questions need to be readable for password recovery (before login)
  if (key.startsWith('security_')) {
    return true;
  }

  return PUBLIC_READ_KEYS.includes(key) || PUBLIC_READ_KEYS.includes(baseKey);
}

/**
 * Check if a key requires admin to write
 */
export function isAdminOnlyWriteKey(key) {
  const baseKey = key.replace(/^league_\d+_/, '');
  return ADMIN_ONLY_WRITE_KEYS.includes(baseKey);
}

/**
 * Check if a key is player-specific data that the player owns
 * Format: key contains playerId reference
 */
export function getPlayerIdFromKey(key) {
  // Match patterns like "password_1", "security_1"
  const match = key.match(/^(?:password|security)_(\d+)$/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}
