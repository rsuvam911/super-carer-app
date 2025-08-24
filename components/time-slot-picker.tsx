"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AvailabilitySlot } from '@/types/api'; // Adjust path

interface TimeSlotPickerProps {
    date: string; // YYYY-MM-DD format
    slots: AvailabilitySlot[];
    onSlotSelect: (selectedSlots: AvailabilitySlot[]) => void;
    selectedSlots?: AvailabilitySlot[]; // Optional initial selected slots
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ date, slots, onSlotSelect, selectedSlots = [] }) => {

    const handleSlotClick = (slot: AvailabilitySlot) => {
        const isSelected = selectedSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
        if (isSelected) {
            onSlotSelect(selectedSlots.filter(s => !(s.startTime === slot.startTime && s.endTime === slot.endTime)));
        } else {
            // For simplicity, allow selecting one slot. Modify logic for multiple selections if needed.
            // onSlotSelect([...selectedSlots, slot]);
            onSlotSelect([slot]); // Select only one slot at a time
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Available Slots for {date}</CardTitle>
            </CardHeader>
            <CardContent>
                {slots && slots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {slots.map((slot, index) => {
                            const isSelected = selectedSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                            return (
                                <Badge
                                    key={index}
                                    variant={isSelected ? "default" : "outline"} // Use default (primary) for selected
                                    className={`cursor-pointer py-2 px-3 text-base ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                                    onClick={() => handleSlotClick(slot)}
                                >
                                    {slot.startTime} - {slot.endTime}
                                </Badge>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No slots available for this date.</p>
                )}
                <Separator className="my-4" />
                <div>
                    <h4 className="font-semibold mb-2">Selected Slot:</h4>
                    {selectedSlots.length > 0 ? (
                        <ul className="list-disc pl-5">
                            {selectedSlots.map((slot, idx) => (
                                <li key={idx}>{slot.startTime} - {slot.endTime}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">Please select a time slot.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeSlotPicker;