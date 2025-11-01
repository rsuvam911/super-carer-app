// src/services/providerClientService.ts
import apiClient from "./apiService";
import { BaseApiResponse, ProviderClient } from "@/types/api";

export class ProviderClientService {
  // Get list of clients for a provider
  static async getProviderClients(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters: Record<string, any> = {}
  ): Promise<BaseApiResponse<ProviderClient[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<ProviderClient[]>>(
        "/account/providers/clients-listing",
        {
          params: { pageNumber, pageSize, ...filters },
          headers: {
            UserType: "CareProvider",
          },
        }
      );

      console.log("Provider clients response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching provider clients:", error);
      throw error;
    }
  }

  // Get specific client details
  static async getClientDetails(
    clientId: string
  ): Promise<BaseApiResponse<ProviderClient>> {
    try {
      const response = await apiClient.get<BaseApiResponse<ProviderClient>>(
        `/account/providers/clients/${clientId}`,
        {
          headers: {
            UserType: "CareProvider",
          },
        }
      );

      console.log("Client details response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client details for ${clientId}:`, error);
      throw error;
    }
  }

  // Search clients by name, email, or location
  static async searchClients(
    searchTerm: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<BaseApiResponse<ProviderClient[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<ProviderClient[]>>(
        "/account/providers/clients-listing",
        {
          params: {
            pageNumber,
            pageSize,
            search: searchTerm,
          },
          headers: {
            UserType: "CareProvider",
          },
        }
      );

      console.log("Client search response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error searching clients:", error);
      throw error;
    }
  }
}

export default ProviderClientService;
