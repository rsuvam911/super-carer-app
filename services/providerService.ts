// src/services/providerService.ts
import apiClient from "./apiService";
import {
  BaseApiResponse,
  ProviderListItem,
  ProviderProfileDetails,
  ProviderWeeklyAvailabilityDay,
  ProviderCategory,
  Document,
  DocumentMetadata,
} from "@/types/api";

export class ProviderService {
  // 1. Get list of care providers
  static async getProviders(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters: Record<string, any> = {}
  ): Promise<BaseApiResponse<ProviderListItem[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<ProviderListItem[]>>(
        "/account/profiles",
        {
          params: { pageNumber, pageSize, ...filters },
          headers: {
            UserType: "CareProvider",
          },
        }
      );
      // Format and log response
      console.log("Provider list response:", response.data);
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

  // 4. Update provider categories
  static async updateProviderCategories(
    providerId: string,
    categories: ProviderCategory[]
  ): Promise<BaseApiResponse<ProviderCategory[]>> {
    try {
      const response = await apiClient.put<BaseApiResponse<ProviderCategory[]>>(
        `/providers/${providerId}/categories`,
        { categories },
        {
          headers: {
            UserType: "CareProvider",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating categories for provider ${providerId}:`,
        error
      );
      throw error;
    }
  }

  // 5. Upload document
  static async uploadDocument(
    providerId: string,
    file: File,
    metadata: DocumentMetadata
  ): Promise<BaseApiResponse<Document>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify(metadata));

      const response = await apiClient.post<BaseApiResponse<Document>>(
        `/providers/${providerId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            UserType: "CareProvider",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error uploading document for provider ${providerId}:`,
        error
      );
      throw error;
    }
  }

  // 6. Delete document
  static async deleteDocument(
    documentId: string
  ): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<void>>(
        `/providers/documents/${documentId}`,
        {
          headers: {
            UserType: "CareProvider",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  // 7. Update document metadata
  static async updateDocument(
    documentId: string,
    metadata: DocumentMetadata
  ): Promise<BaseApiResponse<Document>> {
    try {
      const response = await apiClient.put<BaseApiResponse<Document>>(
        `/providers/documents/${documentId}`,
        metadata,
        {
          headers: {
            UserType: "CareProvider",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating document ${documentId}:`, error);
      throw error;
    }
  }
}

// Export as default or named, depending on your preference
export default ProviderService;
