import { BaseApiResponse } from "@/types/api";
import apiClient from "./apiService";

interface StartTimerResponse {
  sessionId: string;
  bookingWindowId: string;
  startTime: string;
}

export default class TimeTrackingService {
  static async startTimer(
    bookingWindowId: string
  ): Promise<BaseApiResponse<StartTimerResponse>> {
    const response = await apiClient.post(
      `/trackingsessions/start?bookingWindowId=${bookingWindowId}`
    );
    return response.data;
  }

  static async stopTimer(sessionId: string): Promise<BaseApiResponse<any>> {
    const response = await apiClient.post(
      `/trackingsessions/${sessionId}/stop`
    );
    return response.data;
  }

  static async pauseTimer(sessionId: string): Promise<BaseApiResponse<any>> {
    const response = await apiClient.post(
      `/trackingsessions/${sessionId}/pause`
    );
    return response.data;
  }

  static async resumeTimer(sessionId: string): Promise<BaseApiResponse<any>> {
    const response = await apiClient.post(
      `/trackingsessions/${sessionId}/resume`
    );
    return response.data;
  }

  static async getTimer(providerId: string): Promise<BaseApiResponse<any>> {
    const response = await apiClient.get(
      `/trackingsessions/active/?providerId=${providerId}`
    );
    return response.data;
  }
}
