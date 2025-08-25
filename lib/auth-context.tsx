"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { tokenManager } from "./token-manager";
import { AUTH_CONFIG } from "./auth-config";
import { TokenDebugger } from "./token-debug";

// Define API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://careappapi.intellexio.com";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type User = {
  userId: string;
  email: string;
  phoneNumber: string | null;
  providerId: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Add request interceptor to include auth token with automatic refresh
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      async (config: any) => {
        const token = await tokenManager.getValidAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Add response interceptor to handle 401 errors with token refresh
    const responseInterceptor = api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            await tokenManager.refreshAccessToken();
            const newToken = tokenManager.getAccessToken();

            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            // If refresh fails, logout user
            await logout();
            router.push("/login");
            return Promise.reject(
              new Error("Your session has expired. Please log in again.")
            );
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptors when component unmounts
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [router]);

  useEffect(() => {
    // Check if user is logged in and initialize token manager
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        const accessToken = tokenManager.getAccessToken();
        const role = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE);

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          setUserRole(role);

          if (role) {
            // Set userRole cookie for middleware
            document.cookie = `${AUTH_CONFIG.COOKIES.USER_ROLE}=${role}; path=/; secure; samesite=strict`;
          }

          // Initialize token manager for automatic refresh
          tokenManager.initialize();
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        setUser(null);
        tokenManager.clearTokens();
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE);
        // Clear cookies
        document.cookie = `${AUTH_CONFIG.COOKIES.USER_ROLE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for token refresh failures
    const handleTokenRefreshFailed = () => {
      logout();
    };

    window.addEventListener("tokenRefreshFailed", handleTokenRefreshFailed);

    return () => {
      window.removeEventListener(
        "tokenRefreshFailed",
        handleTokenRefreshFailed
      );
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/v1/auth/login", {
        email,
        password,
      });
      const { payload } = response.data;
      const { user } = payload;

      // Determine user role
      const role =
        user.providerId && user.providerId.trim().length > 0
          ? "care-provider"
          : "client";

      setUser(user);
      setUserRole(role);

      // Store user data and role in local storage
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE, role);

      // Use token manager to handle tokens
      tokenManager.setTokens({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: Date.now() + AUTH_CONFIG.SESSION.TOKEN_EXPIRY,
      });

      // Set userRole cookie for middleware
      document.cookie = `${AUTH_CONFIG.COOKIES.USER_ROLE}=${role}; path=/; secure; samesite=strict`;

      // Redirect based on role
      if (role === "client") {
        router.push("/client/dashboard");
      } else {
        router.push("/provider/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid email or password";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/v1/auth/register", userData);
      const { payload } = response.data;

      // Use token manager to handle tokens
      tokenManager.setTokens({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        expiresAt: Date.now() + AUTH_CONFIG.SESSION.TOKEN_EXPIRY,
      });

      toast.success(
        "Registration successful! Please check your email for the OTP."
      );
      router.push(`/verify-otp?email=${userData.email}`);
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/v1/auth/verify-otp", {
        email,
        emailOtpCode: otp,
        verificationType: "Registration",
      });

      // Get user information after successful verification
      const userResponse = await api.get("/api/v1/auth/login");
      const userData = userResponse.data.payload;

      // Set user data and keep tokens
      setUser(userData);
      localStorage.setItem(
        AUTH_CONFIG.STORAGE_KEYS.USER,
        JSON.stringify(userData)
      );

      toast.success("OTP verification successful!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error.response?.data?.message || "OTP verification failed";
      toast.error(errorMessage);
      setError(errorMessage);

      // Only clear tokens if verification fails
      tokenManager.clearTokens();

      // Don't redirect on failure - stay on the verification page
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    setIsLoading(true);
    try {
      await tokenManager.refreshAccessToken();
      toast.success("Session refreshed successfully");
    } catch (error) {
      console.error("Token refresh error:", error);
      toast.error("Session expired. Please log in again.");
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const token = tokenManager.getAccessToken();
    try {
      if (token) {
        await api.post("/api/v1/auth/logout", { token });
      }
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      setUser(null);
      setUserRole(null);

      // Clear all tokens and storage
      tokenManager.clearTokens();
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER);
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.USER_ROLE);

      // Clear userRole cookie
      document.cookie = `${AUTH_CONFIG.COOKIES.USER_ROLE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      setIsLoading(false);
      router.push(AUTH_CONFIG.ROUTES.LOGIN);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        login,
        logout,
        register,
        verifyOtp,
        refreshToken,
        isAuthenticated: !!user,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
