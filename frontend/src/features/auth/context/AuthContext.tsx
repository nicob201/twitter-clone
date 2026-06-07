import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../api/authApi.js';
import type { CurrentUser } from '../types/auth.types.js';

export interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({ ...data.user, bio: null, avatarUrl: null });
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const data = await registerUser(email, username, password);
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser({ ...data.user, bio: null, avatarUrl: null });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
