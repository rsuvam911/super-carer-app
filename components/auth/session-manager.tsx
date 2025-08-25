"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { tokenManager } from "@/lib/token-manager";
import { toast } from "sonner";

/**
 * Component to handle session management and token refresh
 * Should be included in the root layout or app component
 */
export function SessionManager() {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize token manager
    tokenManager.initialize();

    // Listen for token refresh failures
    const handleTokenRefreshFailed = () => {
      toast.error("Your session has expired. Please log in again.");
      logout();
    };

    // Listen for successful automatic token refresh
    const handleTokenRefreshed = () => {
      console.log("Token refreshed automatically");
    };

    window.addEventListener("tokenRefreshFailed", handleTokenRefreshFailed);
    window.addEventListener("tokenRefreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener(
        "tokenRefreshFailed",
        handleTokenRefreshFailed
      );
      window.removeEventListener("tokenRefreshed", handleTokenRefreshed);
    };
  }, [isAuthenticated, logout]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook to manually trigger token refresh
 */
export function useManualTokenRefresh() {
  const { refreshToken } = useAuth();

  const triggerRefresh = async () => {
    try {
      await refreshToken();
      toast.success("Session refreshed successfully");
      return true;
    } catch (error) {
      toast.error("Failed to refresh session");
      return false;
    }
  };

  return { triggerRefresh };
}
