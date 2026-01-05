'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, sessionsApi, tokenStorage, tokenEvents } from '@/lib/api';
import type { LoginRequest, RegisterRequest } from '@/types';
import { getErrorMessage } from '@/errors';

interface User {
  id: string;
  email: string;
  sessionId?: string;
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
  logout: () => Promise<void>;
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
  
  // Ref to track if a refresh is already in progress
  const isRefreshing = useRef(false);

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
        // Support common session ID field names in JWT
        sessionId: payload.sessionId || payload.sid || payload.session_id,
      };
    } catch {
      return null;
    }
  }, []);

  // Logout function - wrapped in useCallback for stable reference
  const logout = useCallback(async (sessionId?: string) => {
    // Try to revoke the current session on the server
    // This invalidates the session server-side so tokens can't be reused
    try {
      if (sessionId) {
        await sessionsApi.revokeSession(sessionId);
      }
    } catch (error) {
      // Log but don't block logout - we still want to clear local state
      console.warn('[Auth] Failed to revoke session on server:', error);
    }

    // Clear local state regardless of server response
    tokenStorage.clearTokens();
    setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/login');
  }, [router]);

  // Refresh access token - wrapped in useCallback for stable reference
  const refreshAccessToken = useCallback(async () => {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing.current) {
      console.log('[Auth] Refresh already in progress, skipping...');
      return;
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      console.log('[Auth] No refresh token available, logging out...');
      logout();
      return;
    }

    isRefreshing.current = true;
    console.log('[Auth] Attempting to refresh access token...');

    try {
      const response = await authApi.refreshToken(refreshToken);
      tokenStorage.setAccessToken(response.accessToken);
      const user = parseJWT(response.accessToken);
      setState((prev) => ({
        ...prev,
        accessToken: response.accessToken,
        user,
      }));
      console.log('[Auth] Access token refreshed successfully');
    } catch (error) {
      console.error('[Auth] Failed to refresh token:', error);
      logout();
    } finally {
      isRefreshing.current = false;
    }
  }, [parseJWT, logout]);

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

  // Subscribe to silent token refresh events from API interceptor
  // This keeps AuthContext state in sync when tokens are refreshed automatically
  useEffect(() => {
    const unsubscribe = tokenEvents.onRefresh((newToken) => {
      const user = parseJWT(newToken);
      setState((prev) => ({
        ...prev,
        accessToken: newToken,
        user,
      }));
    });

    return unsubscribe;
  }, [parseJWT]);

  // Proactive token refresh - refresh before the token expires
  // This prevents the user from experiencing failed requests
  useEffect(() => {
    if (!state.accessToken || !state.isAuthenticated) return;

    const checkAndRefreshToken = () => {
      try {
        const base64Url = state.accessToken!.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        const expiresAt = payload.exp * 1000; // Convert to milliseconds
        const timeUntilExpiry = expiresAt - Date.now();

        // Refresh 2 minutes before expiry to have a safety buffer
        const REFRESH_BUFFER = 2 * 60 * 1000; // 2 minutes in ms

        // Refresh if token is expired OR expiring soon
        if (timeUntilExpiry < REFRESH_BUFFER) {
          if (timeUntilExpiry <= 0) {
            console.log('[Auth] Token has expired, refreshing...');
          } else {
            console.log('[Auth] Token expiring soon, refreshing proactively...');
          }
          refreshAccessToken();
        }
      } catch (error) {
        console.error('[Auth] Error checking token expiry:', error);
      }
    };

    // Check immediately on mount
    checkAndRefreshToken();

    // Then check every 30 seconds
    const interval = setInterval(checkAndRefreshToken, 30 * 1000);

    return () => clearInterval(interval);
  }, [state.accessToken, state.isAuthenticated, refreshAccessToken]);

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

  // Wrapper for logout that gets sessionId from current state
  const handleLogout = useCallback(async () => {
    await logout(state.user?.sessionId);
  }, [logout, state.user?.sessionId]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout: handleLogout,
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
