"use client"

import { useState } from "react"
import { CalendarIcon, Clock, Plus, X } from "lucide-react"

export default function AvailabilityPage() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showAddTimeSlot, setShowAddTimeSlot] = useState(false)
  const [newTimeSlot, setNewTimeSlot] = useState({ start: "09:00", end: "17:00" })

  // Mock availability data
  const weekDays = [
    { id: "monday", name: "Monday", available: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    { id: "tuesday", name: "Tuesday", available: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    {
      id: "wednesday",
      name: "Wednesday",
      available: true,
      timeSlots: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
      ],
    },
    { id: "thursday", name: "Thursday", available: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
    { id: "friday", name: "Friday", available: true, timeSlots: [{ start: "09:00", end: "15:00" }] },
    { id: "saturday", name: "Saturday", available: false, timeSlots: [] },
    { id: "sunday", name: "Sunday", available: false, timeSlots: [] },
  ]

  const [availability, setAvailability] = useState(weekDays)

  const toggleDayAvailability = (dayId: string) => {
    setAvailability((prev) => prev.map((day) => (day.id === dayId ? { ...day, available: !day.available } : day)))
  }

  const addTimeSlot = () => {
    if (!selectedDay) return

    setAvailability((prev) =>
      prev.map((day) =>
        day.id === selectedDay
          ? {
              ...day,
              timeSlots: [...day.timeSlots, newTimeSlot],
              available: true,
            }
          : day,
      ),
    )

    setShowAddTimeSlot(false)
    setNewTimeSlot({ start: "09:00", end: "17:00" })
  }

  const removeTimeSlot = (dayId: string, index: number) => {
    setAvailability((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              timeSlots: day.timeSlots.filter((_, i) => i !== index),
              available: day.timeSlots.length > 1, // Set to unavailable if removing the last time slot
            }
          : day,
      ),
    )
  }

  const selectedDayData = selectedDay ? availability.find((day) => day.id === selectedDay) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-gray-500">Set your working hours and availability</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">Weekly Schedule</h2>

          <div className="space-y-4">
            {availability.map((day) => (
              <div
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedDay === day.id ? "border-[#00C2CB] bg-[#00C2CB]/5" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">{day.name}</span>
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

                {day.available && day.timeSlots.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    {day.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          {slot.start} - {slot.end}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          {selectedDayData ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">{selectedDayData.name} Schedule</h2>

                <div className="flex items-center">
                  <span className="mr-2 text-sm">Available:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDayData.available}
                      onChange={() => toggleDayAvailability(selectedDay)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00C2CB]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00C2CB]"></div>
                  </label>
                </div>
              </div>

              {selectedDayData.available ? (
                <>
                  <div className="space-y-4">
                    {selectedDayData.timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-gray-500" />
                          <span>
                            {slot.start} - {slot.end}
                          </span>
                        </div>

                        <button
                          onClick={() => removeTimeSlot(selectedDay, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {showAddTimeSlot ? (
                    <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg">
                      <h3 className="font-medium mb-3">Add Time Slot</h3>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={newTimeSlot.start}
                            onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, start: e.target.value }))}
                            className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="time"
                            value={newTimeSlot.end}
                            onChange={(e) => setNewTimeSlot((prev) => ({ ...prev, end: e.target.value }))}
                            className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowAddTimeSlot(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={addTimeSlot}
                          className="px-4 py-2 bg-[#00C2CB] text-white rounded-md hover:bg-[#00b0b9]"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowAddTimeSlot(true)} className="mt-4 flex items-center text-[#00C2CB]">
                      <Plus className="h-5 w-5 mr-1" />
                      Add Time Slot
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="bg-gray-100 p-3 rounded-full mb-3">
                    <CalendarIcon className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Not Available</h3>
                  <p className="text-gray-500 text-center mb-4">
                    You are currently marked as unavailable on {selectedDayData.name}s.
                  </p>
                  <button
                    onClick={() => toggleDayAvailability(selectedDay)}
                    className="px-4 py-2 bg-[#00C2CB] text-white rounded-md hover:bg-[#00b0b9]"
                  >
                    Mark as Available
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center h-full">
              <div className="bg-gray-100 p-3 rounded-full mb-3">
                <CalendarIcon className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Day Selected</h3>
              <p className="text-gray-500 text-center">
                Select a day from the weekly schedule to view and edit time slots.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

