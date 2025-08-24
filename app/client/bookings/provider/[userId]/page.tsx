// app/client/provider/[userId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProviderService } from '@/services/providerService';
import { BaseApiResponse, ProviderProfileDetails, ProviderWeeklyAvailabilityDay } from '@/types/api';
import ProviderProfileHeader from '@/components/provider-profile-header';
import AvailabilityCalendar from '@/components/availability-calender';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define the type for page props if using App Router with params
// If using pages router, access via `useRouter().query.userId`
interface ProviderProfilePageProps {
    params: { userId: string };
}

export default function ProviderProfilePage({ params }: ProviderProfilePageProps) {
    const router = useRouter();
    const { userId } = params;
    const [profile, setProfile] = useState<ProviderProfileDetails | null>(null);
    const [availability, setAvailability] = useState<ProviderWeeklyAvailabilityDay[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [profileRes, availabilityRes] = await Promise.all([
                    ProviderService.getProviderProfile(userId),
                    // We need providerId for availability, get it after profile loads
                    // This means we might need two useEffects or handle it differently
                    // Let's fetch profile first, then availability
                    Promise.resolve(null as unknown as BaseApiResponse<ProviderWeeklyAvailabilityDay[]>) // Placeholder
                ]);

                if (!profileRes.success) {
                    throw new Error(profileRes.message || 'Failed to fetch profile');
                }
                setProfile(profileRes.payload);

                // Now fetch availability using the providerId from the profile
                const availabilityResponse = await ProviderService.getProviderAvailability(profileRes.payload.providerId);
                if (!availabilityResponse.success) {
                    throw new Error(availabilityResponse.message || 'Failed to fetch availability');
                }
                setAvailability(availabilityResponse.payload);

            } catch (err: any) {
                console.error('Failed to fetch provider data:', err);
                setError(err.message || 'Failed to load provider data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) { // Ensure userId is available
            fetchData();
        }
    }, [userId]);

    const handleBookNow = () => {
        if (profile) {
            router.push(`/client/bookings/book/${profile.userId}`);
        }
    };

    if (loading) return <div className="container mx-auto p-4">Loading provider details...</div>;
    if (error) return (
        <div className="container mx-auto p-4">
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
    );
    if (!profile) return <div className="container mx-auto p-4">Provider not found.</div>; // Handle case where profile wasn't set despite no error/loading

    return (
        <div className="container mx-auto p-4">
            <ProviderProfileHeader profile={profile} />
            <div className="mb-6 flex justify-end">
                <Button onClick={handleBookNow} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Book Now
                </Button>
            </div>
            <AvailabilityCalendar availabilityData={availability} />
            {/* Potentially add ProviderDocuments component here if needed */}
        </div>
    );
}