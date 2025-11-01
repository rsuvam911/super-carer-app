"use client";

import { useState, useMemo } from "react";
import {
  Star,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Award,
  MessageSquare,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import { useReviews, useReviewStats } from "@/hooks/useReviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RatingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: reviewsResponse, isLoading, isError, error } = useReviews();
  const { data: stats, isLoading: statsLoading } = useReviewStats();

  const reviews = reviewsResponse?.payload || [];

  // Filter reviews based on active tab and search term
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = reviews.filter((review) => {
        if (activeTab === "positive") return review.rating >= 4;
        if (activeTab === "neutral") return review.rating === 3;
        if (activeTab === "negative") return review.rating <= 2;
        return true;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.reviewBy.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [reviews, activeTab, searchTerm]);

  const toggleReview = (id: string) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center">
        {Array(5)
          .fill(0)
          .map((_, i) => {
            if (i < fullStars) {
              return (
                <Star
                  key={i}
                  className="h-4 w-4 text-yellow-400 fill-yellow-400"
                />
              );
            } else if (i === fullStars && hasHalfStar) {
              return (
                <div key={i} className="relative">
                  <Star className="h-4 w-4 text-gray-300" />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
              );
            } else {
              return <Star key={i} className="h-4 w-4 text-gray-300" />;
            }
          })}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProfileImageUrl = (profileImage: string) => {
    if (!profileImage) return "/placeholder.svg?height=48&width=48";
    if (profileImage.startsWith("http")) return profileImage;

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://careappapi.intellexio.com";
    return `${baseUrl}${profileImage}`;
  };

  if (isError) {
    toast.error("Failed to load reviews", {
      description:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Reviews Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-2 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Ratings & Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your performance and client feedback
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Rating */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">
                Average Rating
              </p>
              <p className="text-3xl font-bold">
                {stats?.averageRating.toFixed(1) || "0.0"}
              </p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 fill-current mr-1" />
                <span className="text-xs text-yellow-100">Out of 5.0</span>
              </div>
            </div>
            <div className="p-3 bg-teal-400 bg-opacity-30 rounded-lg">
              <Award className="h-8 w-8" />
            </div>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalReviews || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                {
                  reviews.filter((r) => {
                    const reviewDate = new Date(r.createdAt);
                    const now = new Date();
                    return (
                      reviewDate.getMonth() === now.getMonth() &&
                      reviewDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Positive Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">
                Positive Reviews
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {reviews.filter((r) => r.rating >= 4).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {reviews.length > 0
                  ? Math.round(
                      (reviews.filter((r) => r.rating >= 4).length /
                        reviews.length) *
                        100
                    )
                  : 0}
                % of total
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reviews by client name or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Rating Distribution
          </h3>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                stats?.ratingDistribution[
                  rating as keyof typeof stats.ratingDistribution
                ] || 0;
              const percentage = stats?.totalReviews
                ? (count / stats.totalReviews) * 100
                : 0;

              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center min-w-[60px]">
                    <span className="text-sm font-medium text-gray-700 mr-1">
                      {rating}
                    </span>
                    <Star className="h-4 w-4 text-teal-400 fill-teal-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-teal-500 h-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 min-w-[40px] text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All Reviews", count: reviews.length },
                  {
                    key: "positive",
                    label: "Positive",
                    count: reviews.filter((r) => r.rating >= 4).length,
                  },
                  {
                    key: "neutral",
                    label: "Neutral",
                    count: reviews.filter((r) => r.rating === 3).length,
                  },
                  {
                    key: "negative",
                    label: "Negative",
                    count: reviews.filter((r) => r.rating <= 2).length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? "bg-teal-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="divide-y divide-gray-100">
              {filteredReviews.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No matching reviews" : "No reviews yet"}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Reviews from clients will appear here"}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm("")}
                        className="mt-4"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden ring-2 ring-white shadow-sm">
                          <img
                            src={getProfileImageUrl(
                              review.reviewBy.profileImage
                            )}
                            alt={review.reviewBy.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=48&width=48";
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.reviewBy.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {review.category.name}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        <div className="mb-3">{renderStars(review.rating)}</div>

                        <p
                          className={`text-gray-700 leading-relaxed ${
                            expandedReview === review.id ? "" : "line-clamp-3"
                          }`}
                        >
                          {review.review}
                        </p>

                        {review.review.length > 150 && (
                          <button
                            onClick={() => toggleReview(review.id)}
                            className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center mt-2 font-medium"
                          >
                            {expandedReview === review.id ? (
                              <>
                                Show less <ChevronUp className="h-4 w-4 ml-1" />
                              </>
                            ) : (
                              <>
                                Read more{" "}
                                <ChevronDown className="h-4 w-4 ml-1" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
