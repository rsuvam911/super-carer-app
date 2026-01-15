import apiClient from "./apiService";
import { BaseApiResponse, SpecialtyCareCondition } from "@/types/api";

export class SpecialtyCareConditionService {
  // Get all specialty care conditions with pagination and filtering options
  static async getSpecialtyCareConditions(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = "",
    sortDescending: boolean = true,
    searchTerm: string = "",
    includeInactive: boolean = false
  ): Promise<BaseApiResponse<SpecialtyCareCondition[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<SpecialtyCareCondition[]>>(
        "/specialty-care-conditions",
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
      console.error("Error fetching specialty care conditions:", error);
      throw error;
    }
  }

  // Get a single specialty care condition by ID
  static async getSpecialtyCareConditionById(
    id: string
  ): Promise<BaseApiResponse<SpecialtyCareCondition>> {
    try {
      const response = await apiClient.get<BaseApiResponse<SpecialtyCareCondition>>(
        `/specialty-care-conditions/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching specialty care condition with ID ${id}:`, error);
      throw error;
    }
  }
}

export default SpecialtyCareConditionService;