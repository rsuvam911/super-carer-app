import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAuthState,
  isPublicRoute,
  isStaticAsset,
  getDashboardPath,
  hasRoutePermission,
  isValidUserRole,
} from "./lib/middleware-utils";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authState = getAuthState(request);

  // Allow static assets without authentication
  if (isStaticAsset(path)) {
    return NextResponse.next();
  }

  // If user is authenticated and trying to access public auth pages, redirect to dashboard
  if (isPublicRoute(path) && authState.isAuthenticated && authState.userRole) {
    const dashboardPath = getDashboardPath(authState.userRole);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isPublicRoute(path) && !authState.isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Store the attempted URL to redirect back after login
    if (path !== "/") {
      loginUrl.searchParams.set("redirect", path);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Handle authenticated users
  if (authState.isAuthenticated && authState.userRole) {
    // Redirect root path to appropriate dashboard
    if (path === "/") {
      const dashboardPath = getDashboardPath(authState.userRole);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Check if user has permission to access the route
    if (!hasRoutePermission(path, authState.userRole)) {
      const dashboardPath = getDashboardPath(authState.userRole);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }

    // Ensure users are accessing routes with correct role prefix
    if (
      !path.startsWith("/client") &&
      !path.startsWith("/provider") &&
      !isPublicRoute(path)
    ) {
      const dashboardPath = getDashboardPath(authState.userRole);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    }
  }

  // If user has token but invalid role, clear cookies and redirect to login
  if (authState.token && !isValidUserRole(authState.userRole)) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    response.cookies.delete("userRole");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
