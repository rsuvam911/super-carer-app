"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Clock, Plus, X, Save, Settings } from "lucide-react"
import { BookingService } from "@/services/bookingService"
import { useAuth } from "@/lib/auth-context"
import { Availability } from "@/types/availability"
import { toast } from "sonner"

// Helper function to convert 24-hour format to 12-hour format
const convertTo12HourFormat = (time24: string): string => {
  const [hours, minutes] = time24.split(':').map(Number)
  let hour = hours
  let ampm = 'AM'

  if (hour >= 12) {
    ampm = 'PM'
    if (hour > 12) hour -= 12
  }
  if (hour === 0) hour = 12

  return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

// Helper function to convert time string to minutes for sorting
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export default function AvailabilityPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false)
  const [newTimeSlot, setNewTimeSlot] = useState({ start: "09:00", end: "17:00" })
  const [availability, setAvailability] = useState<Availability[]>([])
  const [originalAvailability, setOriginalAvailability] = useState<Availability[]>([]) // Store original data for comparison
  const [originalGlobalSettings, setOriginalGlobalSettings] = useState({
    bufferDuration: 0,
    providesRecurringBooking: false,
    workingHoursPerDay: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth() // Assuming you have access to provider ID through auth context

  // Global settings
  const [bufferDuration, setBufferDuration] = useState(0)
  const [providesRecurringBooking, setProvidesRecurringBooking] = useState(false)
  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(0)

  useEffect(() => {
    // Set a timeout to stop loading if user data doesn't load
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false)
      }
    }, 5000) // 5 seconds timeout

    fetchAvailabilityTemplate()

    // Clear timeout on component unmount
    return () => clearTimeout(timeoutId)
  }, [user?.providerId])

  const fetchAvailabilityTemplate = async () => {
    if (!user?.providerId) {
      // If user is not available, stop loading after a short delay to prevent infinite loading
      setTimeout(() => {
        setLoading(false)
      }, 1000)
      return
    }

    try {
      setLoading(true)
      const response = await BookingService.getProviderAvailabilityTemplate(user.providerId)

      if (response.success) {
        // Transform the API response to match our internal format
        const transformedAvailability = response.payload.availabilities.map(day => ({
          ...day,
          timeSlots: day.slots.map(slot => ({
            start: slot.startTime,
            end: slot.endTime
          }))
        }))

        // Sort each day's slots by start time
        const sortedAvailability = transformedAvailability.map(day => ({
          ...day,
          slots: [...day.slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)),
          timeSlots: [...day.timeSlots].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
        }))

        setAvailability(sortedAvailability)
        setOriginalAvailability([...sortedAvailability]) // Store original for comparison

        // Set global settings from the response
        setBufferDuration(response.payload.bufferDuration)
        setProvidesRecurringBooking(response.payload.providesRecurringBooking)
        setWorkingHoursPerDay(response.payload.workingHoursPerDay)

        // Store original global settings for comparison
        setOriginalGlobalSettings({
          bufferDuration: response.payload.bufferDuration,
          providesRecurringBooking: response.payload.providesRecurringBooking,
          workingHoursPerDay: response.payload.workingHoursPerDay
        })
      } else {
        console.error("Failed to fetch availability template:", response.message)
        toast.error("Failed to load availability template")
      }
    } catch (error) {
      console.error("Error fetching availability template:", error)
      toast.error("Error loading availability template")
    } finally {
      setLoading(false)
    }
  }

  const toggleDayAvailability = (dayId: string) => {
    setAvailability(prev =>
      prev.map(day =>
        day.id === dayId ? { ...day, available: !day.available } : day
      )
    )
  }

  const addTimeSlot = () => {
    if (!selectedDay) return

    setAvailability(prev =>
      prev.map(day =>
        day.id === selectedDay
          ? {
            ...day,
            slots: [...day.slots, { startTime: newTimeSlot.start, endTime: newTimeSlot.end }],
            available: true,
          }
          : day,
      ),
    )

    // Re-sort the slots for the updated day
    setAvailability(prev =>
      prev.map(day => {
        if (day.id === selectedDay) {
          return {
            ...day,
            slots: [...day.slots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
          }
        }
        return day
      })
    )

    setShowAddTimeSlot(false)
    setNewTimeSlot({ start: "09:00", end: "17:00" })
  }

  const removeTimeSlot = (dayId: string, index: number) => {
    setAvailability(prev =>
      prev.map(day =>
        day.id === dayId
          ? {
            ...day,
            slots: day.slots.filter((_, i) => i !== index),
          }
          : day,
      ),
    )
  }

  const saveAvailability = async () => {
    if (!user?.providerId) return

    try {
      setSaving(true)

      // Prepare the data for API call
      const updateData = {
        availabilities: availability.map(day => ({
          dayOfWeek: day.day,
          isAvailable: day.available,
          slots: day.available ? day.slots : [] // Send empty slots if not available
        })),
        bufferDuration,
        providesRecurringBooking,
        workingHoursPerDay
      }

      const response = await BookingService.bulkUpdateAvailabilities(
        user.providerId,
        updateData
      )

      if (response.success) {
        setOriginalAvailability([...availability]) // Update original data after successful save
        toast.success('Availability updated successfully!')
      } else {
        console.error("Failed to update availability:", response.message)
        toast.error('Failed to update availability: ' + response.message)
      }
    } catch (error) {
      console.error("Error updating availability:", error)
      toast.error('Error updating availability')
    } finally {
      setSaving(false)
    }
  }

  const selectedDayData = selectedDay ? availability.find((day) => day.id === selectedDay) : null

  // Check if there are changes to save
  const hasChanges =
    JSON.stringify(availability) !== JSON.stringify(originalAvailability) ||
    bufferDuration !== originalGlobalSettings.bufferDuration ||
    providesRecurringBooking !== originalGlobalSettings.providesRecurringBooking ||
    workingHoursPerDay !== originalGlobalSettings.workingHoursPerDay

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2CB] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-auto mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Availability</h1>
        <p className="text-gray-600">Set your working hours and availability</p>
      </div>

      {/* Save Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={saveAvailability}
          disabled={!hasChanges || saving || !user?.providerId}
          className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${hasChanges && !saving && user?.providerId
            ? 'bg-[#00C2CB] text-white hover:bg-[#00b0b9]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </>
          )}
        </button>
      </div>

      {/* Global Settings Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-[#00C2CB] mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Global Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buffer Duration (minutes)
            </label>
            <input
              type="number"
              value={bufferDuration}
              onChange={(e) => setBufferDuration(parseInt(e.target.value) || 0)}
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent transition-all"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Time buffer between appointments</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Hours Per Day
            </label>
            <input
              type="number"
              value={workingHoursPerDay}
              onChange={(e) => setWorkingHoursPerDay(parseInt(e.target.value) || 0)}
              className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent transition-all"
              min="0"
              max="24"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum working hours per day</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurring Bookings
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={providesRecurringBooking}
                onChange={(e) => setProvidesRecurringBooking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C2CB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C2CB]"></div>
            </label>
            <p className="text-xs text-gray-500 mt-1">Allow recurring bookings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Weekly Schedule</h2>

          <div className="space-y-3">
            {availability.map((day) => (
              <div
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedDay === day.id
                  ? "border-[#00C2CB] bg-[#00C2CB]/10 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <CalendarIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="font-medium text-gray-800">{day.day}</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={day.available}
                      onChange={() => toggleDayAvailability(day.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C2CB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C2CB]"></div>
                  </label>
                </div>

                {day.available && day.slots.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {day.slots.map((slot, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="p-1 bg-gray-100 rounded mr-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                        </div>
                        <span>
                          {convertTo12HourFormat(slot.startTime)} - {convertTo12HourFormat(slot.endTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedDayData ? (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{selectedDayData.day} Schedule</h2>
                  <p className="text-gray-600 text-sm">Manage your availability for {selectedDayData.day}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Available:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDayData.available}
                      onChange={() => toggleDayAvailability(selectedDay!)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C2CB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C2CB]"></div>
                  </label>
                </div>
              </div>

              {selectedDayData.available ? (
                <>
                  <div className="space-y-3 mb-6">
                    {selectedDayData.slots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="p-2 bg-[#00C2CB]/10 rounded-lg mr-3">
                            <Clock className="h-4 w-4 text-[#00C2CB]" />
                          </div>
                          <span className="font-medium text-gray-800">
                            {convertTo12HourFormat(slot.startTime)} - {convertTo12HourFormat(slot.endTime)}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (selectedDay) {
                              removeTimeSlot(selectedDay, index)
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {showAddTimeSlot ? (
                    <div className="p-5 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Plus className="h-5 w-5 mr-2 text-[#00C2CB]" />
                        Add New Time Slot
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <input
                            type="time"
                            value={newTimeSlot.start}
                            onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, start: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <input
                            type="time"
                            value={newTimeSlot.end}
                            onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, end: e.target.value }))}
                            className="px-4 py-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setShowAddTimeSlot(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addTimeSlot}
                          className="px-4 py-2 bg-[#00C2CB] text-white rounded-lg hover:bg-[#00b0b9] transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Time Slot
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddTimeSlot(true)}
                      className="flex items-center text-[#00C2CB] hover:text-[#00b0b9] font-medium transition-colors"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Time Slot
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Not Available</h3>
                  <p className="text-gray-600 mb-4 max-w-md">
                    You are currently marked as unavailable on {selectedDayData.day}s.
                    Enable availability to add time slots.
                  </p>
                  <button
                    onClick={() => toggleDayAvailability(selectedDay!)}
                    className="px-6 py-2 bg-[#00C2CB] text-white rounded-lg hover:bg-[#00b0b9] transition-colors font-medium"
                  >
                    Mark as Available
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <CalendarIcon className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Day</h3>
              <p className="text-gray-600 text-center max-w-md">
                Select a day from the weekly schedule to view and edit time slots.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}