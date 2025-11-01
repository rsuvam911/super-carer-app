import { useQuery } from "@tanstack/react-query";
import { ReviewService } from "@/services/reviewService";

export const useReviews = () => {
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () => ReviewService.getMyReviews(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReviewStats = () => {
  return useQuery({
    queryKey: ["reviewStats"],
    queryFn: () => ReviewService.getReviewStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
