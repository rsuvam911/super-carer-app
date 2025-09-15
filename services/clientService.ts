import { tokenManager } from "@/lib/token-manager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://careappapi.intellexio.com/api/v1";

export interface ClientProfileUpdateData {
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  Gender?: string;
  DateOfBirth?: string;
  UserType: "Client";
  PrimaryAddress?: {
    StreetAddress: string;
    City: string;
    State: string;
    PostalCode: string;
    Label: string;
    Latitude: string;
    Longitude: string;
  };
  ProfilePicture?: File;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  payload: T;
}

class ClientService {
  private async getAuthHeaders() {
    const token = await tokenManager.getValidAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  private async getAuthHeadersForFormData() {
    const token = await tokenManager.getValidAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    };
  }

  /**
   * Update client profile
   */
  async updateClientProfile(
    userId: string,
    profileData: ClientProfileUpdateData
  ): Promise<ApiResponse> {
    try {
      console.log("Updating client profile for userId:", userId);
      console.log("Profile data:", profileData);

      // Always use FormData like the provider service
      const formData = new FormData();

      // Add basic profile fields
      formData.append("FirstName", profileData.FirstName);
      formData.append("LastName", profileData.LastName);
      formData.append("Email", profileData.Email);
      formData.append("PhoneNumber", profileData.PhoneNumber);

      // Add optional fields
      if (profileData.Gender) {
        formData.append("Gender", profileData.Gender);
      }
      if (profileData.DateOfBirth) {
        // Validate and format date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(profileData.DateOfBirth)) {
          throw new Error("Date of birth must be in YYYY-MM-DD format");
        }
        formData.append("DateOfBirth", profileData.DateOfBirth);
      }

      // Add address fields if provided
      if (profileData.PrimaryAddress) {
        formData.append(
          "PrimaryAddress.StreetAddress",
          profileData.PrimaryAddress.StreetAddress
        );
        formData.append("PrimaryAddress.City", profileData.PrimaryAddress.City);
        formData.append(
          "PrimaryAddress.State",
          profileData.PrimaryAddress.State
        );
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
      }

      // Add profile picture if provided
      if (profileData.ProfilePicture) {
        formData.append("ProfilePicture", profileData.ProfilePicture);
      }

      // Get auth token and create headers for FormData
      const token = await tokenManager.getValidAccessToken();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Usertype: "Client", // This is the key difference from provider
        // Don't set Content-Type for FormData - let browser set it with boundary
      };

      console.log(
        "Making API call to:",
        `${API_BASE_URL}/account/users/${userId}/profile`
      );
      console.log("Headers:", headers);

      const response = await fetch(
        `${API_BASE_URL}/account/users/${userId}/profile`,
        {
          method: "PUT",
          headers,
          body: formData,
        }
      );

      let data = null;
      const contentType = response.headers.get("content-type");

      // Only try to parse JSON if the response has JSON content type
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.warn("Failed to parse JSON response:", jsonError);
          data = null;
        }
      } else {
        // For non-JSON responses, get text content for debugging
        const textContent = await response.text();
        console.warn("Non-JSON response received:", textContent);
      }

      if (!response.ok) {
        const errorMessage =
          data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: data?.message || "Profile updated successfully",
        payload: data?.payload || data,
      };
    } catch (error: any) {
      console.error("Error updating client profile:", error);
      return {
        success: false,
        message: error.message || "Failed to update profile",
        payload: null,
      };
    }
  }

  /**
   * Get client profile
   */
  async getClientProfile(userId: string): Promise<ApiResponse> {
    try {
      const baseHeaders = await this.getAuthHeaders();
      const headers = {
        ...baseHeaders,
        Usertype: "Client",
      };

      console.log("Fetching client profile for userId:", userId);
      console.log(
        "Making API call to:",
        `${API_BASE_URL}/account/users/${userId}/profile`
      );

      const response = await fetch(
        `${API_BASE_URL}/account/users/${userId}/profile`,
        {
          method: "GET",
          headers,
        }
      );

      let data = null;
      const contentType = response.headers.get("content-type");

      // Only try to parse JSON if the response has JSON content type
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.warn("Failed to parse JSON response:", jsonError);
          data = null;
        }
      } else {
        // For non-JSON responses, get text content for debugging
        const textContent = await response.text();
        console.warn("Non-JSON response received:", textContent);
      }

      if (!response.ok) {
        const errorMessage =
          data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return {
        success: true,
        message: data?.message || "Profile retrieved successfully",
        payload: data?.payload || data,
      };
    } catch (error: any) {
      console.error("Error fetching client profile:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch profile",
        payload: null,
      };
    }
  }
}

const clientService = new ClientService();
export default clientService;
