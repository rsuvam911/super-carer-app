"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookingService } from "@/services/bookingService";
import TimeTrackingService from "@/services/timeTrackingService";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ArrowLeft,
  Star,
  Play,
  Pause,
  Square,
  Download,
  Loader2,
} from "lucide-react";

// Define the booking details type based on the API response
interface BookingLocation {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  longitude: number | null;
  latitude: number | null;
}

interface BookingClient {
  userId: string;
  displayId: string;
  name: string;
  phoneNumber: string;
  email: string;
  profilePictureUrl: string | null;
  location: BookingLocation;
}

interface BookingCareProvider {
  Providerid: string;
  displayId: string;
  name: string;
  phoneNumber: string;
  email: string;
  yearsOfExperience: number;
  rating: number;
}

interface BookingSlot {
  bookingWindowId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  invoiceId: string | null;
  invoiceStatus: string | null;
}

interface BookingDetails {
  bookingId: string;
  displayId: string;
  duration: string;
  description: string;
  status: string;
  serviceType: string;
  totalAmount: number;
  clients: BookingClient;
  careProviders: BookingCareProvider;
  bookingSlots: BookingSlot[];
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time tracker state
  const [timeTracker, setTimeTracker] = useState<{
    [key: string]: {
      seconds: number;
      isRunning: boolean;
      sessionId: string | null;
    };
  }>({});
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});
  const { toast } = useToast();
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  const bookingId = params.bookingId as string;

  useEffect(() => {
    if (isAuthenticated && bookingId) {
      fetchBookingDetails();
    }
  }, [isAuthenticated, bookingId]);

  useEffect(() => {
    // Initialize time tracker state for upcoming slots only if booking is accepted
    if (booking && booking.status.toLowerCase() === "accepted") {
      const initialTrackerState: {
        [key: string]: {
          seconds: number;
          isRunning: boolean;
          sessionId: string | null;
        };
      } = {};
      booking.bookingSlots.forEach((slot) => {
        if (slot.status.toLowerCase() === "upcoming") {
          initialTrackerState[slot.bookingWindowId] = {
            seconds: 0,
            isRunning: false,
            sessionId: null,
          };
        }
      });
      setTimeTracker(initialTrackerState);
    }

    // Cleanup intervals on unmount
    return () => {
      Object.values(intervalRefs.current).forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, [booking]);

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

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Convert time to AM/PM format
    const [hours, minutes] = timeString.split(":");
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert 0 hour to 12 for 12 AM

    const formattedTime = `${hour}:${minutes} ${ampm}`;

    return `${formattedDate} at ${formattedTime}`;
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimer = async (slotId: string) => {
    if (!timeTracker[slotId]) return;

    try {
      // Call API to start tracking session
      const response = await TimeTrackingService.startTimer(slotId);

      if (response.success && response.payload) {
        const { sessionId } = response.payload;

        // Update state with sessionId and start local timer
        setTimeTracker((prev) => ({
          ...prev,
          [slotId]: { ...prev[slotId], isRunning: true, sessionId },
        }));

        // Start local interval timer
        if (!intervalRefs.current[slotId]) {
          intervalRefs.current[slotId] = setInterval(() => {
            setTimeTracker((prev) => ({
              ...prev,
              [slotId]: { ...prev[slotId], seconds: prev[slotId].seconds + 1 },
            }));
          }, 1000);
        }

        toast({
          title: "Timer Started",
          description: "Time tracking session has been started successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to start timer",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error starting timer:", error);
      toast({
        title: "Error",
        description: "Failed to start timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const pauseTimer = async (slotId: string) => {
    if (!timeTracker[slotId] || !timeTracker[slotId].sessionId) return;

    try {
      const sessionId = timeTracker[slotId].sessionId!;
      const response = await TimeTrackingService.pauseTimer(sessionId);

      if (response.success) {
        // Update state
        setTimeTracker((prev) => ({
          ...prev,
          [slotId]: { ...prev[slotId], isRunning: false },
        }));

        // Clear local interval
        if (intervalRefs.current[slotId]) {
          clearInterval(intervalRefs.current[slotId]!);
          intervalRefs.current[slotId] = null;
        }

        toast({
          title: "Timer Paused",
          description: "Time tracking session has been paused.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to pause timer",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error pausing timer:", error);
      toast({
        title: "Error",
        description: "Failed to pause timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resumeTimer = async (slotId: string) => {
    if (!timeTracker[slotId] || !timeTracker[slotId].sessionId) return;

    try {
      const sessionId = timeTracker[slotId].sessionId!;
      const response = await TimeTrackingService.resumeTimer(sessionId);

      if (response.success) {
        // Update state
        setTimeTracker((prev) => ({
          ...prev,
          [slotId]: { ...prev[slotId], isRunning: true },
        }));

        // Restart local interval
        if (!intervalRefs.current[slotId]) {
          intervalRefs.current[slotId] = setInterval(() => {
            setTimeTracker((prev) => ({
              ...prev,
              [slotId]: { ...prev[slotId], seconds: prev[slotId].seconds + 1 },
            }));
          }, 1000);
        }

        toast({
          title: "Timer Resumed",
          description: "Time tracking session has been resumed.",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to resume timer",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error resuming timer:", error);
      toast({
        title: "Error",
        description: "Failed to resume timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async (slotId: string) => {
    if (!timeTracker[slotId]) return;

    try {
      // Only call API if we have a sessionId (timer was started)
      if (timeTracker[slotId].sessionId) {
        const sessionId = timeTracker[slotId].sessionId!;
        const response = await TimeTrackingService.stopTimer(sessionId);

        if (response.success) {
          toast({
            title: "Timer Stopped",
            description: "Time tracking session has been stopped and saved.",
          });

          // Clear interval
          if (intervalRefs.current[slotId]) {
            clearInterval(intervalRefs.current[slotId]!);
            intervalRefs.current[slotId] = null;
          }

          // Reload the page after a short delay to show the toast
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast({
            title: "Warning",
            description:
              response.message ||
              "Timer stopped locally but may not have saved on server",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Error stopping timer:", error);
      toast({
        title: "Error",
        description: "Failed to stop timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadInvoice = async (invoiceId: string) => {
    setIsDownloadingInvoice(true);
    try {
      const blob = await BookingService.downloadInvoice(invoiceId);

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  const canDownloadInvoice = () => {
    const allowedStatuses = ["accepted", "completed", "cancelled"];
    return (
      booking &&
      allowedStatuses.includes(booking.status.toLowerCase()) &&
      booking.bookingSlots.some((slot) => slot.invoiceId)
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "default";
      case "requested":
        return "default";
      case "completed":
        return "default"; // Changed from 'success' to 'default'
      case "cancelled":
        return "destructive";
      case "upcoming":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-gray-600">
              Please log in to view booking details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading booking details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchBookingDetails} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-gray-600">Booking not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
        <Badge variant={getStatusBadgeVariant(booking.status)}>
          {booking.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Booking Details</span>
                <span className="text-sm font-normal text-gray-500">
                  {booking.displayId}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {booking.serviceType}
                  </h3>
                  <p className="text-gray-600">{booking.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${booking.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>

              {booking.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-gray-600">{booking.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Scheduled Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.bookingSlots.map((slot, index) => (
                  <div
                    key={slot.bookingWindowId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Session {index + 1}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(slot.date, slot.startTime)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(slot.status)}>
                        {slot.status}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    {/* Time Tracker - Only visible if status is 'upcoming' and booking is 'accepted' */}
                    {slot.status.toLowerCase() === "upcoming" &&
                      booking.status.toLowerCase() === "accepted" && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-mono font-bold">
                              {formatTime(
                                timeTracker[slot.bookingWindowId]?.seconds || 0
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {!timeTracker[slot.bookingWindowId]?.sessionId ? (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    startTimer(slot.bookingWindowId)
                                  }
                                  className="flex items-center bg-[#059fa1] hover:bg-[#048a8c] text-white"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              ) : !timeTracker[slot.bookingWindowId]
                                  ?.isRunning ? (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    resumeTimer(slot.bookingWindowId)
                                  }
                                  className="flex items-center bg-[#059fa1] hover:bg-[#048a8c] text-white"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Resume
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    pauseTimer(slot.bookingWindowId)
                                  }
                                  className="flex items-center bg-[#059fa1] hover:bg-[#048a8c] text-white"
                                >
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pause
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => stopTimer(slot.bookingWindowId)}
                                className="flex items-center"
                                disabled={
                                  !timeTracker[slot.bookingWindowId]?.sessionId
                                }
                              >
                                <Square className="h-4 w-4 mr-1" />
                                Stop
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    {/* Message for non-accepted bookings */}
                    {slot.status.toLowerCase() === "upcoming" &&
                      booking.status.toLowerCase() !== "accepted" && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-500 italic">
                            Time tracking will be available once the booking is
                            accepted.
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Download Invoice Button */}
          {canDownloadInvoice() && (
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  const invoiceId = booking.bookingSlots.find(
                    (slot) => slot.invoiceId
                  )?.invoiceId;
                  if (invoiceId) {
                    downloadInvoice(invoiceId);
                  }
                }}
                disabled={isDownloadingInvoice}
                className="flex items-center bg-[#059fa1] hover:bg-[#048a8c] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloadingInvoice ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Client and Provider Information */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                {booking.clients.profilePictureUrl ? (
                  <img
                    src={booking.clients.profilePictureUrl}
                    alt={booking.clients.name}
                    className="h-12 w-12 rounded-full mr-3"
                  />
                ) : (
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                )}
                <div>
                  <h3 className="font-medium">{booking.clients.name}</h3>
                  <p className="text-sm text-gray-500">
                    {booking.clients.displayId}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{booking.clients.phoneNumber}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{booking.clients.email}</span>
                </div>
                <div className="flex items-start text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                  <span>
                    {booking.clients.location.streetAddress},{" "}
                    {booking.clients.location.city},{" "}
                    {booking.clients.location.state}{" "}
                    {booking.clients.location.postalCode}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Provider Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 mr-3" />
                <div>
                  <h3 className="font-medium">{booking.careProviders.name}</h3>
                  <p className="text-sm text-gray-500">
                    {booking.careProviders.displayId}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{booking.careProviders.phoneNumber}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{booking.careProviders.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{booking.careProviders.rating} Rating</span>
                </div>
                <div className="flex items-center text-sm">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  <span>
                    {booking.careProviders.yearsOfExperience} Years Experience
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
