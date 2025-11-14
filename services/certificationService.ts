// services/certificationService.ts
import apiClient from "./apiService";
import { BaseApiResponse } from "@/types/api";

export interface Country {
  id: string;
  name: string;
}

export interface Certification {
  id: string;
  name: string;
  country: string;
}

export class CertificationService {
  /**
   * Get list of all available countries for certifications
   * @returns Promise with list of countries
   */
  static async getCountries(): Promise<BaseApiResponse<Country[]>> {
    try {
      console.log("[CertificationService] Fetching countries...");
      const response = await apiClient.get<BaseApiResponse<Country[]>>(
        "/certifications/countries"
      );
      console.log("[CertificationService] Countries response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[CertificationService] Error fetching countries:", error);
      throw error;
    }
  }

  /**
   * Get certifications for a specific country
   * @param countryName - Name of the country (e.g., "United Kingdom")
   * @returns Promise with list of certifications for that country
   */
  static async getCertificationsByCountry(
    countryName: string
  ): Promise<BaseApiResponse<Certification[]>> {
    try {
      console.log(
        "[CertificationService] Fetching certifications for country:",
        countryName
      );
      const response = await apiClient.get<BaseApiResponse<Certification[]>>(
        `/certifications/by-country/${encodeURIComponent(countryName)}`
      );
      console.log(
        "[CertificationService] Certifications response:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `[CertificationService] Error fetching certifications for ${countryName}:`,
        error
      );
      throw error;
    }
  }
}

export default CertificationService;
