# Sentinel Backend API Documentation

> **Purpose**: This document provides comprehensive API documentation for LLMs and developers building a frontend application to interact with the Sentinel backend.

## Overview

Sentinel is a session management and authentication system that allows users to:
- Register and login with email/password
- View all active sessions across devices
- Revoke specific sessions or all other sessions
- Get random competitive programming tips (demo protected endpoint)

### Tech Stack
- **Runtime**: Bun
- **Framework**: Express.js with InversifyJS (dependency injection)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (access + refresh tokens)
- **Port**: `8000`

---

## Base URL

```
http://localhost:8000
```

---

## Authentication Flow

### Token Types

| Token | Purpose | Lifetime | Storage Recommendation |
|-------|---------|----------|------------------------|
| `access_token` | Authorize API requests | Short-lived (~15 min) | Memory (React state) |
| `refresh_token` | Obtain new access tokens | 7 days | HttpOnly cookie or secure storage |

### Authorization Header

All protected endpoints require the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Refresh Flow

1. When `access_token` expires (401 response), call `/api/auth/token` with `refresh_token`
2. Store the new `access_token` and retry the failed request
3. If refresh fails, redirect to login

---

## API Endpoints

### 1. Authentication (`/api/auth`)

These endpoints are **public** (no authentication required).

---

#### `POST /api/auth/register`

Create a new user account and obtain tokens.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | User's display name |
| `email` | string | ✅ | Unique email address |
| `password` | string | ✅ | Password (hashed with Argon2) |

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 409 | Email already exists | `{ "status": "error", "message": "User with this email already exists" }` |
| 500 | Server error | `{ "status": "error", "message": "Something went wrong" }` |

---

#### `POST /api/auth/login`

Authenticate an existing user and obtain tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | ✅ | Registered email address |
| `password` | string | ✅ | Account password |

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 401 | Invalid credentials | `{ "status": "error", "message": "Invalid email or password" }` |

---

#### `POST /api/auth/token`

Refresh the access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | ✅ | Valid refresh token |

**Success Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 401 | Invalid/expired refresh token | `{ "status": "error", "message": "Invalid or expired token" }` |
| 404 | User not found | `{ "status": "error", "message": "User not found" }` |

---

### 2. Sessions (`/api/sessions`)

These endpoints are **protected** (require valid `access_token`).

---

#### `GET /api/sessions`

Retrieve all active sessions for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "sessions": [
    {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "isCurrent": true,
      "ip": "192.168.1.1",
      "countryCode": "US",
      "region": "CA",
      "cityCode": "San Francisco",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "timezone": "America/Los_Angeles",
      "offset": -28800,
      "browser": "Chrome",
      "os": "Windows 10",
      "isMobile": false,
      "platform": "Microsoft Windows"
    },
    {
      "sessionId": "660e8400-e29b-41d4-a716-446655440001",
      "isCurrent": false,
      "ip": "10.0.0.1",
      "countryCode": "CA",
      "region": "ON",
      "cityCode": "Toronto",
      "latitude": 43.6532,
      "longitude": -79.3832,
      "timezone": "America/Toronto",
      "offset": -18000,
      "browser": "Safari",
      "os": "iOS",
      "isMobile": true,
      "platform": "Apple iPhone"
    }
  ]
}
```

**Session Object Schema:**

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `sessionId` | string (UUID) | ❌ | Unique session identifier |
| `isCurrent` | boolean | ❌ | Whether this is the current session |
| `ip` | string | ✅ | IP address of the session |
| `countryCode` | string | ✅ | ISO country code (e.g., "US", "CA") |
| `region` | string | ✅ | Region/state code |
| `cityCode` | string | ✅ | City name |
| `latitude` | number | ✅ | Geographic latitude |
| `longitude` | number | ✅ | Geographic longitude |
| `timezone` | string | ✅ | IANA timezone (e.g., "America/New_York") |
| `offset` | number | ✅ | UTC offset in seconds |
| `browser` | string | ✅ | Browser name (e.g., "Chrome", "Firefox") |
| `os` | string | ✅ | Operating system |
| `isMobile` | boolean | ✅ | Whether device is mobile |
| `platform` | string | ✅ | Platform description |

> **Note**: Geo-info and user-agent fields may be `null` if lookup failed during session creation.

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 401 | Invalid/expired token | `{ "status": "error", "message": "Invalid or expired token" }` |

---

#### `DELETE /api/sessions/others`

Revoke all sessions except the current one (logout from all other devices).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Other sessions revoked successfully",
  "deletedCount": 3
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `deletedCount` | number | Number of sessions that were revoked |

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Session ID not in token | `{ "status": "error", "message": "Session ID not found in token" }` |
| 401 | Invalid/expired token | `{ "status": "error", "message": "Invalid or expired token" }` |

---

#### `DELETE /api/sessions/:id`

Revoke a specific session by its ID.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Session ID to revoke |

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Session revoked successfully"
}
```

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 400 | Trying to revoke current session | `{ "status": "error", "message": "Cannot revoke current session. Use logout instead." }` |
| 401 | Invalid/expired token | `{ "status": "error", "message": "Invalid or expired token" }` |
| 404 | Session not found | `{ "status": "error", "message": "Session not found" }` |

---

### 3. Facts (`/api/facts`)

A demo protected endpoint that returns competitive programming tips.

---

#### `GET /api/facts`

