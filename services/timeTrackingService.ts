import { BaseApiResponse } from "@/types/api";
import apiClient from "./apiService";

export default class TimeTrackingService {
  static async startTimer(
    bookingWindowId: string
  ): Promise<BaseApiResponse<any>> {
    return await apiClient.post("/trackingsessions/start");
  }

  static async stopTimer(sessionId: string): Promise<BaseApiResponse<any>> {
    return await apiClient.post(`/trackingsessions${sessionId}/stop`);
  }

  static async pauseTimer(sessionId: string): Promise<BaseApiResponse<any>> {
    return await apiClient.post(`/trackingsessions${sessionId}/pause`);
  }

  static async resumeTimer(sessionId: string): Promise<BaseApiResponse<any>> {
    return await apiClient.post(`/trackingsessions${sessionId}/resume`);
  }

  static async getTimer(providerId: string): Promise<BaseApiResponse<any>> {
    return await apiClient.get(
      `/trackingsessions/active/?providerId=${providerId}`
    );
  }
}
