"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";
import { BookingCard } from "@/components/booking-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      fetchBookings();
    }
  }, [isAuthenticated, user?.userId, currentPage, pageSize]);

  const fetchBookings = async () => {
    if (!user?.userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.getAllBookings(
        user.userId,
        currentPage,
        pageSize
      );

      if (response.success) {
        setBookings(response.payload || []);
        if (response.meta) {
          setTotalPages(response.meta.totalPages);
          setTotalCount(response.meta.totalCount);
          setHasNextPage(response.meta.hasNextPage);
          setHasPreviousPage(response.meta.hasPreviousPage);
        }
      } else {
        setError(response.message || "Failed to fetch bookings");
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = () => {
    router.push("/client/bookings/create");
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/client/bookings/${bookingId}`);
  };

  const handleReschedule = (bookingId: string) => {
    router.push(`/client/bookings/${bookingId}/reschedule`);
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await BookingService.cancelBooking(bookingId, "Client Cancelled");
      toast.success("Booking cancelled successfully");
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = () => {
    fetchBookings();
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.careProviders.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      booking.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-gray-600">
              Please log in to view your bookings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Manage your care provider appointments
          </p>
        </div>
        <Button
          onClick={handleCreateBooking}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Booking</span>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by provider name, service type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading bookings...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-6">
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
      {!loading && !error && filteredBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {bookings.length === 0
                ? "No bookings available"
                : "No bookings match your filters"}
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              {bookings.length === 0
                ? "You haven't made any bookings yet. Start by finding a care provider that meets your needs."
                : "Try adjusting your search terms or filters to find the bookings you're looking for."}
            </p>
            {bookings.length === 0 && (
              <Button
                onClick={handleCreateBooking}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Your First Booking</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      {!loading && !error && filteredBookings.length > 0 && (
        <>
          <div className="grid gap-6 mb-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
                onViewDetails={handleViewDetails}
                onReschedule={handleReschedule}
                onCancel={handleCancel}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                bookings
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
