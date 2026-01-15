import { BaseApiResponse } from "@/types/api";
import apiClient from "./apiService";

export interface PlatformLanguage {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export class PlatformLanguageService {
  static async getPlatformLanguages(): Promise<
    BaseApiResponse<PlatformLanguage[]>
  > {
    try {
      const response = await apiClient.get<BaseApiResponse<PlatformLanguage[]>>(
        "/platformlanguages"
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching platform languages:", error);
      throw error;
    }
  }
}

export default PlatformLanguageService;
