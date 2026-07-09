import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../lib/api';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('portfolio_token');
    if (stored) setToken(stored);
  }, []);

  const login = async (password: string) => {
    setError(null);
    try {
      const response = await authApi.login({ password });
      localStorage.setItem('portfolio_token', response.access_token);
      setToken(response.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('portfolio_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        error,
      }}
    >
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
