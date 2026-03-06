// Frontend config: base URL for backend API (set in Vercel env as VITE_BACKEND_URL)
export const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_BACKEND_URL) || '';
