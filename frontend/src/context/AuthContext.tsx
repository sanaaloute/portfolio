import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/api';

interface AuthContextValue {
  isAuthenticated: boolean;
  checking: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    authApi
      .me()
      .then(() => {
        if (alive) setIsAuthenticated(true);
      })
      .catch(() => {
        if (alive) setIsAuthenticated(false);
      })
      .finally(() => {
        if (alive) setChecking(false);
      });

    const onChanged = () => setIsAuthenticated(false);
    window.addEventListener('auth:changed', onChanged);
    return () => {
      alive = false;
      window.removeEventListener('auth:changed', onChanged);
    };
  }, []);

  const login = async (password: string) => {
    setError(null);
    try {
      await authApi.login({ password });
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — clear client state regardless
    }
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, checking, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
