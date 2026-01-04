import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  GetSessionsResponse,
  DeleteSessionsResponse,
  FactResponse,
} from './types';

const BASE_URL = 'http://ec2-3-83-20-146.compute-1.amazonaws.com';

// Create axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage helpers
const TOKEN_STORAGE_KEY = 'sentinel_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'sentinel_refresh_token';

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },
  setAccessToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
  },
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  },
};

// Request interceptor - add auth header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post<TokenRefreshResponse>(
          `${BASE_URL}/api/auth/token`,
          { refreshToken } as TokenRefreshRequest
        );

        tokenStorage.setAccessToken(data.accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens
        tokenStorage.clearTokens();
        // Redirect to login will be handled by the auth context
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await axios.post<TokenRefreshResponse>(
      `${BASE_URL}/api/auth/token`,
      { refreshToken }
    );
    return response.data;
  },
};

export const sessionsApi = {
  getSessions: async (): Promise<GetSessionsResponse> => {
    const response = await api.get<GetSessionsResponse>('/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<DeleteSessionsResponse> => {
    const response = await api.delete<DeleteSessionsResponse>(`/sessions/${sessionId}`);
    return response.data;
  },

  revokeAllOthers: async (): Promise<DeleteSessionsResponse> => {
    const response = await api.delete<DeleteSessionsResponse>('/sessions/others');
    return response.data;
  },
};

export const factsApi = {
  getFact: async (): Promise<FactResponse> => {
    const response = await api.get<FactResponse>('/facts');
    return response.data;
  },
};

export default api;
