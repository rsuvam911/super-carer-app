"use client"

import AppointmentCard from "@/components/appointment-card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useAppointments, useBookings } from "@/lib/api"
import { Search } from "lucide-react"

// Define types for our data
interface Booking {
  id: string
  clientName: string
  location: string
  date: string
  serviceDetails: string
}

interface Appointment {
  id: string
  name: string
  date: string
  description: string
}

export default function BookingsPage() {
  const { data: bookings } = useBookings()
  const { data: appointments } = useAppointments()

  if (!bookings || !appointments) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-gray-500">250 Bookings</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button className="bg-[#00C2CB] text-white px-4 py-2 rounded-full text-sm">List View</button>
        <button className="text-gray-500 px-4 py-2 rounded-full text-sm">Calendar View</button>
      </div>

      <div className="flex justify-between mb-6">
        <div className="relative w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search here"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent"
          />
        </div>

        <div className="flex items-center">
          <span className="mr-2 text-sm">Sort by:</span>
          <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00C2CB] focus:border-transparent">
            <option>Newest</option>
            <option>Oldest</option>
            <option>A-Z</option>
            <option>Z-A</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="flex space-x-2 mb-4">
            <button className="bg-[#00C2CB] text-white px-4 py-2 rounded-md text-sm">All 200</button>
            <button className="bg-white text-gray-500 px-4 py-2 rounded-md text-sm">Upcoming 12</button>
            <button className="bg-white text-gray-500 px-4 py-2 rounded-md text-sm">Completed 10</button>
            <button className="bg-white text-gray-500 px-4 py-2 rounded-md text-sm">Cancelled 60</button>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Upcoming</h3>

            {appointments.map((appointment: Appointment) => (
              <div key={appointment.id}>
                <AppointmentCard
                  name={appointment.name}
                  date={appointment.date}
                  description={appointment.description}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Service Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking: Booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.clientName}</TableCell>
                    <TableCell>{booking.location}</TableCell>
                    <TableCell>{booking.date}</TableCell>
                    <TableCell>{booking.serviceDetails}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

