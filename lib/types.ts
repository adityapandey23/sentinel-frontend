// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
}

// Session Types
export interface Session {
  sessionId: string;
  isCurrent: boolean;
  ip: string | null;
  countryCode: string | null;
  region: string | null;
  cityCode: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  offset: number | null;
  browser: string | null;
  os: string | null;
  isMobile: boolean | null;
  platform: string | null;
}

export interface GetSessionsResponse {
  sessions: Session[];
}

export interface DeleteSessionsResponse {
  message: string;
  deletedCount?: number;
}

// Fact Types
export interface FactResponse {
  Tip: {
    index: number;
    tip: string;
  };
}

// Error Types
export interface ApiError {
  status: 'error';
  message: string;
  stack?: string;
}
