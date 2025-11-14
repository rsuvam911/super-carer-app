// services/stripeConnectService.ts
import apiClient from "./apiService";
import { BaseApiResponse } from "@/types/api";

export interface StripeConnectLink {
  url: string;
  expiresAt: string;
  type: string;
  accountId: string;
  refreshUrl: string | null;
  returnUrl: string | null;
  isSuccessful: boolean;
  error: string | null;
}

export class StripeConnectService {
  /**
   * Get Stripe Connect account onboarding link
   * @returns Promise with Stripe Connect link details
   */
  static async getLinkRefresh(): Promise<BaseApiResponse<StripeConnectLink>> {
    try {
      console.log("[StripeConnectService] Fetching Stripe Connect link...");
      const response = await apiClient.get<BaseApiResponse<StripeConnectLink>>(
        "/connect/link-refresh"
      );
      console.log(
        "[StripeConnectService] Link refresh response:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        "[StripeConnectService] Error fetching Stripe Connect link:",
        error
      );
      throw error;
    }
  }
}

export default StripeConnectService;
