"use client"

import React from 'react';
import { ProviderProfileDetails, ProviderCategory, AvailabilitySlot } from '@/types/api';

interface BookingSummaryProps {
    provider: ProviderProfileDetails | null;
    category: ProviderCategory | null;
    date: string;
    slots: AvailabilitySlot[];
    totalMinutes: number;
    totalPrice: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
    provider,
    category,
    date,
    slots,
    totalMinutes,
    totalPrice
}) => {
    const hourlyRate = category?.hourlyRate ?? 0;

    return (
        <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{category ? `${category.name}` : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{date || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Time Slots</span>
                <span className="font-medium">{slots.length || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{totalMinutes ? `${totalMinutes} min` : '—'}</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">{hourlyRate ? `$${hourlyRate}/hr` : '—'}</span>
            </div>
            <hr className="my-2 border-dashed" />
            <div className="flex items-center justify-between text-xl font-bold text-primary">
                <span>Total</span>
                <span>{totalPrice ? `$${totalPrice.toFixed(2)}` : '—'}</span>
            </div>
        </div>
    );
};

export default BookingSummary;