"use client";

import { useTokenExpiry } from "@/hooks/use-token-monitor";
import { useAuth } from "@/lib/auth-context";
import { RefreshCw, Shield, ShieldAlert, Clock } from "lucide-react";

interface TokenStatusProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * Component to display current token status and allow manual refresh
 */
export function TokenStatus({
  showDetails = false,
  className = "",
}: TokenStatusProps) {
  const { isAuthenticated, refreshToken } = useAuth();
  const { isValid, formattedTimeUntilExpiry, isRefreshing } = useTokenExpiry();

  if (!isAuthenticated) {
    return null;
  }

  const handleRefresh = async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error("Manual token refresh failed:", error);
    }
  };

  const getStatusIcon = () => {
    if (isRefreshing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (isValid) {
      return <Shield className="h-4 w-4 text-green-500" />;
    }
    return <ShieldAlert className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isRefreshing) return "text-blue-600";
    if (isValid) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {getStatusIcon()}

      {showDetails && (
        <>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {isRefreshing ? "Refreshing..." : isValid ? "Active" : "Expired"}
          </span>

          {isValid && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{formattedTimeUntilExpiry}</span>
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Compact token status indicator for navigation bars
 */
export function TokenStatusIndicator({
  className = "",
}: {
  className?: string;
}) {
  return <TokenStatus showDetails={false} className={className} />;
}

/**
 * Detailed token status panel for settings or debug views
 */
export function TokenStatusPanel({ className = "" }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const {
    isValid,
    expiresAt,
    timeUntilExpiry,
    isRefreshing,
    formattedTimeUntilExpiry,
  } = useTokenExpiry();

  if (!isAuthenticated) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-3">Session Status</h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <TokenStatus showDetails={false} />
        </div>

        {expiresAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Expires:</span>
            <span className="text-sm font-mono">
              {new Date(expiresAt).toLocaleString()}
            </span>
          </div>
        )}

        {timeUntilExpiry && timeUntilExpiry > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Time remaining:</span>
            <span className="text-sm font-medium">
              {formattedTimeUntilExpiry}
            </span>
          </div>
        )}

        <div className="pt-2 border-t">
          <TokenStatus showDetails={true} />
        </div>
      </div>
    </div>
  );
}
