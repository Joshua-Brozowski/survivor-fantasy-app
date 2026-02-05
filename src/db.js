// Simple storage wrapper for MongoDB API
const API_BASE = '/api';

// ============================================
// JWT Token Management
// ============================================

// Store access token in memory (more secure than localStorage)
let accessToken = null;

// Get the current access token
export function getAccessToken() {
  return accessToken;
}

// Set the access token (called after login/refresh)
export function setAccessToken(token) {
  accessToken = token;
}

// Clear the access token (called on logout)
export function clearAccessToken() {
  accessToken = null;
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh the access token using the httpOnly refresh token cookie
 * Returns the new user data or null if refresh failed
 */
export async function refreshAccessToken() {
  // If already refreshing, wait for that to complete
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ action: 'refresh' })
      });

      if (!response.ok) {
        clearAccessToken();
        return null;
      }

      const data = await response.json();
      if (data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAccessToken();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Authenticated fetch wrapper - adds Authorization header and handles token refresh
 */
export async function authFetch(url, options = {}) {
  const headers = {
    ...options.headers,
  };

  // Add auth header if we have a token
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Include credentials for cookies
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  // If 401 and we had a token, try to refresh
  if (response.status === 401 && accessToken) {
    const user = await refreshAccessToken();
    if (user) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });
    }
  }

  return response;
}

// ============================================
// End Token Management
// ============================================

// Keys that are league-specific (will be prefixed with league_{id}_)
export const LEAGUE_SPECIFIC_KEYS = [
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

// Keys that are global (shared across all leagues)
export const GLOBAL_KEYS = [
  'players',
  'leagues',
  'leagueMemberships',
  'contestants'
  // Note: password_{id} and security_{id} are also global but use dynamic keys
];

/**
 * Creates a league-aware storage interface that automatically prefixes
 * league-specific keys while leaving global keys unprefixed.
 *
 * @param {number} leagueId - The league ID to scope storage to
 * @returns {Object} Storage interface with get, set, delete, list methods
 */
export const createLeagueStorage = (leagueId) => {
  if (!leagueId || typeof leagueId !== 'number') {
    throw new Error('createLeagueStorage requires a valid numeric leagueId');
  }

  const prefix = `league_${leagueId}_`;

  // Determine if a key should be prefixed based on its base name
  const shouldPrefix = (key) => {
    // Check if the key (or its base name) is in the league-specific list
    const baseKey = key.split('_')[0]; // Handle keys like 'picks' from 'league_1_picks'
    return LEAGUE_SPECIFIC_KEYS.includes(key) || LEAGUE_SPECIFIC_KEYS.includes(baseKey);
  };

  // Get the full key (prefixed if league-specific)
  const getFullKey = (key) => {
    if (shouldPrefix(key)) {
      return `${prefix}${key}`;
    }
    return key;
  };

  return {
    // Get the current league ID
    leagueId,

    // Get the prefix for this league
    prefix,

    async get(key) {
      return storage.get(getFullKey(key));
    },

    async set(key, value) {
      return storage.set(getFullKey(key), value);
    },

    async delete(key) {
      return storage.delete(getFullKey(key));
    },

    async list(keyPrefix) {
      // When listing, always include the league prefix for league-specific data
      const fullPrefix = keyPrefix ? `${prefix}${keyPrefix}` : prefix;
      return storage.list(fullPrefix);
    },

    // Helper to check if using league-specific storage
    isLeagueSpecific(key) {
      return shouldPrefix(key);
    },

    // Get the raw unprefixed key for debugging
    getFullKey
  };
};

// Auth API wrapper for secure password handling
export const auth = {
  async login(playerId, password) {
    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({ action: 'login', playerId, password })
      });
      const data = await response.json();
      if (response.ok && data.success && data.accessToken) {
        setAccessToken(data.accessToken);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Auth login error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'logout' })
      });
    } catch (error) {
      console.error('Auth logout error:', error);
    } finally {
      clearAccessToken();
    }
  },

  async setPassword(playerId, newPassword) {
    try {
      // Requires authentication - user can only change own password (or admin)
      const response = await authFetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setPassword', playerId, newPassword })
      });
      const data = await response.json();
      return { success: response.ok && data.success, error: data.error };
    } catch (error) {
      console.error('Auth setPassword error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async resetToDefault(playerId) {
    try {
      // Requires admin authentication
      const response = await authFetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetToDefault', playerId })
      });
      const data = await response.json();
      return { success: response.ok && data.success, error: data.error };
    } catch (error) {
      console.error('Auth resetToDefault error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async verifyCurrentPassword(playerId, password) {
    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyCurrentPassword', playerId, password })
      });
      const data = await response.json();
      return { valid: data.valid, error: data.error };
    } catch (error) {
      console.error('Auth verify error:', error);
      return { valid: false, error: 'Network error' };
    }
  },

  async checkDefaultPasswords() {
    try {
      // Requires admin authentication
      const response = await authFetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkDefaultPasswords' })
      });
      const data = await response.json();
      return { success: data.success, results: data.results || {}, error: data.error };
    } catch (error) {
      console.error('Auth checkDefaultPasswords error:', error);
      return { success: false, results: {}, error: 'Network error' };
    }
  }
};

