export const AUTH_CONFIG = {
  // Cookie names
  COOKIES: {
    TOKEN: "token",
    USER_ROLE: "userRole",
  },

  // Local storage keys
  STORAGE_KEYS: {
    USER: "user",
    ACCESS_TOKEN: "accessToken",
    REFRESH_TOKEN: "refreshToken",
    USER_ROLE: "userRole",
  },

  // User roles
  ROLES: {
    CLIENT: "client" as const,
    CARE_PROVIDER: "care-provider" as const,
  },

  // Route paths
  ROUTES: {
    LOGIN: "/login",
    REGISTER: "/register",
    VERIFY_OTP: "/verify-otp",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    CLIENT_DASHBOARD: "/client/dashboard",
    PROVIDER_DASHBOARD: "/provider/dashboard",
  },

  // Public routes that don't require authentication
  PUBLIC_ROUTES: [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ],

  // API endpoints
  API_ENDPOINTS: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    LOGOUT: "/api/v1/auth/logout",
    VERIFY_OTP: "/api/v1/auth/verify-otp",
    REFRESH_TOKEN: "/api/v1/auth/refresh-token",
  },

  // Session configuration
  SESSION: {
    // Token expiry time in milliseconds (24 hours)
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
    // Refresh token before expiry (5 minutes before)
    REFRESH_THRESHOLD: 5 * 60 * 1000,
  },
} as const;

export type UserRole =
  (typeof AUTH_CONFIG.ROLES)[keyof typeof AUTH_CONFIG.ROLES];

/**
 * Get dashboard path for a specific role
 */
export function getDashboardPathForRole(role: UserRole): string {
  return role === AUTH_CONFIG.ROLES.CLIENT
    ? AUTH_CONFIG.ROUTES.CLIENT_DASHBOARD
    : AUTH_CONFIG.ROUTES.PROVIDER_DASHBOARD;
}

/**
 * Check if a route is public
 */
export function isPublicRoute(path: string): boolean {
  return (
    (AUTH_CONFIG.PUBLIC_ROUTES as readonly string[]).includes(path) ||
    path.startsWith("/api/auth/")
  );
}

/**
 * Check if a role is valid
 */
export function isValidRole(role: string | null): role is UserRole {
  return (
    role === AUTH_CONFIG.ROLES.CLIENT ||
    role === AUTH_CONFIG.ROLES.CARE_PROVIDER
  );
}
