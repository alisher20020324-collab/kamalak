import { useCallback, useEffect, useState } from 'react';

const TOKEN_KEY = 'kamalak_token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(t) {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

// Javoblar keshi: sahifaga qaytganda ma'lumot darhol ko'rinadi, fonda yangilanadi
const cache = new Map();
export const clearCache = () => cache.clear();

export async function api(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const res = await fetch('/api' + path, {
    method,
    headers: { ...(body && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    setToken(null);
    clearCache();
    window.dispatchEvent(new Event('kamalak:logout'));
  }
  if (!res.ok) throw new Error(data.error || 'Xatolik yuz berdi');
  if (method !== 'GET') cache.clear(); // o'zgarishdan keyin eski ma'lumot ko'rinmasin
  return data;
}

export function useApi(path) {
  const [data, setData] = useState(() => cache.get(path));
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    return api(path)
      .then((d) => { cache.set(path, d); setData(d); setError(null); })
      .catch((e) => setError(e.message));
  }, [path]);

  useEffect(() => {
    setData(cache.get(path));
    reload();
  }, [path, reload]);

  return { data, error, reload, setData, loading: data === undefined && !error };
}
