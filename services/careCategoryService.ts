// src/services/careCategoryService.ts
import apiClient from "./apiService";
import { BaseApiResponse, CareCategory } from "@/types/api";

export class CareCategoryService {
  // Get care categories with pagination and filtering options
  static async getCareCategories(
    includeInactive: boolean = false,
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
    providerId: string | null = null
  ): Promise<BaseApiResponse<CareCategory[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<CareCategory[]>>(
        "/carecategories",
        {
          params: {
            pageNumber: pageNumber,
            pageSize: pageSize,
            includeInactive: includeInactive,
            searchTerm: searchTerm,
            providerId: providerId, // This might be optional depending on your needs
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching care categories:", error);
      throw error;
    }
  }
}

export default CareCategoryService;
