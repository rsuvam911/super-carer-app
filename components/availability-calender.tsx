"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProviderWeeklyAvailabilityDay } from '@/types/api'; // Adjust path

interface AvailabilityCalendarProps {
    availabilityData: ProviderWeeklyAvailabilityDay[];
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ availabilityData }) => {
    if (!Array.isArray(availabilityData)) {
        console.error('Invalid data format:', availabilityData);
        return null;
    }

    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const orderedAvailability = daysOrder.map(dayName => {
        const dayData = availabilityData.find(d => d.day.trim() === dayName);
        return dayData || { id: '', day: dayName, available: false, slots: [] };
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>General Weekly Availability</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {orderedAvailability.map((day) => (
                        <div key={day.day} className="border rounded-md p-3">
                            <h3 className={`font-semibold mb-2 ${day.available ? 'text-primary' : 'text-muted-foreground line-through'}`}>
                                {day.day}
                            </h3>
                            {day.available && day.slots && day.slots.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {day.slots.map((slot, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {slot.startTime} - {slot.endTime}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">Not available</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AvailabilityCalendar;