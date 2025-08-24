"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AvailabilitySlot } from '@/types/api'; // Adjust path
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

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
            const newSelection = [...selectedSlots, slot];
            newSelection.sort((a, b) => a.startTime.localeCompare(b.startTime));
            onSlotSelect(newSelection);
        }
    };

    const groupedSlots = {
        Morning: slots.filter(s => parseInt(s.startTime.split(':')[0]) < 12),
        Afternoon: slots.filter(s => parseInt(s.startTime.split(':')[0]) >= 12 && parseInt(s.startTime.split(':')[0]) < 17),
        Evening: slots.filter(s => parseInt(s.startTime.split(':')[0]) >= 17),
    };

    return (
        <div className="w-full">
            {slots && slots.length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(groupedSlots).map(([groupName, groupSlots]) => (
                        groupSlots.length > 0 && (
                            <div key={groupName}>
                                <h3 className="text-lg font-semibold mb-3">{groupName}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {groupSlots.map((slot, index) => {
                                        const isSelected = selectedSlots.some(s => s.startTime === slot.startTime && s.endTime === slot.endTime);
                                        return (
                                            <Button
                                                key={index}
                                                variant={isSelected ? "default" : "outline"}
                                                className={cn(
                                                    "h-12 text-base justify-center",
                                                    isSelected && "bg-primary text-primary-foreground"
                                                )}
                                                onClick={() => handleSlotClick(slot)}
                                            >
                                                {slot.startTime}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No available slots for this date.</p>
                </div>
            )}

            {selectedSlots.length > 0 && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <h4 className="font-semibold">Selected Slots:</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {selectedSlots.map((slot, idx) => (
                            <Badge key={idx} variant="default" className="text-sm">
                                {slot.startTime} - {slot.endTime}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeSlotPicker;