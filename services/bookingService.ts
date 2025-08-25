// src/services/bookingService.ts
import apiClient from "./apiService";
import {
  BaseApiResponse,
  ProviderMonthlyCalendar,
  AvailabilitySlot,
  CreateBookingRequest,
  ClientBookingItem,
} from "@/types/api"; // Adjust path

export class BookingService {
  // Get monthly calendar (unavailable days/leaves) for a provider
  static async getMonthlyCalendar(
    providerId: string,
    monthsAhead: number = 3
  ): Promise<BaseApiResponse<ProviderMonthlyCalendar>> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<ProviderMonthlyCalendar>
      >(`/calendar/monthly/${providerId}/${monthsAhead}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching monthly calendar for provider ${providerId}:`,
        error
      );
      throw error;
    }
  }

  // Get specific day's available time slots for a provider
  static async getDailyAvailability(
    providerId: string,
    date: string
  ): Promise<
    BaseApiResponse<{
      id: string;
      day: string;
      available: boolean;
      slots: AvailabilitySlot[];
    }>
  > {
    // date format: YYYY-MM-DD
    try {
      const response = await apiClient.get<
        BaseApiResponse<{
          id: string;
          day: string;
          available: boolean;
          slots: AvailabilitySlot[];
        }>
      >(`/bookings/providers/${providerId}/availability/${date}`);
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching daily availability for provider ${providerId} on ${date}:`,
        error
      );
      throw error;
    }
  }

  // Create a new booking
  static async createBooking(
    bookingData: CreateBookingRequest
  ): Promise<BaseApiResponse<any>> {
    // Adjust payload type if needed
    try {
      // bookingData should match the structure defined in CreateBookingRequest
      console.log("full url", apiClient.getUri() + "/bookings/create");
      const response = await apiClient.post<BaseApiResponse<any>>(
        "/bookings/create",
        bookingData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  // Get client's bookings
  static async getClientBookings(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
    filters: Record<string, any> = {}
  ): Promise<BaseApiResponse<ClientBookingItem[]>> {
    try {
      // Ensure userId is passed as a query parameter
      const params = { userId, page, pageSize, ...filters };
      const response = await apiClient.get<
        BaseApiResponse<ClientBookingItem[]>
      >("/bookings/all", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  }

  // Get all bookings with pagination (new method for the updated flow)
  static async getAllBookings(
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<BaseApiResponse<any[]>> {
    try {
      // Ensure userId is passed as a query parameter
      const params = { userId, pageNumber, pageSize };
      const response = await apiClient.get<BaseApiResponse<any[]>>(
        "/bookings/all",
        { params }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching all bookings for user ${userId}:`, error);
      throw error;
    }
  }

  static async getBookingById(
    bookingId: string
  ): Promise<BaseApiResponse<any>> {
    try {
      console.log("full url", apiClient.getUri() + `/bookings/${bookingId}`);
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${bookingId}:`, error);
      throw error;
    }
  }

  static async cancelBooking(
    bookingId: string,
    reason: string
  ): Promise<BaseApiResponse<any>> {
    return await apiClient.post(`/bookings/${bookingId}/cancel`, {
      reason,
      notifyOtherParty: true,
      forceCancel: false,
    });
  }
}

export default BookingService;