// Backup API wrapper for snapshots and data export
export const backup = {
  async createSnapshot(trigger) {
    try {
      const response = await authFetch(`${API_BASE}/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createSnapshot', trigger })
      });
      const data = await response.json();
      return { success: response.ok && data.success, snapshotId: data.snapshotId, error: data.error };
    } catch (error) {
      console.error('Backup createSnapshot error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async getSnapshots() {
    try {
      const response = await authFetch(`${API_BASE}/backup?action=getSnapshots`);
      const data = await response.json();
      return { success: response.ok && data.success, snapshots: data.snapshots || [], error: data.error };
    } catch (error) {
      console.error('Backup getSnapshots error:', error);
      return { success: false, snapshots: [], error: 'Network error' };
    }
  },

  async restoreSnapshot(snapshotId) {
    try {
      const response = await authFetch(`${API_BASE}/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restoreSnapshot', snapshotId })
      });
      const data = await response.json();
      return { success: response.ok && data.success, message: data.message, error: data.error };
    } catch (error) {
      console.error('Backup restoreSnapshot error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async exportData() {
    try {
      const response = await authFetch(`${API_BASE}/backup?action=exportData`);
      const data = await response.json();
      return { success: response.ok && data.success, data: data.data, error: data.error };
    } catch (error) {
      console.error('Backup exportData error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async deleteSnapshot(snapshotId) {
    try {
      const response = await authFetch(`${API_BASE}/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteSnapshot', snapshotId })
      });
      const data = await response.json();
      return { success: response.ok && data.success, error: data.error };
    } catch (error) {
      console.error('Backup deleteSnapshot error:', error);
      return { success: false, error: 'Network error' };
    }
  }
};

// Advantage API wrapper for atomic operations (prevents race conditions)
export const advantageApi = {
  async purchase(playerId, advantage, leagueId) {
    try {
      const response = await authFetch(`${API_BASE}/advantage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'purchase',
          playerId,
          advantageId: advantage.id,
          advantageName: advantage.name,
          advantageDescription: advantage.description,
          advantageType: advantage.type,
          advantageCost: advantage.cost,
          leagueId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error, message: data.message };
      }
      return { success: true, advantage: data.advantage, message: data.message };
    } catch (error) {
      console.error('Advantage purchase error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async queueForWeek(playerAdvantageId, weekNumber, targetPlayerId, leagueId) {
    try {
      const response = await authFetch(`${API_BASE}/advantage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'queueForWeek',
          advantageId: playerAdvantageId,
          weekNumber,
          targetPlayerId,
          leagueId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Advantage queue error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async cancelQueue(playerAdvantageId, leagueId) {
    try {
      const response = await authFetch(`${API_BASE}/advantage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancelQueue',
          advantageId: playerAdvantageId,
          leagueId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error };
      }
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Advantage cancel error:', error);
      return { success: false, error: 'Network error' };
    }
  }
};

export const storage = {
  async get(key) {
    try {
      // Use authFetch for authenticated reads (will work for public keys too)
      const response = await authFetch(`${API_BASE}/storage/${key}`);
      if (!response.ok) {
        throw new Error('Not found');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key, value) {
    try {
      const response = await authFetch(`${API_BASE}/storage/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      if (!response.ok) throw new Error('Failed to set');
      return await response.json();
    } catch (error) {
      console.error('Storage set error:', error);
      return null;
    }
  },

  async delete(key) {
    try {
      const response = await authFetch(`${API_BASE}/storage/${key}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      return await response.json();
    } catch (error) {
      console.error('Storage delete error:', error);
      return null;
    }
  },

  async list(prefix) {
    try {
      const url = prefix
        ? `${API_BASE}/storage?prefix=${prefix}`
        : `${API_BASE}/storage`;
      const response = await authFetch(url);
      if (!response.ok) throw new Error('Failed to list');
      return await response.json();
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [] };
    }
  }
};