import { API_BASE } from './config.js';

export async function pingBackend() {
  if (!API_BASE) {
    return { ok: false, error: 'Backend URL not configured' };
  }
  const res = await fetch(`${API_BASE}/api/hello`);
  if (!res.ok) {
    return { ok: false, error: 'Network error' };
  }
  return res.json();
}