Get a random competitive programming tip.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "Tip": {
    "index": 5,
    "tip": "Assertions help catch silent logical bugs during practice and improve confidence in your code."
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `Tip.index` | number | Index of the tip (0-9) |
| `Tip.tip` | string | The competitive programming tip |

**Error Responses:**

| Status | Condition | Response |
|--------|-----------|----------|
| 401 | Invalid/expired token | `{ "status": "error", "message": "Invalid or expired token" }` |

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "stack": "Error stack trace (development only)"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, business rule violation |
| 401 | Unauthorized | Missing/invalid/expired token |
| 404 | Not Found | Resource doesn't exist, invalid route |
| 409 | Conflict | Duplicate resource (e.g., email exists) |
| 500 | Internal Server Error | Server-side error |

---

## JWT Token Structure

### Access Token Payload

```json
{
  "sub": "user-uuid-here",
  "email": "john@example.com",
  "sid": "session-uuid-here",
  "iat": 1704067200,
  "exp": 1704068100
}
```

| Claim | Description |
|-------|-------------|
| `sub` | User ID |
| `email` | User's email |
| `sid` | Session ID (used for session management) |
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp |

### Refresh Token Payload

Same structure as access token, but with longer expiration (7 days).

---

## Frontend Implementation Guide

### Recommended State Management

```typescript
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### API Client Setup (Axios Example)

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth header
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // from your auth state
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        const { data } = await axios.post('/api/auth/token', { refreshToken });
        setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### TypeScript Types

```typescript
// Auth Types
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

interface TokenRefreshRequest {
  refreshToken: string;
}

interface TokenRefreshResponse {
  accessToken: string;
}

// Session Types
interface Session {
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

interface GetSessionsResponse {
  sessions: Session[];
}

interface DeleteSessionsResponse {
  message: string;
  deletedCount?: number;
}

// Fact Types
interface FactResponse {
  Tip: {
    index: number;
    tip: string;
  };
}

// Error Types
interface ApiError {
  status: 'error';
  message: string;
  stack?: string;
}
```

### Suggested UI Pages

1. **Login Page** (`/login`)
   - Email and password inputs
   - Link to register page
   - Error handling for invalid credentials

2. **Register Page** (`/register`)
   - Name, email, and password inputs
   - Link to login page
   - Error handling for duplicate email

3. **Dashboard** (`/dashboard`)
   - Display random tip from `/api/facts`
   - Navigation to sessions page

4. **Sessions Page** (`/sessions`)
   - List all sessions with device/location info
   - Visual indicator for current session
   - "Revoke" button for each non-current session
   - "Revoke All Others" button
   - Confirmation dialog before revoking

### Session Display Suggestions

For each session, consider displaying:
- **Device Icon**: Based on `isMobile` and `platform`
- **Browser Icon**: Based on `browser` field
- **Location**: `cityCode, region, countryCode` (e.g., "San Francisco, CA, US")
- **Current Badge**: Green badge if `isCurrent` is true
- **Last Active**: (Note: backend tracks this via `updatedAt`, but not exposed in current API)

### Protected Route Example (React)

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : null;
}
```

---

## CORS Configuration

The backend has CORS enabled for all origins. In production, this should be configured to only allow your frontend domain.

---

## Session Activity Tracking

The backend automatically updates the `updatedAt` timestamp of sessions on API requests (with 5-minute caching to avoid excessive writes). This can be used for:
- Showing "last active" time on sessions
- Identifying stale sessions

---

## Database Schema Reference

### User Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE |
| password | text | NOT NULL (hashed) |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

### Session Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| token | text | NOT NULL, UNIQUE (refresh token) |
| expires_at | timestamp | NOT NULL |
| user_id | text | FK → user.id |
| geo_info_id | text | FK → geo_info.id |
| user_agent_id | text | FK → user_agent.id |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

### Geo Info Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| ip | inet | NOT NULL, UNIQUE |
| country_code | text | NULLABLE |
| region | text | NULLABLE |
| city | text | NULLABLE |
| latitude | real | NULLABLE |
| longitude | real | NULLABLE |
| timezone | text | NULLABLE |
| offset | integer | NULLABLE |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

### User Agent Table
| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| browser | text | NULLABLE |
| operating_system | text | NULLABLE |
| is_mobile | boolean | DEFAULT false |
| platform | text | NULLABLE |
| created_at | timestamp | NOT NULL |
| updated_at | timestamp | NOT NULL |

---

## Quick Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Create new user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/auth/token` | POST | ❌ | Refresh access token |
| `/api/sessions` | GET | ✅ | List all sessions |
| `/api/sessions/others` | DELETE | ✅ | Revoke all other sessions |
| `/api/sessions/:id` | DELETE | ✅ | Revoke specific session |
| `/api/facts` | GET | ✅ | Get random tip |

---

## Notes for LLMs

1. **Token Naming Inconsistency**: Note that register/login return `access_token` and `refresh_token` (snake_case), while the token refresh endpoint expects `refreshToken` (camelCase) and returns `accessToken` (camelCase). Handle both formats in the frontend.

2. **Session ID**: The session ID (`sid`) is embedded in the JWT and is used to identify the current session. This is important for the "Revoke All Others" functionality.

3. **Nullable Fields**: Many session fields can be `null` if geo-lookup or user-agent parsing failed. Always handle null cases in the UI.

4. **No Logout Endpoint**: There's no explicit logout endpoint. To logout:
   - Clear tokens from storage
   - Optionally call `DELETE /api/sessions/:currentSessionId` (but this is blocked - says use logout instead)
   - For true logout, the frontend just clears tokens locally

5. **Error Messages**: Error messages are user-friendly and can be displayed directly in the UI.
