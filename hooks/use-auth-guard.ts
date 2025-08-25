import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type UserRole = "client" | "care-provider";

interface UseAuthGuardOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
  allowedRoles?: UserRole[];
}

/**
 * Hook to guard components/pages based on authentication and role requirements
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, userRole, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const { requiredRole, redirectTo = "/login", allowedRoles = [] } = options;

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If specific role is required and user doesn't have it
    if (requiredRole && userRole !== requiredRole) {
      const dashboardPath =
        userRole === "client" ? "/client/dashboard" : "/provider/dashboard";
      router.push(dashboardPath);
      return;
    }

    // If allowed roles are specified and user role is not in the list
    if (
      allowedRoles.length > 0 &&
      userRole &&
      !allowedRoles.includes(userRole as UserRole)
    ) {
      const dashboardPath =
        userRole === "client" ? "/client/dashboard" : "/provider/dashboard";
      router.push(dashboardPath);
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    userRole,
    requiredRole,
    allowedRoles,
    router,
    redirectTo,
  ]);

  return {
    isLoading,
    isAuthenticated,
    user,
    userRole,
    hasAccess:
      isAuthenticated &&
      (!requiredRole || userRole === requiredRole) &&
      (allowedRoles.length === 0 ||
        (userRole && allowedRoles.includes(userRole as UserRole))),
  };
}

/**
 * Hook specifically for client-only pages
 */
export function useClientGuard() {
  return useAuthGuard({ requiredRole: "client" });
}

/**
 * Hook specifically for provider-only pages
 */
export function useProviderGuard() {
  return useAuthGuard({ requiredRole: "care-provider" });
}

/**
 * Hook for pages accessible by both roles
 */
export function useAuthenticatedGuard() {
  return useAuthGuard({ allowedRoles: ["client", "care-provider"] });
}
