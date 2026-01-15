// services/opportunityService.ts
import apiClient from "./apiService";
import {
  OpportunitiesResponse,
  ClientOpportunity,
  ProviderOpportunity,
} from "@/types/opportunity";
import { BaseApiResponse } from "@/types/api";

export interface CreateOpportunityRequest {
  title: string;
  description: string;
  recipientName: string;
  location: {
    streetAddress: string;
    city: string | null;
    state: string;
    zipCode: string | null;
    country: string;
    latitude: number | null;
    longitude: number | null;
  };
  helpStartTimeframe: string;
  weeklyHoursRange: string;
  careDuration: string;
  categoryId: string;
  careServiceIds: string[];
  specialtyConditionIds: string[];
  medicalNotes: string;
  preferredGender: string;
  preferredLanguageIds: string[];
  startDate: string;
  scheduleDays: Array<{
    day: string;
    scheduleTimes: string[];
  }>;
}

export interface CreateOpportunityResponse {
  apiResponseId: string;
  success: boolean;
  statusCode: number;
  message: string;
  payload: {
    id: string;
    title: string;
    description: string;
    recipientName: string;
    location: {
      streetAddress: string;
      city: string | null;
      state: string;
      zipCode: string | null;
      country: string;
      latitude: number | null;
      longitude: number | null;
    };
    helpStartTimeframe: string;
    weeklyHoursRange: string;
    careDuration: string;
    categoryId: string;
    careServiceIds: string[];
    specialtyConditionIds: string[];
    medicalNotes: string;
    preferredGender: string;
    preferredLanguageIds: string[];
    startDate: string;
    scheduleDays: Array<{
      day: string;
      scheduleTimes: string[];
    }>;
    createdAt: string;
    updatedAt: string;
  };
  timestamp: string;
}

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

  /**
   * Create a new opportunity
   */
  static async createOpportunity(
    opportunityData: CreateOpportunityRequest
  ): Promise<CreateOpportunityResponse> {
    try {
      const response = await apiClient.post<CreateOpportunityResponse>(
        "/opportunities/create",
        opportunityData,
        {
          headers: {
            "Content-Type": "application/json; x-api-version=1.0",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating opportunity:", error);
      throw error;
    }
  }
}
