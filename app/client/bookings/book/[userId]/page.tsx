// app/client/bookings/book/[providerId]/page.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster, toast } from 'sonner'

import { ProviderService } from '@/services/providerService'
import { BookingService } from '@/services/bookingService'
import type {
    ProviderProfileDetails,
    ProviderCategory,
    ProviderMonthlyCalendar,
    AvailabilitySlot,
    CreateBookingRequest,
} from '@/types/api'

import BookingCalendar from '@/components/booking-calender'
import TimeSlotPicker from '@/components/time-slot-picker'
import BookingSummary from '@/components/booking-summary'
import SpecialInstructionsInput from '@/components/special-instructions-input'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// In Next.js 15 / React 19, route params are async; `use()` can unwrap a promise in render.
// Keep this page a Client Component to re-use existing client-only widgets.
interface PageProps {
    params: Promise<{ userId: string }>
}

export default function CreateBookingPage({ params }: PageProps) {
    const router = useRouter()
    const { userId } = React.use(params)

    // --- State ---
    const [profile, setProfile] = useState<ProviderProfileDetails | null>(null)
    const [calendarData, setCalendarData] = useState<ProviderMonthlyCalendar | null>(
        null,
    )
    const [providerId, setProviderId] = useState('')
    const [dailySlots, setDailySlots] = useState<
        | { id: string; day: string; available: boolean; slots: AvailabilitySlot[] }
        | null
    >(null)

    const [selectedCategory, setSelectedCategory] =
        useState<ProviderCategory | null>(null)
    const [selectedDate, setSelectedDate] = useState('')
    const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([])
    const [specialInstructions, setSpecialInstructions] = useState('')

    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)

    // --- Derived helpers ---
    const minutesBetween = (start: string, end: string) => {
        const [sh, sm] = start.split(':').map(Number)
        const [eh, em] = end.split(':').map(Number)
        return (eh * 60 + em) - (sh * 60 + sm)
    }

    const totalMinutes = useMemo(
        () => selectedSlots.reduce((sum, s) => sum + minutesBetween(s.startTime, s.endTime), 0),
        [selectedSlots],
    )

    const hourlyRate = selectedCategory?.hourlyRate ?? 0
    const totalPrice = useMemo(() => {
        const hours = totalMinutes / 60
        return Math.max(0, Math.round(hours * hourlyRate * 100) / 100)
    }, [totalMinutes, hourlyRate])

    const isReadyToCreate = useMemo(() => {
        return (
            !!profile?.providerId &&
            !!selectedCategory &&
            !!selectedDate &&
            selectedSlots.length > 0
        )
    }, [profile?.providerId, selectedCategory, selectedDate, selectedSlots])

    // --- Data fetching ---
    useEffect(() => {
        let active = true
        const run = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const res = await ProviderService.getProviderProfile(userId)
                if (!res?.success) throw new Error(res?.message ?? 'Unable to load provider')
                if (!active) return
                setProfile(res.payload)
                setProviderId(res.payload.providerId)
            } catch (e: any) {
                toast.error(e?.message ?? 'Failed to load provider information')
            } finally {
                setLoading(false)
            }
        }
        run()
        return () => {
            active = false
        }
    }, [userId])

    useEffect(() => {
        const fetchCalendar = async () => {
            if (!profile?.providerId) return
            try {
                const res = await BookingService.getMonthlyCalendar(profile.providerId)
                if (!res?.success) throw new Error(res?.message ?? 'Failed to load calendar')
                setCalendarData(res.payload)
            } catch (e: any) {
                toast.error(e?.message ?? 'Unable to load calendar')
            }
        }
        fetchCalendar()
    }, [profile?.providerId])

    useEffect(() => {
        const fetchDaily = async () => {
            if (!profile?.providerId || !selectedDate) return
            try {
                const res = await BookingService.getDailyAvailability(
                    profile.providerId,
                    selectedDate,
                )
                if (!res?.success)
                    throw new Error(res?.message ?? 'Failed to load availability')
                setDailySlots(res.payload)
                setSelectedSlots([]) // clear previous day selection
            } catch (e: any) {
                toast.error(e?.message ?? 'Unable to load time slots for this date')
            }
        }
        fetchDaily()
    }, [profile?.providerId, selectedDate])

    // --- Handlers ---
    const onCategoryChange = (categoryId: string) => {
        const cat = profile?.categories.find((c) => c.id === categoryId) ?? null
        setSelectedCategory(cat)
    }

    const onDateSelect = (dateString: string) => {
        setSelectedDate(dateString)
    }

    const onSlotsChange = (slots: AvailabilitySlot[]) => setSelectedSlots(slots)

    const onInstructionsChange = (val: string) => setSpecialInstructions(val)

    const validateBeforeCreate = () => {
        if (!profile?.providerId) {
            toast.warning('Provider information is missing.')
            return false
        }
        if (!selectedCategory) {
            toast.warning('Please select a service category.')
            return false
        }
        if (!selectedDate) {
            toast.warning('Please select a date.')
            return false
        }
        if (selectedSlots.length === 0) {
            toast.warning('Please select at least one time slot.')
            return false
        }
        return true
    }

    const onCreateBooking = async () => {
        if (!validateBeforeCreate()) return

        setCreating(true)
        try {
            const payload: CreateBookingRequest = {
                providerId: profile!.providerId,
                userId: profile!.userId, // adjust if your API expects a different user id
                categoryId: selectedCategory!.id,
                specialInstructions,
                bookingWindows: selectedSlots.map((s) => ({
                    date: selectedDate,
                    startTime: s.startTime,
                    endTime: s.endTime,
                })),
            }

            const res = await BookingService.createBooking(payload)
            if (!res?.success) throw new Error(res?.message ?? 'Booking creation failed')

            toast.success('Booking created successfully!')
            router.push('/client/bookings')
        } catch (e: any) {
            toast.error(e?.message ?? 'Failed to create booking. Please try again.')
        } finally {
            setCreating(false)
        }
    }

    // --- UI ---
    return (
        <div className="min-h-screen bg-muted/20">
            <div className="container mx-auto p-4 lg:p-8">
                <Toaster position="top-right" richColors closeButton />

                {/* Header */}
                <div className="mb-8 rounded-2xl bg-gradient-to-tr from-primary/10 via-accent/10 to-background p-6 shadow-sm ring-1 ring-border">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {profile ? (
                                    <>
                                        Book{' '}
                                        <span className="text-primary">
                                            {profile.firstName} {profile.lastName}
                                        </span>
                                    </>
                                ) : (
                                    'Book a Provider'
                                )}
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Follow the steps below to secure your booking.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSelectedCategory(null)
                                    setSelectedDate('')
                                    setSelectedSlots([])
                                    setSpecialInstructions('')
                                    setDailySlots(null)
                                    toast.info('Selection cleared')
                                }}
                            >
                                Clear All
                            </Button>
                            <Button
                                size="lg"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={onCreateBooking}
                                disabled={creating || loading || !isReadyToCreate}
                            >
                                {creating ? 'Creating…' : 'Create Booking'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left: Inputs */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Step 1: Category */}
                        <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                                <CardTitle>
                                    <span className="mr-2 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                                        1
                                    </span>
                                    Service Category
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Label htmlFor="category">
                                    What service do you need?
                                </Label>
                                <Select
                                    value={selectedCategory?.id ?? ''}
                                    onValueChange={onCategoryChange}
                                    disabled={loading || !profile}
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue
                                            placeholder={
                                                loading
                                                    ? 'Loading categories…'
                                                    : 'Select a service'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profile?.categories?.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} (${c.hourlyRate}/hr)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Step 2: Date & Time */}
                        <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                                <CardTitle>
                                    <span className="mr-2 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                                        2
                                    </span>
                                    Choose Date &amp; Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label>Choose a date</Label>
                                    {calendarData ? (
                                        <BookingCalendar
                                            providerId={profile?.providerId ?? ''}
                                            calendarData={calendarData}
                                            selectedDate={selectedDate}
                                            onDateSelect={onDateSelect}
                                        />
                                    ) : (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            {loading
                                                ? 'Loading calendar…'
                                                : 'Calendar not available'}
                                        </div>
                                    )}
                                </div>
                                {selectedDate && (
                                    <div>
                                        <Label>Pick available time slots for {selectedDate}</Label>
                                        {dailySlots ? (
                                            <TimeSlotPicker
                                                date={selectedDate}
                                                slots={dailySlots.slots}
                                                selectedSlots={selectedSlots}
                                                onSlotSelect={onSlotsChange}
                                            />
                                        ) : (
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                Loading available slots…
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 3: Notes */}
                        <Card className="transition-all hover:shadow-lg">
                            <CardHeader>
                                <CardTitle>
                                    <span className="mr-2 rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                                        3
                                    </span>
                                    Special Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <SpecialInstructionsInput
                                    value={specialInstructions}
                                    onChange={onInstructionsChange}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Summary sticky */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-8">
                            <Card className="shadow-lg ring-2 ring-primary/50">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Booking Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <BookingSummary
                                        provider={profile}
                                        category={selectedCategory}
                                        date={selectedDate}
                                        slots={selectedSlots}
                                        totalMinutes={totalMinutes}
                                        totalPrice={totalPrice}
                                    />
                                    <Button
                                        size="lg"
                                        className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                        onClick={onCreateBooking}
                                        disabled={creating || loading || !isReadyToCreate}
                                    >
                                        {creating
                                            ? 'Creating…'
                                            : 'Confirm & Create Booking'}
                                    </Button>
                                    {!isReadyToCreate && (
                                        <p className="mt-2 text-center text-xs text-muted-foreground">
                                            Please complete all steps to proceed.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
