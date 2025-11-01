import { useQuery } from "@tanstack/react-query";
import { PaymentService } from "../services/paymentService";

export const usePaymentHistory = (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm?: string
) => {
  return useQuery({
    queryKey: ["paymentHistory", pageNumber, pageSize, searchTerm],
    queryFn: () =>
      PaymentService.getPaymentHistory(pageNumber, pageSize, searchTerm),
    staleTime: 5 * 60 * 1000,
  });
};
