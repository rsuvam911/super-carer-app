// app/client/book/[providerId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProviderService } from '@/services/providerService';
import { BookingService } from '@/services/bookingService';
import { ProviderProfileDetails, ProviderCategory, ProviderMonthlyCalendar, AvailabilitySlot, CreateBookingRequest } from '@/types/api';
import BookingCalendar from '@/components/booking-calender'
import TimeSlotPicker from '@/components/time-slot-picker'
import BookingSummary from '@/components/booking-summary'
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookingPageProps {
    params: { providerId: string };
}

export default function CreateBookingPage({ params }: BookingPageProps) {
    const router = useRouter();
    const { providerId } = params;

    // --- State Management ---
    const [profile, setProfile] = useState<ProviderProfileDetails | null>(null);
    const [calendarData, setCalendarData] = useState<ProviderMonthlyCalendar | null>(null);
    const [dailySlots, setDailySlots] = useState<{ id: string; day: string; available: boolean; slots: AvailabilitySlot[] } | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<ProviderCategory | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([]);
    const [specialInstructions, setSpecialInstructions] = useState<string>('');

    const [currentStep, setCurrentStep] = useState<number>(1); // 1: Category, 2: Date, 3: Time, 4: Summary/Confirm
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
    const [bookingResponse, setBookingResponse] = useState<any>(null); // Adjust type if needed

    // --- Data Fetching ---
    useEffect(() => {
        const fetchProfile = async () => {
            if (!providerId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await ProviderService.getProviderProfile(providerId); // Note: This uses userId, but providerId is in path. Check API.
                // Assuming the API allows fetching profile by providerId as userId or there's a mapping.
                // Or fetch by userId if you have it. For now, assuming providerId works or is userId.
                // If not, you might need to fetch providers list first or get userId another way.
                // Let's assume for now providerId in path corresponds to userId for profile fetch.
                if (!response.success) throw new Error(response.message || 'Failed to fetch provider profile');
                setProfile(response.payload);
            } catch (err: any) {
                console.error('Failed to fetch provider profile:', err);
                setError(err.message || 'Failed to load provider information.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [providerId]);

    useEffect(() => {
        const fetchCalendar = async () => {
            if (!providerId || currentStep < 2) return;
            setLoading(true);
            setError(null);
            try {
                const response = await BookingService.getMonthlyCalendar(providerId);
                if (!response.success) throw new Error(response.message || 'Failed to fetch calendar');
                setCalendarData(response.payload);
            } catch (err: any) {
                console.error('Failed to fetch calendar:', err);
                setError(err.message || 'Failed to load calendar data.');
            } finally {
                setLoading(false);
            }
        };
        fetchCalendar();
    }, [providerId, currentStep]); // Fetch when providerId is known and step advances to 2

    useEffect(() => {
        const fetchDailySlots = async () => {
            if (!providerId || !selectedDate || currentStep < 3) return;
            setLoading(true);
            setError(null);
            try {
                const response = await BookingService.getDailyAvailability(providerId, selectedDate);
                if (!response.success) throw new Error(response.message || 'Failed to fetch daily slots');
                setDailySlots(response.payload);
                setSelectedSlots([]); // Reset selected slots when date changes
            } catch (err: any) {
                console.error('Failed to fetch daily slots:', err);
                setError(err.message || 'Failed to load available time slots for this date.');
            } finally {
                setLoading(false);
            }
        };
        fetchDailySlots();
    }, [providerId, selectedDate, currentStep]); // Fetch when date is selected and step advances to 3

    // --- Handlers ---
    const handleCategorySelect = (categoryId: string) => {
        const category = profile?.categories.find(c => c.id === categoryId) || null;
        setSelectedCategory(category);
        // Reset subsequent steps when category changes
        setSelectedDate('');
        setSelectedSlots([]);
        setDailySlots(null);
    };

    const handleDateSelect = (dateString: string) => {
        setSelectedDate(dateString);
        // Reset slots when date changes
        setSelectedSlots([]);
        setDailySlots(null);
    };

    const handleSlotSelect = (slots: AvailabilitySlot[]) => {
        setSelectedSlots(slots);
    };

    const handleInstructionsChange = (value: string) => {
        setSpecialInstructions(value);
    };

    const handleNext = () => {
        if (currentStep === 1 && !selectedCategory) {
            setError("Please select a service category.");
            return;
        }
        if (currentStep === 2 && !selectedDate) {
            setError("Please select a date.");
            return;
        }
        if (currentStep === 3 && selectedSlots.length === 0) {
            setError("Please select at least one time slot.");
            return;
        }
        setError(null);
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError(null);
        setCurrentStep(prev => Math.max(1, prev - 1)); // Don't go below step 1
    };

    const handleConfirmBooking = async () => {
        if (!providerId || !selectedCategory || selectedSlots.length === 0 || !selectedDate) {
            setError("Missing required booking information.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const bookingData: CreateBookingRequest = {
                providerId,
                categoryId: selectedCategory.id,
                specialInstructions,
                bookingWindows: selectedSlots.map(slot => ({
                    date: selectedDate, // Assuming all selected slots are for the same date
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }))
            };

            const response = await BookingService.createBooking(bookingData);
            if (!response.success) throw new Error(response.message || 'Booking creation failed');
            setBookingSuccess(true);
            setBookingResponse(response);
            // Optionally redirect or show success message
            // router.push('/client/bookings'); // Redirect to bookings page
        } catch (err: any) {
            console.error('Booking failed:', err);
            setError(err.message || 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Rendering ---
    if (!providerId) {
        return <div className="container mx-auto p-4">Invalid provider ID.</div>;
    }

    if (loading && currentStep === 1) { // Only show initial loading for profile
        return <div className="container mx-auto p-4">Loading provider information...</div>;
    }

    if (error && currentStep === 1) { // Show initial error for profile fetch
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    if (!profile) {
        return <div className="container mx-auto p-4">Provider information could not be loaded.</div>;
    }

    if (bookingSuccess) {
        return (
            <div className="container mx-auto p-4">
                <Card className="max-w-md mx-auto mt-10">
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Booking Confirmed!</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center">Your booking has been successfully created.</p>
                        <p className="text-center mt-2">Booking ID: {bookingResponse?.payload?.bookingId || 'N/A'}</p>
                        <Button onClick={() => router.push('/client/bookings')} className="w-full mt-4">
                            View My Bookings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Book {profile.firstName} {profile.lastName}</h1>

            {/* Step 1: Category Selection */}
            {currentStep === 1 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Select Service Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Label htmlFor="category-select">Category</Label>
                            <Select onValueChange={handleCategorySelect} value={selectedCategory?.id || ''}>
                                <SelectTrigger id="category-select" className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {profile.categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name} (${category.hourlyRate}/hr)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Date Selection */}
            {currentStep === 2 && calendarData && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BookingCalendar
                            providerId={providerId}
                            calendarData={calendarData}
                            onDateSelect={handleDateSelect}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Time Slot Selection */}
            {currentStep === 3 && dailySlots && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Select Time Slot</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TimeSlotPicker
                            date={selectedDate}
                            slots={dailySlots.slots}
                            selectedSlots={selectedSlots}
                            onSlotSelect={handleSlotSelect}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Summary & Confirmation */}
            {currentStep === 4 && profile && selectedCategory && selectedDate && selectedSlots.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Confirm Booking</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BookingSummary
                            provider={profile}
                            category={selectedCategory}
                            date={selectedDate}
                            slots={selectedSlots}
                            specialInstructions={specialInstructions}
                            onInstructionsChange={handleInstructionsChange}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Error Message */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button onClick={handleBack} disabled={currentStep === 1 || loading} variant="outline">
                    Back
                </Button>
                {currentStep < 4 ? (
                    <Button onClick={handleNext} disabled={loading}>
                        {loading ? 'Loading...' : 'Next'}
                    </Button>
                ) : (
                    <Button onClick={handleConfirmBooking} disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {loading ? 'Creating Booking...' : 'Confirm Booking'}
                    </Button>
                )}
            </div>
        </div>
    );
}