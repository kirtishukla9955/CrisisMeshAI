// Thin fetch wrapper shared by incidentService/reportService/authorityService.
// Uses the Firebase Auth ID token as the bearer token, matching
// backend/middleware/authMiddleware.js. Assumes the main project already
// initializes Firebase in the frontend (see INTEGRATION_GUIDE.md) — this
// file imports `auth` from that existing setup rather than re-initializing.

import { getAuth } from 'firebase/auth';

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || '/api';

async function authHeader() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated authority user.');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };

  const res = await fetch(url.toString().replace(window.location.origin, ''), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.details = data.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
};
