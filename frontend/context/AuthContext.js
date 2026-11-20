'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, tokens } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with browser-only state / fetch on mount
    if (!tokens.access) { setLoading(false); return; }
    api('/auth/me/')
      .then(setUser)
      .catch(() => tokens.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api('/auth/login/', { method: 'POST', body: { username, password }, auth: false });
    tokens.set(data);
    setUser(data.user);
    router.push('/dashboard');
  }, [router]);

  const register = useCallback(async (form) => {
    const data = await api('/auth/register/', { method: 'POST', body: form, auth: false });
    tokens.set(data);
    setUser(data.user);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    tokens.clear();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
