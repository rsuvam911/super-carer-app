import apiClient from "./apiService";

const PAYMENT_ENDPOINT = "/payment"; // Replace with actual endpoint

interface ApiResponse {
  apiResponseId: string;
  success: boolean;
  statusCode: number;
  message: string;
  payload: Payload;
  timestamp: string;
}

interface Payload {
  payments: Payment[];
  walletBalance: WalletBalance;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface Payment {
  name: string;
  profilePicture: string;
  bookingId: string;
  careCategory: string;
  date: string;
  totalPrice: string;
  invoiceNo: string;
  startTime: string;
  endTime: string;
  invoiceId: string;
  fileUrl: string | null;
  fileName: string | null;
  currency: string;
}

interface WalletBalance {
  amount: number;
  currency: string;
}

export const PaymentService = {
  getPaymentHistory: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string
  ) => {
    try {
      const params: any = {
        pageNumber,
        pageSize,
      };

      if (searchTerm && searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }

      const response = await apiClient.get<ApiResponse>(
        `${PAYMENT_ENDPOINT}/history`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  },
};
