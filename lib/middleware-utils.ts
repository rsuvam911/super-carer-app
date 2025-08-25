import { NextRequest } from "next/server";

export type UserRole = "client" | "care-provider";

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userRole: UserRole | null;
}

/**
 * Extract authentication state from request cookies
 */
export function getAuthState(request: NextRequest): AuthState {
  const token = request.cookies.get("token")?.value || null;
  const userRole = request.cookies.get("userRole")?.value as UserRole | null;

  return {
    isAuthenticated: !!(token && userRole),
    token,
    userRole,
  };
}

/**
 * Check if a path is a public route that doesn't require authentication
 */
export function isPublicRoute(path: string): boolean {
  const publicPaths = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ];

  return publicPaths.includes(path) || path.startsWith("/api/auth/");
}

/**
 * Check if a path is a static asset
 */
export function isStaticAsset(path: string): boolean {
  return (
    path.startsWith("/_next/") ||
    path.startsWith("/favicon") ||
    path.startsWith("/images/") ||
    path.startsWith("/icons/") ||
    path.includes(".") ||
    path.startsWith("/api/public/")
  );
}

/**
 * Get the appropriate dashboard path for a user role
 */
export function getDashboardPath(userRole: UserRole): string {
  return userRole === "client" ? "/client/dashboard" : "/provider/dashboard";
}

/**
 * Check if user has permission to access a specific route
 */
export function hasRoutePermission(path: string, userRole: UserRole): boolean {
  // Client routes
  if (path.startsWith("/client")) {
    return userRole === "client";
  }

  // Provider routes
  if (path.startsWith("/provider")) {
    return userRole === "care-provider";
  }

  // Public or shared routes
  return true;
}

/**
 * Validate if the user role is valid
 */
export function isValidUserRole(role: string | null): role is UserRole {
  return role === "client" || role === "care-provider";
}
