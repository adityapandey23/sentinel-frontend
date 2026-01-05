'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, tokenStorage } from '@/lib/api';
import type { LoginRequest, RegisterRequest } from '@/lib/types';
import { getErrorMessage } from '@/lib/error';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const router = useRouter();

  // Extract user info from JWT token
  const parseJWT = useCallback((token: string): User | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch {
      return null;
    }
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (accessToken && refreshToken) {
      const user = parseJWT(accessToken);
      setState({
        accessToken,
        refreshToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [parseJWT]);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      tokenStorage.setAccessToken(response.access_token);
      tokenStorage.setRefreshToken(response.refresh_token);

      const user = parseJWT(response.access_token);
      setState({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authApi.register(data);
      tokenStorage.setAccessToken(response.access_token);
      tokenStorage.setRefreshToken(response.refresh_token);

      const user = parseJWT(response.access_token);
      setState({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      router.push('/dashboard');
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      throw new Error(message);
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  };

  const refreshAccessToken = async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      tokenStorage.setAccessToken(response.accessToken);
      const user = parseJWT(response.accessToken);
      setState((prev) => ({
        ...prev,
        accessToken: response.accessToken,
        user,
      }));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
