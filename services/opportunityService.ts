// services/opportunityService.ts
import apiClient from "./apiService";
import {
  OpportunitiesResponse,
  ClientOpportunity,
  ProviderOpportunity,
} from "@/types/opportunity";
import { BaseApiResponse } from "@/types/api";

export class OpportunityService {
  /**
   * Fetch opportunities for clients
   */
  static async getClientOpportunities(
    page: number = 1,
    pageSize: number = 10
  ): Promise<BaseApiResponse<ClientOpportunity[]>> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<ClientOpportunity[]>
      >(`/opportunities/list?page=${page}&pageSize=${pageSize}`, {
        headers: {
          UserType: "Client",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching client opportunities:", error);
      throw error;
    }
  }

  /**
   * Fetch opportunities for care providers
   */
  static async getProviderOpportunities(
    page: number = 1,
    pageSize: number = 10
  ): Promise<BaseApiResponse<ProviderOpportunity[]>> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<ProviderOpportunity[]>
      >(`/opportunities/list?page=${page}&pageSize=${pageSize}`, {
        headers: {
          UserType: "CareProvider",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching provider opportunities:", error);
      throw error;
    }
  }

  /**
   * Unified method to fetch opportunities based on user role
   */
  static async getOpportunities(
    userType: "Client" | "CareProvider",
    page: number = 1,
    pageSize: number = 10
  ): Promise<OpportunitiesResponse> {
    try {
      const response = await apiClient.get<OpportunitiesResponse>(
        `/opportunities/list?page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            UserType: userType,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${userType} opportunities:`, error);
      throw error;
    }
  }
}
