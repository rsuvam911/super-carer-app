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
      console.log("[ProviderService] Raw API response:", response.data);
      console.log(
        "[ProviderService] PreferredCurrency from API:",
        response.data.payload?.preferredCurrency
      );
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
    userId: string,
    file: File,
    metadata: DocumentMetadata
  ): Promise<BaseApiResponse<Document>> {
    try {
      console.log("[ProviderService] Uploading document for user:", userId);
      console.log("[ProviderService] Document metadata:", metadata);

      const formData = new FormData();
      formData.append("File", file);
      formData.append("DocumentType", metadata.documentType);
      formData.append("Issuer", metadata.issuer);
      formData.append("Country", metadata.country);
      formData.append("CertificationType", metadata.certificationType);

      // Add optional fields
      if (metadata.certificationNumber) {
        formData.append("CertificationNumber", metadata.certificationNumber);
      }
      if (metadata.expiryDate) {
        // Convert expiry date to UTC ISO string format
        const expiryDateUTC = new Date(metadata.expiryDate).toISOString();
        formData.append("ExpiryDate", expiryDateUTC);
        console.log(
          "[ProviderService] Expiry date converted to UTC:",
          expiryDateUTC
        );
      }
      if (metadata.otherCertificationType) {
        formData.append(
          "OtherCertificationType",
          metadata.otherCertificationType
        );
      }

      console.log("[ProviderService] FormData prepared, sending request...");

      const response = await apiClient.post<BaseApiResponse<Document>>(
        `/account/users/${userId}/document`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            UserType: "CareProvider",
          },
        }
      );

      console.log("[ProviderService] Document upload response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `[ProviderService] Error uploading document for user ${userId}:`,
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

  // 9. Update provider profile
  static async updateProviderProfile(
    userId: string,
    profileData: {
      FirstName: string;
      LastName: string;
      Email: string;
      PhoneNumber: string;
      Gender: string;
      DateOfBirth: string;
      YearsExperience: number;
      Bio?: string;
      ProvidesOvernight?: boolean;
      ProvidesLiveIn?: boolean;
      PreferredCurrency?: string;
      PrimaryAddress: {
        StreetAddress: string;
        City: string;
        State: string;
        PostalCode: string;
        Label?: string;
        Latitude?: string;
        Longitude?: string;
      };
      ProfilePicture?: File;
      BufferDuration?: string;
    }
  ): Promise<BaseApiResponse<ProviderProfileDetails>> {
    try {
      const formData = new FormData();

      // Add basic profile fields
      formData.append("FirstName", profileData.FirstName);
      formData.append("LastName", profileData.LastName);
      formData.append("Email", profileData.Email);
      formData.append("PhoneNumber", profileData.PhoneNumber);
      formData.append("Gender", profileData.Gender);
      formData.append("DateOfBirth", profileData.DateOfBirth);
      formData.append(
        "YearsExperience",
        profileData.YearsExperience.toString()
      );

      // Add optional fields
      if (profileData.Bio) {
        formData.append("Bio", profileData.Bio);
      }
      if (profileData.ProvidesOvernight !== undefined) {
        formData.append(
          "ProvidesOvernight",
          profileData.ProvidesOvernight.toString()
        );
      }
      if (profileData.ProvidesLiveIn !== undefined) {
        formData.append(
          "ProvidesLiveIn",
          profileData.ProvidesLiveIn.toString()
        );
      }
      if (profileData.PreferredCurrency) {
        formData.append("PreferredCurrency", profileData.PreferredCurrency);
        console.log(
          "[ProviderService] Adding PreferredCurrency to FormData:",
          profileData.PreferredCurrency
        );
      }
      if (profileData.BufferDuration) {
        formData.append("BufferDuration", profileData.BufferDuration);
      }

      // Add address fields
      formData.append(
        "PrimaryAddress.StreetAddress",
        profileData.PrimaryAddress.StreetAddress
      );
      formData.append("PrimaryAddress.City", profileData.PrimaryAddress.City);
      formData.append("PrimaryAddress.State", profileData.PrimaryAddress.State);
      formData.append(
        "PrimaryAddress.PostalCode",
        profileData.PrimaryAddress.PostalCode
      );
      formData.append(
        "PrimaryAddress.Label",
        profileData.PrimaryAddress.Label || ""
      );
      formData.append(
        "PrimaryAddress.Latitude",
        profileData.PrimaryAddress.Latitude || ""
      );
      formData.append(
        "PrimaryAddress.Longitude",
        profileData.PrimaryAddress.Longitude || ""
      );

      // Add profile picture if provided
      if (profileData.ProfilePicture) {
        formData.append("ProfilePicture", profileData.ProfilePicture);
      }

      const response = await apiClient.put<
        BaseApiResponse<ProviderProfileDetails>
      >(`/account/users/${userId}/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Usertype: "CareProvider",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating profile for user ${userId}:`, error);
      throw error;
    }
  }

  // 9. Attach care category to provider
  static async attachCareCategory(
    providerId: string,
    categoryId: string,
    categoryData: {
      description: string;
      hourlyRate: number;
      experienceLevel: number;
    }
  ): Promise<BaseApiResponse<ProviderCategory>> {
    try {
      const response = await apiClient.put<BaseApiResponse<ProviderCategory>>(
        `/carecategories/provider/${providerId}/update/${categoryId}`,
        categoryData,
        {
          headers: {
            "Content-Type": "application/json",
            Usertype: "CareProvider",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error attaching category ${categoryId} to provider ${providerId}:`,
        error
      );
      throw error;
    }
  }
}

// Export as default or named, depending on your preference
export default ProviderService;
