import axios from "axios";
import { tokenManager } from "../lib/token-manager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://careappapi.intellexio.com/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    // UserType header might need adjustment based on backend requirements for client calls
    // 'UserType': 'Client' // Or omit if not needed for client requests
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getValidAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    // You can add global error handling logic here, e.g., redirect on 401
    return Promise.reject(error);
  }
);

export default apiClient;
