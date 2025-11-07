import { api } from './api.js';

export function saveAuth(data) {
  try {
    if (!data || !data.token || !data.user) {
      console.error('[AUTH] Invalid auth data:', data);
      throw new Error('Invalid authentication data');
    }
    localStorage.setItem('qa_token', data.token);
    localStorage.setItem('qa_user', JSON.stringify(data.user));
    console.log('[AUTH] User saved:', data.user.email, data.user.role);
  } catch (error) {
    console.error('[AUTH] Error saving auth:', error);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('qa_token');
  localStorage.removeItem('qa_user');
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('qa_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthTokenFromStorage() {
  const token = localStorage.getItem('qa_token');
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}



