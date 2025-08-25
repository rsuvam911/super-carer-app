"use client";

import { Booking } from "@/types/booking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  DollarSign,
  User,
} from "lucide-react";
import { format } from "date-fns";

interface BookingCardProps {
  booking: Booking;
  onViewDetails?: (bookingId: string) => void;
  onReschedule?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

export function BookingCard({
  booking,
  onViewDetails,
  onReschedule,
  onCancel,
}: BookingCardProps) {
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
      return format(new Date(dateString), "MMM dd, yyyy");
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

  const primarySlot = booking.bookingSlots[0];

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
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
            <div>
              <CardTitle className="text-lg">
                {booking.careProviders.name}
              </CardTitle>
              <p className="text-sm text-gray-600">{booking.serviceType}</p>
            </div>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{formatDate(primarySlot.date)}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>
                {formatTime(primarySlot.startTime)} -{" "}
                {formatTime(primarySlot.endTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                ${booking.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{booking.careProviders.phoneNumber}</span>
            </div>
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
              <span>{booking.careProviders.yearsOfExperience} years exp.</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {booking.description && (
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-700">{booking.description}</p>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p>{booking.clients.location.streetAddress}</p>
            <p className="text-gray-600">
              {booking.clients.location.city}, {booking.clients.location.state}{" "}
              {booking.clients.location.postalCode}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(booking.bookingId)}
            >
              View Details
            </Button>
          )}

          {booking.status.toLowerCase() === "confirmed" && onReschedule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReschedule(booking.bookingId)}
            >
              Reschedule
            </Button>
          )}

          {["pending", "confirmed"].includes(booking.status.toLowerCase()) &&
            onCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(booking.bookingId)}
              >
                Cancel
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
