// Small fetch wrapper for the Django REST API with automatic JWT refresh.

export function apiBase() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  // Use the same host the page was opened from, so it also works from a phone on your Wi-Fi.
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:8000/api`;
  return 'http://127.0.0.1:8000/api';
}

const ACCESS = 'ec_access';
const REFRESH = 'ec_refresh';

export const tokens = {
  get access() { return typeof window !== 'undefined' ? localStorage.getItem(ACCESS) : null; },
  get refresh() { return typeof window !== 'undefined' ? localStorage.getItem(REFRESH) : null; },
  set({ access, refresh }) {
    if (access) localStorage.setItem(ACCESS, access);
    if (refresh) localStorage.setItem(REFRESH, refresh);
  },
  clear() { localStorage.removeItem(ACCESS); localStorage.removeItem(REFRESH); },
};

export class ApiError extends Error {
  constructor(status, data) {
    super(flattenError(data) || `Request failed (${status})`);
    this.status = status;
    this.data = data;
  }
}

function flattenError(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const parts = [];
  for (const [k, v] of Object.entries(data)) {
    const msg = Array.isArray(v) ? v.join(' ') : String(v);
    parts.push(k === 'non_field_errors' ? msg : `${k.replace('_', ' ')}: ${msg}`);
  }
  return parts.join('\n');
}

async function refreshAccess() {
  const refresh = tokens.refresh;
  if (!refresh) return false;
  const res = await fetch(`${apiBase()}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  tokens.set(await res.json());
  return true;
}

export async function api(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  let res;
  try {
    res = await fetch(`${apiBase()}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the Django backend running on port 8000?');
  }

  if (res.status === 401 && auth && retry && (await refreshAccess())) {
    return api(path, { method, body, auth, retry: false });
  }
  if (res.status === 401 && auth) {
    tokens.clear();
    if (typeof window !== 'undefined' && !location.pathname.startsWith('/login')) location.href = '/login'; // eslint-disable-line @next/next/no-location-assign-relative-destination
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
