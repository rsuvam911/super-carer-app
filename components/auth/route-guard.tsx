"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ReactNode } from "react";

type UserRole = "client" | "care-provider";

interface RouteGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Component to protect routes based on authentication and role requirements
 */
export function RouteGuard({
  children,
  requiredRole,
  allowedRoles,
  fallback,
  redirectTo,
}: RouteGuardProps) {
  const { isLoading, hasAccess } = useAuthGuard({
    requiredRole,
    allowedRoles,
    redirectTo,
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C2CB]"></div>
        </div>
      )
    );
  }

  // Show children only if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Return null if no access (redirect will be handled by the hook)
  return null;
}

/**
 * Component specifically for client-only routes
 */
export function ClientRouteGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RouteGuard requiredRole="client" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

/**
 * Component specifically for provider-only routes
 */
export function ProviderRouteGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RouteGuard requiredRole="care-provider" fallback={fallback}>
      {children}
    </RouteGuard>
  );
}

/**
 * Component for routes accessible by authenticated users (any role)
 */
export function AuthenticatedRouteGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <RouteGuard allowedRoles={["client", "care-provider"]} fallback={fallback}>
      {children}
    </RouteGuard>
  );
}
