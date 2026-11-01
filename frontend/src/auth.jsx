import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken, clearCache } from './api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getToken());

  useEffect(() => {
    if (getToken()) {
      api('/me')
        .then((d) => setUser(d.user))
        .catch(() => setToken(null))
        .finally(() => setReady(true));
    }
    const onLogout = () => setUser(null);
    window.addEventListener('kamalak:logout', onLogout);
    return () => window.removeEventListener('kamalak:logout', onLogout);
  }, []);

  const finish = (d) => {
    clearCache();
    setToken(d.token);
    setUser(d.user);
    return d.user;
  };

  const value = {
    user,
    ready,
    setUser,
    login: (login, password) => api('/auth/login', { method: 'POST', body: { login, password } }).then(finish),
    register: (form) => api('/auth/register', { method: 'POST', body: form }).then(finish),
    logout: () => {
      setToken(null);
      clearCache();
      setUser(null);
    },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
export const homeFor = (user) => (user?.role === 'teacher' ? '/teacher' : '/student');
