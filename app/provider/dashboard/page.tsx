"use client"

import AppointmentCard from "@/components/appointment-card"
import AreaChart from "@/components/area-chart"
import Calendar from "@/components/calendar"
import DonutChart from "@/components/donut-chart"
import RatingGauge from "@/components/rating-gauge"
import StatsCard from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useAppointments, useInvoices, useStats, useUser } from "@/lib/api"
import { DollarSign, Edit, ExternalLink, FileText, LayoutDashboard } from "lucide-react"


// Define types for our data
interface Invoice {
  id: string
  invoiceNo: string
  clientName: string
  price: string | number
  dueDate: string
  status: string
}

interface Appointment {
  id: string
  name: string
  date: string
  description: string
}

export default function Dashboard() {
  const { data: stats } = useStats()
  const { data: userData } = useUser()
  const { data: appointments } = useAppointments()
  const { data: invoices } = useInvoices()

  if (!stats || !userData || !appointments || !invoices) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {userData.user.name}</h1>
        <p className="text-gray-500">{userData.currentDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Work"
          value={stats.totalWork}
          change={stats.totalWorkChange}
          icon={<LayoutDashboard className="h-6 w-6 text-[#1a2352]" />}
        />
        <StatsCard
          title="Total Earning"
          value={`$${stats.totalEarning}`}
          change={stats.totalEarningChange}
          icon={<DollarSign className="h-6 w-6 text-[#00C2CB]" />}
        />
        <StatsCard
          title="Total Invoices"
          value={stats.totalInvoices}
          change={stats.totalInvoicesChange}
          icon={<FileText className="h-6 w-6 text-orange-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Average Services</h3>
            <div className="flex items-center">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">Yearly</span>
            </div>
          </div>
          <div className="h-64">
            <AreaChart />
          </div>
        </div>

        <div>
          <Calendar />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Invoices</h3>
              <a href="/invoices" className="text-xs text-[#00C2CB]">
                View all
              </a>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 6).map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>${invoice.price}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${invoice.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          <span className={`mr-1 w-1.5 h-1.5 rounded-full ${invoice.status === "Completed" ? "bg-green-700" : "bg-red-700"}`}></span>
                          {invoice.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Upcoming</h3>
              <a href="/bookings" className="text-xs text-[#00C2CB]">
                View all
              </a>
            </div>

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

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Ratings and Reviews</h3>
              <a href="/ratings" className="text-xs text-[#00C2CB]">
                View all
              </a>
            </div>

            <RatingGauge />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Clients</h3>
              <div className="text-xs text-gray-500">Show last 7 days</div>
            </div>

            <DonutChart />

            <div className="mt-4 grid grid-cols-1 gap-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-[#1a2352] rounded-sm mr-2"></span>
                <span className="text-xs">Elderly Care</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-[#00C2CB] rounded-sm mr-2"></span>
                <span className="text-xs">Children Care</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-[#FF8A65] rounded-sm mr-2"></span>
                <span className="text-xs">Disability Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

