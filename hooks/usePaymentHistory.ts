import { useQuery } from "@tanstack/react-query";
import { PaymentService, SearchType } from "../services/paymentService";

export const usePaymentHistory = (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
  searchType: SearchType = "all"
) => {
  return useQuery({
    queryKey: ["paymentHistory", pageNumber, pageSize, searchTerm, searchType],
    queryFn: () =>
      PaymentService.getPaymentHistory(
        pageNumber,
        pageSize,
        searchTerm,
        searchType
      ),
    staleTime: 5 * 60 * 1000,
  });
};
