import axios from "axios";
import { AUTH_CONFIG } from "./auth-config";
import { TokenDebugger } from "./token-debug";

// Define API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://careappapi.intellexio.com";

// Create axios instance for token refresh
const tokenApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<TokenData> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private lastRefreshTime: number = 0;
  private refreshAttempts: number = 0;
  private readonly MIN_REFRESH_INTERVAL = 30 * 1000; // 30 seconds minimum between refreshes
  private readonly MAX_REFRESH_ATTEMPTS = 3; // Maximum refresh attempts per hour
  private readonly REFRESH_ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour window

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get current access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get current refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store tokens in localStorage and cookies
   */
  setTokens(tokenData: TokenData): void {
    const { accessToken, refreshToken, expiresAt } = tokenData;

    // Store in localStorage
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

    // Store expiry time (current time + token expiry - refresh threshold)
    const expiryTime =
      expiresAt || Date.now() + AUTH_CONFIG.SESSION.TOKEN_EXPIRY;
    localStorage.setItem("tokenExpiresAt", expiryTime.toString());

    // Set cookies for middleware
    document.cookie = `${AUTH_CONFIG.COOKIES.TOKEN}=${accessToken}; path=/; secure; samesite=strict`;

    // Schedule automatic refresh
    this.scheduleTokenRefresh(expiryTime);
  }

  /**
   * Clear all tokens from storage
   */
  clearTokens(): void {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem("tokenExpiresAt");

    // Clear cookies
    document.cookie = `${AUTH_CONFIG.COOKIES.TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Reset refresh tracking
    this.refreshPromise = null;
    this.lastRefreshTime = 0;
    this.refreshAttempts = 0;
  }

  /**
   * Check if access token is expired or about to expire
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return true;

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Consider token expired if it expires within the refresh threshold
    return now >= expiryTime - AUTH_CONFIG.SESSION.REFRESH_THRESHOLD;
  }

  /**
   * Check if token needs refresh (more conservative check)
   */
  private needsRefresh(): boolean {
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (!expiresAt) return true;

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Check rate limiting
    if (this.isRateLimited()) {
      TokenDebugger.log("Token refresh rate limited");
      return false;
    }

    // Only refresh if within threshold AND enough time has passed since last refresh
    const withinThreshold =
      now >= expiryTime - AUTH_CONFIG.SESSION.REFRESH_THRESHOLD;
    const enoughTimePassed =
      now - this.lastRefreshTime >= this.MIN_REFRESH_INTERVAL;

    return withinThreshold && enoughTimePassed;
  }

  /**
   * Check if refresh attempts are rate limited
   */
  private isRateLimited(): boolean {
    const now = Date.now();

    // Reset attempts if window has passed
    if (now - this.lastRefreshTime > this.REFRESH_ATTEMPT_WINDOW) {
      this.refreshAttempts = 0;
    }

    return this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<TokenData> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Check if we really need to refresh
    if (!this.needsRefresh()) {
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      if (accessToken && refreshToken) {
        return {
          accessToken,
          refreshToken,
          expiresAt: parseInt(
            localStorage.getItem("tokenExpiresAt") || "0",
            10
          ),
        };
      }
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    TokenDebugger.log(
      `Performing token refresh (attempt ${this.refreshAttempts + 1}/${
        this.MAX_REFRESH_ATTEMPTS
      })`
    );
    this.refreshAttempts++;
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const tokenData = await this.refreshPromise;
      this.lastRefreshTime = Date.now();
      this.setTokens(tokenData);
      // Reset attempts on successful refresh
      this.refreshAttempts = 0;
      TokenDebugger.log("Token refresh successful");
      return tokenData;
    } catch (error) {
      TokenDebugger.log(`Token refresh failed: ${error}`);
      // Don't clear tokens immediately on failure, allow retry
      if (this.refreshAttempts >= this.MAX_REFRESH_ATTEMPTS) {
        TokenDebugger.log("Max refresh attempts reached, clearing tokens");
        this.clearTokens();
      }
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh API call
   */
  private async performTokenRefresh(refreshToken: string): Promise<TokenData> {
    try {
      const response = await tokenApi.post("/api/v1/auth/refresh-token", {
        refreshToken,
      });

      const { payload } = response.data;

      return {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: Date.now() + AUTH_CONFIG.SESSION.TOKEN_EXPIRY,
      };
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error("Refresh token expired or invalid");
      }
      throw new Error("Token refresh failed");
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const refreshTime = expiresAt - AUTH_CONFIG.SESSION.REFRESH_THRESHOLD;
    const delay = Math.max(0, refreshTime - now);

    // Don't schedule if delay is too small (less than 1 minute)
    if (delay < 60 * 1000) {
      console.log("Token expires too soon, not scheduling automatic refresh");
      return;
    }

    console.log(
      `Scheduling token refresh in ${Math.round(delay / 1000 / 60)} minutes`
    );

    this.refreshTimer = setTimeout(async () => {
      try {
        if (this.needsRefresh()) {
          await this.refreshAccessToken();
          console.log("Token refreshed automatically");
        } else {
          console.log("Token refresh not needed, skipping");
        }
      } catch (error) {
        console.error("Automatic token refresh failed:", error);
        // Trigger logout or redirect to login
        window.dispatchEvent(new CustomEvent("tokenRefreshFailed"));
      }
    }, delay);
  }

  /**
   * Initialize token manager with existing tokens
   */
  initialize(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresAt = localStorage.getItem("tokenExpiresAt");

    if (accessToken && refreshToken && expiresAt) {
      const expiryTime = parseInt(expiresAt, 10);
      const now = Date.now();

      console.log(`Token expires at: ${new Date(expiryTime).toLocaleString()}`);
      console.log(`Current time: ${new Date(now).toLocaleString()}`);
      console.log(
        `Time until expiry: ${Math.round(
          (expiryTime - now) / 1000 / 60
        )} minutes`
      );

      // Only refresh if token is actually expired (not just within threshold)
      if (now >= expiryTime) {
        console.log("Token is expired, refreshing immediately");
        this.refreshAccessToken().catch((error) => {
          console.error("Initial token refresh failed:", error);
          this.clearTokens();
        });
      } else {
        // Schedule refresh for later
        console.log("Token is valid, scheduling automatic refresh");
        this.scheduleTokenRefresh(expiryTime);
      }
    } else {
      console.log("No valid tokens found in storage");
    }
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();

    if (!accessToken) {
      return null;
    }

    // Only refresh if token is actually expired (not just within threshold)
    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (expiresAt) {
      const expiryTime = parseInt(expiresAt, 10);
      const now = Date.now();

      // Only refresh if token is actually expired
      if (now >= expiryTime) {
        try {
          const tokenData = await this.refreshAccessToken();
          return tokenData.accessToken;
        } catch (error) {
          console.error("Failed to refresh token:", error);
          return null;
        }
      }
    }

    return accessToken;
  }
}

// Export singleton instance
export const tokenManager = TokenManager.getInstance();
