import { useEffect, useState } from "react";
import { tokenManager } from "@/lib/token-manager";
import { useAuth } from "@/lib/auth-context";

interface TokenStatus {
  isValid: boolean;
  expiresAt: number | null;
  timeUntilExpiry: number | null;
  isRefreshing: boolean;
}

/**
 * Hook to monitor token status and handle automatic refresh
 */
export function useTokenMonitor() {
  const { isAuthenticated, logout } = useAuth();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isValid: false,
    expiresAt: null,
    timeUntilExpiry: null,
    isRefreshing: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setTokenStatus({
        isValid: false,
        expiresAt: null,
        timeUntilExpiry: null,
        isRefreshing: false,
      });
      return;
    }

    const updateTokenStatus = () => {
      const accessToken = tokenManager.getAccessToken();
      const expiresAtStr = localStorage.getItem("tokenExpiresAt");
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      const now = Date.now();

      setTokenStatus({
        isValid: !!accessToken && !tokenManager.isTokenExpired(),
        expiresAt,
        timeUntilExpiry: expiresAt ? expiresAt - now : null,
        isRefreshing: false,
      });
    };

    // Initial status update
    updateTokenStatus();

    // Update status every minute
    const interval = setInterval(updateTokenStatus, 60000);

    // Listen for token refresh events
    const handleTokenRefreshFailed = () => {
      setTokenStatus((prev) => ({
        ...prev,
        isValid: false,
        isRefreshing: false,
      }));
      logout();
    };

    window.addEventListener("tokenRefreshFailed", handleTokenRefreshFailed);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "tokenRefreshFailed",
        handleTokenRefreshFailed
      );
    };
  }, [isAuthenticated, logout]);

  /**
   * Manually refresh token
   */
  const refreshToken = async () => {
    if (!isAuthenticated) return false;

    setTokenStatus((prev) => ({ ...prev, isRefreshing: true }));

    try {
      await tokenManager.refreshAccessToken();

      // Update status after successful refresh
      const expiresAtStr = localStorage.getItem("tokenExpiresAt");
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr, 10) : null;
      const now = Date.now();

      setTokenStatus({
        isValid: true,
        expiresAt,
        timeUntilExpiry: expiresAt ? expiresAt - now : null,
        isRefreshing: false,
      });

      return true;
    } catch (error) {
      console.error("Manual token refresh failed:", error);
      setTokenStatus((prev) => ({
        ...prev,
        isValid: false,
        isRefreshing: false,
      }));
      return false;
    }
  };

  return {
    tokenStatus,
    refreshToken,
  };
}

/**
 * Hook to get formatted time until token expiry
 */
export function useTokenExpiry() {
  const { tokenStatus } = useTokenMonitor();

  const formatTimeUntilExpiry = (milliseconds: number | null): string => {
    if (!milliseconds || milliseconds <= 0) return "Expired";

    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return {
    ...tokenStatus,
    formattedTimeUntilExpiry: formatTimeUntilExpiry(
      tokenStatus.timeUntilExpiry
    ),
  };
}
