// src/services/careCategoryService.ts
import apiClient from "./apiService";
import { BaseApiResponse, CareCategory } from "@/types/api";

export class CareCategoryService {
  // Get all active care categories
  static async getCareCategories(
    includeInactive: boolean = false
  ): Promise<BaseApiResponse<CareCategory[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<CareCategory[]>>(
        "/carecategories",
        {
          params: { includeInactive },
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
