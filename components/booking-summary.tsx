"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProviderProfileDetails, ProviderCategory, AvailabilitySlot } from '@/types/api'; // Adjust path

interface BookingSummaryProps {
    provider: ProviderProfileDetails;
    category: ProviderCategory | null; // Allow null if not yet selected
    date: string; // YYYY-MM-DD
    slots: AvailabilitySlot[];
    specialInstructions: string;
    onInstructionsChange: (instructions: string) => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
    provider,
    category,
    date,
    slots,
    specialInstructions,
    onInstructionsChange
}) => {
    const totalHours = slots.reduce((total, slot) => {
        if (!slot.startTime || !slot.endTime) return total;
        const [startHour, startMinute] = slot.startTime.split(':').map(Number);
        const [endHour, endMinute] = slot.endTime.split(':').map(Number);
        const start = startHour + startMinute / 60;
        const end = endHour + endMinute / 60;
        return total + (end - start);
    }, 0);

    const totalAmount = totalHours * (category?.hourlyRate || 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold">Provider</h3>
                    <p>{provider.firstName} {provider.lastName}</p>
                </div>
                <div>
                    <h3 className="font-semibold">Service</h3>
                    <p>{category?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">${category?.hourlyRate || 0}/hr</p>
                </div>
                <div>
                    <h3 className="font-semibold">Date & Time</h3>
                    <p>{date}</p>
                    <ul className="list-disc pl-5 text-sm">
                        {slots.map((slot, idx) => (
                            <li key={idx}>{slot.startTime} - {slot.endTime}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold">Duration</h3>
                    <p>{totalHours.toFixed(2)} hours</p>
                </div>
                <div>
                    <h3 className="font-semibold">Total Amount</h3>
                    <p className="text-lg font-bold">${totalAmount.toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="special-instructions">Special Instructions</Label>
                    <Textarea
                        id="special-instructions"
                        placeholder="Any specific requests or details for the provider..."
                        value={specialInstructions}
                        onChange={(e) => onInstructionsChange(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default BookingSummary;