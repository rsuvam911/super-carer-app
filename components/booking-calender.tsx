"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProviderMonthlyCalendar } from '@/types/api'; // Adjust path

interface BookingCalendarProps {
    providerId: string;
    calendarData: ProviderMonthlyCalendar;
    onDateSelect?: (dateString: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ providerId, calendarData, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Helper to get days in month
    const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();

    // Helper to get first day of month (0 = Sunday, 1 = Monday, etc)
    const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // Get unavailable days (names) and leaves (dates) for the current month being displayed
    const unavailableDaysSet = new Set(calendarData.unAvailableDays.map(d => d.trim()));
    const currentMonthLeaveData = calendarData.monthlyLeaves.find(l => l.month.includes(monthNames[month]));
    const leavesSet = new Set(currentMonthLeaveData?.dates || []);

    // Create calendar grid
    const calendarDays = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayName = dayNames[new Date(year, month, day).getDay()];
        const isUnavailableDay = unavailableDaysSet.has(dayName);
        const isLeave = leavesSet.has(day);
        const isDisabled = isUnavailableDay || isLeave;

        calendarDays.push(
            <div
                key={day}
                className={`p-2 text-center border rounded cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors
          ${isDisabled ? 'bg-muted text-muted-foreground cursor-not-allowed line-through' : 'hover:bg-accent'}
          ${onDateSelect && !isDisabled ? 'cursor-pointer' : 'cursor-default'}
        `}
                onClick={() => !isDisabled && onDateSelect && onDateSelect(dateStr)}
            >
                {day}
            </div>
        );
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span>{monthNames[month]} {year}</span>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="p-2">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                    <p><span className="inline-block w-3 h-3 bg-muted mr-1"></span> Unavailable Day</p>
                    <p><span className="inline-block w-3 h-3 bg-muted line-through mr-1"></span> Leave</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookingCalendar;