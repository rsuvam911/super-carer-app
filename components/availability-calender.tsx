"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProviderWeeklyAvailabilityDay } from "@/types/api"; // Adjust path

interface AvailabilityCalendarProps {
    availabilityData: ProviderWeeklyAvailabilityDay[];
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
    availabilityData,
}) => {
    if (!Array.isArray(availabilityData)) {
        console.error("Invalid data format:", availabilityData);
        return null;
    }

    const daysOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];
    const orderedAvailability = daysOrder.map((dayName) => {
        const dayData = availabilityData.find((d) => d.day.trim() === dayName);
        return (
            dayData || { id: "", day: dayName, available: false, slots: [] }
        );
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    General Weekly Availability
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {orderedAvailability.map((day) => (
                        <div
                            key={day.day}
                            className={`flex flex-col items-center p-4 rounded-lg border shadow-sm ${day.available
                                    ? "bg-background border-primary/40"
                                    : "bg-muted border-muted-foreground/20 opacity-70"
                                }`}
                        >
                            {/* Day Name */}
                            <h3
                                className={`font-semibold text-sm mb-3 uppercase tracking-wide ${day.available ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {day.day}
                            </h3>

                            {/* Slots */}
                            {day.available && day.slots && day.slots.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-2">
                                    {day.slots.map((slot, index) => (
                                        <Badge
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/30"
                                        >
                                            {slot.startTime} - {slot.endTime}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">Not Available</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AvailabilityCalendar;
