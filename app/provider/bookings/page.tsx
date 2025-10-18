"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";
import AppointmentCard from "@/components/appointment-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useAppointments } from "@/lib/api"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: appointments } = useAppointments()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      fetchBookings()
    }
  }, [isAuthenticated, user?.userId, currentPage, pageSize, searchTerm, statusFilter])

  const fetchBookings = async () => {
    if (!user?.userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await BookingService.getAllBookings(
        user.userId,
        currentPage,
        pageSize
      )

      if (response.success) {
        setBookings(response.payload || [])
        if (response.meta) {
          setTotalPages(response.meta.totalPages)
          setTotalCount(response.meta.totalCount)
          setHasNextPage(response.meta.hasNextPage)
          setHasPreviousPage(response.meta.hasPreviousPage)
        }
      } else {
        setError(response.message || "Failed to fetch bookings")
      }
    } catch (err: any) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize))
    setCurrentPage(1) // Reset to first page
  }

  const handleRefresh = () => {
    fetchBookings()
  }

  // Helper function to get booking count by status
  const getBookingCountByStatus = (status: "Pending" | "Confirmed" | "Completed" | "Cancelled") => {
    return bookings.filter(booking => booking.status === status).length
  }

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.clients.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-600 text-center">
            Please log in to view your bookings.
          </p>
        </div>
      </div>
    )
  }

  if (!appointments) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-gray-500">{totalCount} Bookings</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <button className="bg-[#00C2CB] text-white px-4 py-2 rounded-full text-sm">List View</button>
        <button className="text-gray-500 px-4 py-2 rounded-full text-sm">Calendar View</button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by client name, service type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value)
          setActiveTab(value)
          setCurrentPage(1)
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'all' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('all')
                  setStatusFilter('all')
                  setCurrentPage(1)
                }}
              >
                All {totalCount > 0 ? totalCount : '200'}
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'pending' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('pending')
                  setStatusFilter('pending')
                  setCurrentPage(1)
                }}
              >
                Requests {getBookingCountByStatus('Pending')}
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'confirmed' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('confirmed')
                  setStatusFilter('confirmed')
                  setCurrentPage(1)
                }}
              >
                Confirmed {getBookingCountByStatus('Confirmed')}
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'completed' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('completed')
                  setStatusFilter('completed')
                  setCurrentPage(1)
                }}
              >
                Completed {getBookingCountByStatus('Completed')}
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'cancelled' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('cancelled')
                  setStatusFilter('cancelled')
                  setCurrentPage(1)
                }}
              >
                Cancelled {getBookingCountByStatus('Cancelled')}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-lg mb-4 text-gray-800">Booking Requests</h3>

            {bookings.filter(booking => booking.status === 'Pending').slice(0, 5).map((booking) => (
              <div key={booking.bookingId} className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{booking.clients.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{booking.serviceType}</span> - {booking.duration}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {booking.bookingSlots[0]?.date || 'N/A'} at {booking.bookingSlots[0]?.startTime || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.clients.location?.city || 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors shadow-sm">
                      Accept
                    </button>
                    <button className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {bookings.filter(booking => booking.status === 'Pending').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No pending booking requests</p>
              </div>
            )}

            {bookings.filter(booking => booking.status === 'Pending').length > 5 && (
              <div className="text-center mt-4">
                <button
                  className="text-[#00C2CB] hover:text-[#00a0a8] font-medium text-sm"
                  onClick={() => {
                    setActiveTab('pending')
                    setStatusFilter('pending')
                  }}
                >
                  View all requests ({bookings.filter(booking => booking.status === 'Pending').length})
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading bookings...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-red-800">{error}</p>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredBookings.length === 0 && (
            <div className="p-6">
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {bookings.length === 0
                    ? "You don't have any bookings yet."
                    : "No bookings match your search criteria."}
                </p>
              </div>
            </div>
          )}

          {/* Bookings Table */}
          {!loading && !error && filteredBookings.length > 0 && (
            <>
              <div className="overflow-x-auto p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Service Details</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell className="font-medium">{booking.clients.name}</TableCell>
                        <TableCell>{booking.clients.location?.city || 'N/A'}</TableCell>
                        <TableCell>{booking.bookingSlots[0]?.date || 'N/A'}</TableCell>
                        <TableCell>{booking.serviceType} - {booking.duration}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-[#2ecc71] text-white' :
                              booking.status === 'Pending' ? 'bg-[#3498db] text-white' :
                                booking.status === 'Completed' ? 'bg-[#9b59b6] text-white' :
                                  booking.status === 'Cancelled' ? 'bg-[#e74c3c] text-white' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {booking.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{" "}
                    bookings
                  </span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={handlePageSizeChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}