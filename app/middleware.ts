import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value || "";
  const userRole = request.cookies.get("userRole")?.value || "";

  const isPublicPath =
    path === "/login" || path === "/register" || path === "/verify-otp";

  // If logged in, and on a public path, redirect to the correct dashboard
  if (isPublicPath && token) {
    if (userRole === "client") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/provider/dashboard", request.url));
    }
  }

  // If not logged in and on a protected path, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based route protection
  if (token) {
    if (userRole === "client" && path.startsWith("/provider")) {
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
    if (userRole === "care-provider" && path.startsWith("/client")) {
      return NextResponse.redirect(new URL("/provider/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/verify-otp",
    "/client/:path*",
    "/provider/:path*",
  ],
};