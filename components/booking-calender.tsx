"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProviderMonthlyCalendar } from '@/types/api';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
    providerId: string;
    calendarData: ProviderMonthlyCalendar;
    selectedDate: string; // YYYY-MM-DD
    onDateSelect?: (dateString: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ providerId, calendarData, selectedDate, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number): number => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const unavailableDaysSet = new Set(calendarData.unAvailableDays.map(d => d.trim().slice(0, 3)));
    const currentMonthLeaveData = calendarData.monthlyLeaves.find(l => l.month.includes(monthNames[month]));
    const leavesSet = new Set(currentMonthLeaveData?.dates || []);

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayName = new Date(year, month, day).toLocaleDateString('en-US', { weekday: 'short' });
        const isUnavailableDay = unavailableDaysSet.has(dayName);
        const isLeave = leavesSet.has(day);
        
        const currentDateBeingRendered = new Date(year, month, day);
        const isPastDate = currentDateBeingRendered < today;

        const isDisabled = isUnavailableDay || isLeave || isPastDate;
        
        const isSelected = dateStr === selectedDate;
        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

        calendarDays.push(
            <div
                key={day}
                className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors",
                    {
                        "cursor-not-allowed bg-muted/50 text-muted-foreground/50 line-through": isDisabled,
                        "cursor-pointer hover:bg-accent hover:text-accent-foreground": !isDisabled,
                        "bg-primary text-primary-foreground hover:bg-primary/90": isSelected && !isDisabled,
                        "border border-primary/50": isToday && !isSelected && !isDisabled,
                    }
                )}
                onClick={() => !isDisabled && onDateSelect && onDateSelect(dateStr)}
            >
                {day}
            </div>
        );
    }

    const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <Card className="w-full border-0 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between px-1 py-2">
                <h3 className="text-lg font-semibold">{monthNames[month]} {year}</h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth} aria-label="Previous month">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth} aria-label="Next month">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-1">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
                    {dayNames.map(day => <div key={day} className="h-8 w-8 flex items-center justify-center">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays}
                </div>
            </CardContent>
        </Card>
    );
};

export default BookingCalendar;