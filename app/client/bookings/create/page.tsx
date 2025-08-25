"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProviderService } from "@/services/providerService";
import { BaseApiResponse, ProviderListItem } from "@/types/api";
import ProviderCard from "@/components/provider-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Star,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

export default function CreateBookingPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<ProviderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const pageSize = 12;

  useEffect(() => {
    fetchProviders();
  }, [page]);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: BaseApiResponse<ProviderListItem[]> =
        await ProviderService.getProviders(page, pageSize);

      if (response.success) {
        // Append results for pagination instead of replacing
        if (page === 1) {
          setProviders(response.payload || []);
        } else {
          setProviders((prev) => [...prev, ...(response.payload || [])]);
        }
        setHasNextPage(response.meta?.hasNextPage ?? false);
      } else {
        setError(response.message || "Failed to fetch providers");
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      setError("Failed to load care providers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/client/bookings/provider/${userId}`);
  };

  const handleBookNow = (userId: string) => {
    router.push(`/client/bookings/book/${userId}`);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    setProviders([]);
    fetchProviders();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Filter and sort providers
  const filteredAndSortedProviders = providers.filter((provider) => {
    const matchesSearch =
      searchTerm === "" ||
      provider.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (provider.categories &&
        provider.categories.some((spec) =>
          spec.name.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesServiceType =
      serviceTypeFilter === "all" ||
      (provider.categories &&
        provider.categories.some((spec) =>
          spec.name.toLowerCase().includes(serviceTypeFilter.toLowerCase())
        ));

    return matchesSearch && matchesServiceType;
  });

  // Get unique service types for filter
  const serviceTypes = Array.from(
    new Set(providers.flatMap((provider) => provider.categories || []))
  );

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Find Care Providers
          </h1>
          <p className="text-gray-600 mt-1">
            Choose from our verified care providers to create your booking
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or specialization..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Service Type Filter */}
            <Select
              value={serviceTypeFilter}
              onValueChange={setServiceTypeFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!loading && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedProviders.length} of {providers.length}{" "}
            care providers
            {searchTerm && ` matching "${searchTerm}"`}
            {serviceTypeFilter !== "all" && ` in ${serviceTypeFilter}`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading care providers...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAndSortedProviders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No care providers found
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              {providers.length === 0
                ? "No care providers are currently available. Please try again later."
                : "Try adjusting your search terms or filters to find care providers."}
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Providers Grid */}
      {!loading && !error && filteredAndSortedProviders.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredAndSortedProviders.map((provider) => (
              <ProviderCard
                key={provider.userId}
                provider={provider}
                onViewProfile={handleViewProfile}
                onBookNow={handleBookNow}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="px-8 py-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load More Providers"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
