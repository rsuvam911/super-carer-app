import { tokenManager } from "./token-manager";
import { AUTH_CONFIG } from "./auth-config";

export class TokenDebugger {
  private static logs: string[] = [];

  static log(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.logs.push(logMessage);
    console.log(logMessage);

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }

  static getLogs(): string[] {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
  }

  static getTokenStatus() {
    const accessToken = tokenManager.getAccessToken();
    const refreshToken = tokenManager.getRefreshToken();
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    const now = Date.now();

    if (!accessToken || !refreshToken || !expiresAt) {
      return {
        status: "No tokens",
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
        expiresAt: null,
        timeUntilExpiry: null,
        isExpired: true,
      };
    }

    const expiryTime = parseInt(expiresAt, 10);
    const timeUntilExpiry = expiryTime - now;
    const isExpired = now >= expiryTime;
    const withinRefreshThreshold =
      now >= expiryTime - AUTH_CONFIG.SESSION.REFRESH_THRESHOLD;

    return {
      status: isExpired
        ? "Expired"
        : withinRefreshThreshold
        ? "Needs Refresh"
        : "Valid",
      accessToken: true,
      refreshToken: true,
      expiresAt: new Date(expiryTime).toISOString(),
      timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60), // minutes
      isExpired,
      withinRefreshThreshold,
      refreshThresholdMinutes:
        AUTH_CONFIG.SESSION.REFRESH_THRESHOLD / 1000 / 60,
    };
  }

  static startMonitoring(intervalMs: number = 30000) {
    const monitor = () => {
      const status = this.getTokenStatus();
      this.log(
        `Token Status: ${status.status} | Time until expiry: ${status.timeUntilExpiry} minutes`
      );
    };

    // Initial log
    monitor();

    // Set up interval
    return setInterval(monitor, intervalMs);
  }
}

// Global debug functions for browser console
if (typeof window !== "undefined") {
  (window as any).tokenDebug = {
    getStatus: () => TokenDebugger.getTokenStatus(),
    getLogs: () => TokenDebugger.getLogs(),
    clearLogs: () => TokenDebugger.clearLogs(),
    startMonitoring: (interval?: number) =>
      TokenDebugger.startMonitoring(interval),
    forceRefresh: () => tokenManager.refreshAccessToken(),
  };
}
