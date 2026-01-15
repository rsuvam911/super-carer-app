import apiClient from "./apiService";
import { BaseApiResponse, CareService } from "@/types/api";

export class CareServiceApi {
  // Get all care services with pagination and filtering options
  static async getCareServices(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = "",
    sortDescending: boolean = true,
    searchTerm: string = "",
    includeInactive: boolean = false
  ): Promise<BaseApiResponse<CareService[]>> {
    try {
      // Using exact parameter names from the API specification
      const response = await apiClient.get<BaseApiResponse<CareService[]>>(
        "/care-services",
        {
          params: {
            PageNumber: pageNumber,
            PageSize: pageSize,
            SortBy: sortBy,
            SortDescending: sortDescending,
            SearchTerm: searchTerm,
            IncludeInactive: includeInactive,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching care services:", error);
      throw error;
    }
  }

  // Get a single care service by ID
  static async getCareServiceById(
    id: string
  ): Promise<BaseApiResponse<CareService>> {
    try {
      const response = await apiClient.get<BaseApiResponse<CareService>>(
        `/care-services/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching care service with ID ${id}:`, error);
      throw error;
    }
  }
}

export default CareServiceApi;