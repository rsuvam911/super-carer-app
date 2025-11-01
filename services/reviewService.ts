import apiClient from "./apiService";

const REVIEWS_ENDPOINT = "/reviews";

interface ApiResponse<T> {
  apiResponseId: string;
  success: boolean;
  statusCode: number;
  message: string;
  payload: T;
  timestamp: string;
}

export interface Review {
  id: string;
  rating: number;
  review: string;
  category: {
    id: string;
    name: string;
  };
  reviewBy: {
    name: string;
    profileImage: string;
  };
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const ReviewService = {
  getMyReviews: async (): Promise<ApiResponse<Review[]>> => {
    try {
      const response = await apiClient.get<ApiResponse<Review[]>>(
        `${REVIEWS_ENDPOINT}/my`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  getReviewStats: async (): Promise<ReviewStats> => {
    try {
      const response = await apiClient.get<ApiResponse<Review[]>>(
        `${REVIEWS_ENDPOINT}/my`
      );

      const reviews = response.data.payload;
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
      }

      // Calculate average rating
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / totalReviews;

      // Calculate rating distribution
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((review) => {
        const roundedRating = Math.round(
          review.rating
        ) as keyof typeof ratingDistribution;
        if (roundedRating >= 1 && roundedRating <= 5) {
          ratingDistribution[roundedRating]++;
        }
      });

      return {
        averageRating,
        totalReviews,
        ratingDistribution,
      };
    } catch (error) {
      console.error("Error calculating review stats:", error);
      throw error;
    }
  },
};
