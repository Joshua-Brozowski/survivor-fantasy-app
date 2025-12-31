// Simple storage wrapper for MongoDB API
const API_BASE = '/api';

// Auth API wrapper for secure password handling
export const auth = {
  async login(playerId, password) {
    try {
      const response = await fetch(`${API_BASE}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', playerId, password })
      });
      const data = await response.json();
      return { success: response.ok && data.success, error: data.error };
    } catch (error) {
      console.error('Auth login error:', error);
      return { success: false, error: 'Network error' };
    }
  },

  async setPassword(playerId, newPassword) {
    try {
      const response = await fetch(`${API_BASE}/auth`, {
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
      const response = await fetch(`${API_BASE}/auth`, {
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
  }
};

export const storage = {
  async get(key) {
    try {
      const response = await fetch(`${API_BASE}/storage/${key}`);
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
      const response = await fetch(`${API_BASE}/storage/${key}`, {
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
      const response = await fetch(`${API_BASE}/storage/${key}`, {
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
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to list');
      return await response.json();
    } catch (error) {
      console.error('Storage list error:', error);
      return { keys: [] };
    }
  }
};