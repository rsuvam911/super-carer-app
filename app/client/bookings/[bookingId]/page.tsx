"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { ChatUtils, useChatNavigation } from "@/lib/chat-utils";
import { UserRole } from "@/lib/middleware-utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  DollarSign,
  User,
  FileText,
  Download,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, userRole } = useAuth();
  const { navigateToChatWithUser } = useChatNavigation();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await BookingService.getBookingById(bookingId);

      if (response.success) {
        setBooking(response.payload);
      } else {
        setError(response.message || "Failed to fetch booking details");
      }
    } catch (err: any) {
      console.error("Error fetching booking details:", err);
      setError("Failed to load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/client/bookings");
  };

  const handleReschedule = () => {
    router.push(`/client/bookings/${bookingId}/reschedule`);
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await BookingService.cancelBooking(bookingId, "Cancelled");
      toast.success("Booking cancelled successfully");
      fetchBookingDetails(); // Refresh the details
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, "_blank");
  };

  const handleStartChat = async () => {
    if (!user || !userRole || !booking || isStartingChat) return;

    setIsStartingChat(true);
    try {
      // For clients, chat with the care provider
      const recipientUserId = booking.careProviders.Providerid;
      const recipientName = booking.careProviders.name;

      await navigateToChatWithUser(recipientUserId, recipientName, {
        userRole: userRole as UserRole,
        userId: user.userId,
        onError: (error) => console.error("Chat error:", error),
      });
    } finally {
      setIsStartingChat(false);
    }
  };

  // Check if user can start chat from booking context
  const canChatFromBooking = booking
    ? ChatUtils.canChatFromBooking(userRole as UserRole, booking.status)
    : false;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "EEEE, MMMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return timeString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading booking details...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                {error || "Booking not found"}
              </p>
              <div className="space-x-2">
                <Button onClick={handleBack} variant="outline">
                  Back to Bookings
                </Button>
                <Button onClick={fetchBookingDetails}>Try Again</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primarySlot =
    booking.bookingSlots && booking.bookingSlots.length > 0
      ? booking.bookingSlots[0]
      : null;

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-1">Booking ID: {booking.bookingId}</p>
        </div>
        <Badge className={getStatusColor(booking.status)}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Care Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle>Care Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={booking.careProviders.profilePictureUrl}
                    alt={booking.careProviders.name}
                  />
                  <AvatarFallback>
                    {booking.careProviders.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {booking.careProviders.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{booking.careProviders.phoneNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{booking.careProviders.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Star className="h-4 w-4 text-gray-500" />
                        <span>
                          {booking.careProviders.rating > 0
                            ? `${booking.careProviders.rating}/5`
                            : "No rating yet"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>
                          {booking.careProviders.yearsOfExperience} years
                          experience
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Button */}
                  {canChatFromBooking && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={handleStartChat}
                        disabled={isStartingChat}
                        variant="outline"
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isStartingChat
                          ? "Starting Chat..."
                          : ChatUtils.getChatButtonText(
                              userRole as UserRole,
                              "booking_detail"
                            )}
                      </Button>
                    </div>
                  )}

                  {/* Chat Button */}
                  {canChatFromBooking && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={handleStartChat}
                        disabled={isStartingChat}
                        variant="outline"
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isStartingChat
                          ? "Starting Chat..."
                          : ChatUtils.getChatButtonText(
                              userRole as UserRole,
                              "booking_detail"
                            )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Service Type</h4>
                <p className="text-gray-600">{booking.serviceType}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Duration</h4>
                <p className="text-gray-600">{booking.duration}</p>
              </div>

              {booking.description && (
                <div>
                  <h4 className="font-medium text-gray-900">Description</h4>
                  <p className="text-gray-600">{booking.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900">Total Amount</h4>
                <p className="text-2xl font-bold text-green-600">
                  $
                  {typeof booking.totalAmount === "number"
                    ? booking.totalAmount.toFixed(2)
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  {booking.clients.location ? (
                    <>
                      <p className="font-medium">
                        {booking.clients.location.streetAddress}
                      </p>
                      <p className="text-gray-600">
                        {booking.clients.location.city},{" "}
                        {booking.clients.location.state}{" "}
                        {booking.clients.location.postalCode}
                      </p>
                      <p className="text-gray-600">
                        {booking.clients.location.country}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No location information available
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.bookingSlots.map((slot, index) => (
                <div key={slot.bookingWindowId} className="space-y-2">
                  {index > 0 && <Separator />}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{formatDate(slot.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                  </div>
                  {slot.status && (
                    <Badge variant="outline" className="text-xs">
                      {slot.status}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invoice */}
          {primarySlot && primarySlot.invoiceFileUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {(primarySlot && primarySlot.invoiceFileName) || "Invoice"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() =>
                    primarySlot &&
                    handleDownloadInvoice(primarySlot.invoiceFileUrl!)
                  }
                  disabled={!primarySlot}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {booking.status.toLowerCase() === "confirmed" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleReschedule}
                >
                  Reschedule Booking
                </Button>
              )}

              {["pending", "confirmed"].includes(
                booking.status.toLowerCase()
              ) && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancel}
                >
                  Cancel Booking
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={fetchBookingDetails}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
