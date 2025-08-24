// src/services/providerService.ts
import apiClient from "./apiService";
import {
  BaseApiResponse,
  ProviderListItem,
  ProviderProfileDetails,
  ProviderWeeklyAvailabilityDay,
} from "@/types/api";

export class ProviderService {
  // 1. Get list of care providers
  static async getProviders(
    page: number = 1,
    pageSize: number = 10,
    filters: Record<string, any> = {}
  ): Promise<BaseApiResponse<ProviderListItem[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<ProviderListItem[]>>(
        "/account/profiles",
        {
          params: { page, pageSize, ...filters },
          headers: {
            UserType: "CareProvider",
          },
        }
      );
      return response.data; // Assuming standard response structure { success, payload, meta, ... }
    } catch (error) {
      console.error("Error fetching providers:", error);
      throw error; // Re-throw for component-level handling
    }
  }

  // 2. Get specific provider's profile details
  static async getProviderProfile(
    userId: string
  ): Promise<BaseApiResponse<ProviderProfileDetails>> {
    try {
      // Note: UserType: CareProvider specified here too.
      const response = await apiClient.get<
        BaseApiResponse<ProviderProfileDetails>
      >(`/account/users/${userId}/profile`, {
        headers: {
          UserType: "CareProvider", // Check if needed
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      throw error;
    }
  }

  // Get provider's general weekly availability
  static async getProviderAvailability(
    providerId: string
  ): Promise<BaseApiResponse<ProviderWeeklyAvailabilityDay[]>> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<ProviderWeeklyAvailabilityDay[]>
      >(`/bookings/providers/${providerId}/availability`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching availability for provider ${providerId}:`,
        error
      );
      throw error;
    }
  }
}

// Export as default or named, depending on your preference
export default ProviderService;
