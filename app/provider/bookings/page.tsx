"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useAppointments } from "@/lib/api"
import { Search, RefreshCw, ChevronLeft, ChevronRight, Calendar, MapPin, Eye } from "lucide-react"
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
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
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

  // Loading states for accept/reject actions
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: { accepting: boolean, rejecting: boolean } }>({})

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      fetchBookings()
    }
  }, [isAuthenticated, user?.userId, currentPage, pageSize, searchTerm, statusFilter])

  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      fetchPendingBookings()
    }
  }, [isAuthenticated, user?.userId])

  const fetchBookings = async () => {
    if (!user?.userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await BookingService.getAllBookings(
        user.userId,
        currentPage,
        pageSize,
        searchTerm || null,
        statusFilter !== 'all' ? statusFilter : null
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

  const fetchPendingBookings = async () => {
    if (!user?.userId) return

    try {
      const response = await BookingService.getAllBookings(
        user.userId,
        1, // First page
        4, // Limit to 5 bookings
        null, // No search term
        'requested' // Only pending bookings
      )

      if (response.success) {
        setPendingBookings(response.payload || [])
      }
    } catch (err: any) {
      console.error("Error fetching pending bookings:", err)
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], accepting: true }
    }))

    try {
      const response = await BookingService.acceptBooking(bookingId, 'Accepted', 'Booking accepted by provider')

      if (response.success) {
        // Update the pending bookings list to remove the accepted booking
        setPendingBookings(prev => prev.filter(b => b.bookingId !== bookingId))
        // Optionally refresh the main bookings list
        fetchBookings()
        console.log('Booking accepted successfully')
      } else {
        console.error('Failed to accept booking:', response.message)
      }
    } catch (error) {
      console.error('Error accepting booking:', error)
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [bookingId]: { ...prev[bookingId], accepting: false }
      }))
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    setLoadingStates(prev => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], rejecting: true }
    }))

    try {
      const response = await BookingService.rejectBooking(bookingId, 'Rejected', 'Booking rejected by provider')

      if (response.success) {
        // Update the pending bookings list to remove the rejected booking
        setPendingBookings(prev => prev.filter(b => b.bookingId !== bookingId))
        // Optionally refresh the main bookings list
        fetchBookings()
        console.log('Booking rejected successfully')
      } else {
        console.error('Failed to reject booking:', response.message)
      }
    } catch (error) {
      console.error('Error rejecting booking:', error)
    } finally {
      setLoadingStates(prev => ({
        ...prev,
        [bookingId]: { ...prev[bookingId], rejecting: false }
      }))
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
    fetchPendingBookings()
  }

  // Filter bookings based on search and status
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
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
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
            <SelectItem value="requested">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-medium text-lg mb-4 text-gray-800">Booking Requests</h3>

            {pendingBookings.slice(0, 5).map((booking) => (
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
                    <button
                      className={`px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors shadow-sm ${loadingStates[booking.bookingId]?.accepting
                          ? 'bg-green-400 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600'
                        }`}
                      onClick={() => handleAcceptBooking(booking.bookingId)}
                      disabled={loadingStates[booking.bookingId]?.accepting}
                    >
                      {loadingStates[booking.bookingId]?.accepting ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                          Accepting...
                        </span>
                      ) : 'Accept'}
                    </button>
                    <button
                      className={`px-3 py-1.5 text-white rounded-md text-sm font-medium transition-colors shadow-sm ${loadingStates[booking.bookingId]?.rejecting
                          ? 'bg-red-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                        }`}
                      onClick={() => handleRejectBooking(booking.bookingId)}
                      disabled={loadingStates[booking.bookingId]?.rejecting}
                    >
                      {loadingStates[booking.bookingId]?.rejecting ? (
                        <span className="flex items-center">
                          <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                          Rejecting...
                        </span>
                      ) : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingBookings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No pending booking requests</p>
              </div>
            )}

            {pendingBookings.length > 5 && (
              <div className="text-center mt-4">
                <button
                  className="text-[#00C2CB] hover:text-[#00a0a8] font-medium text-sm"
                  onClick={() => {
                    setActiveTab('requested')
                    setStatusFilter('requested')
                  }}
                >
                  View all requests ({pendingBookings.length})
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Status Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'all' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('all')
                  setStatusFilter('all')
                  setCurrentPage(1)
                }}
              >
                All
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'requested' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('requested')
                  setStatusFilter('requested')
                  setCurrentPage(1)
                }}
              >
                Requests
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'accepted' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('accepted')
                  setStatusFilter('accepted')
                  setCurrentPage(1)
                }}
              >
                Confirmed
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'completed' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('completed')
                  setStatusFilter('completed')
                  setCurrentPage(1)
                }}
              >
                Completed
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'cancelled' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('cancelled')
                  setStatusFilter('cancelled')
                  setCurrentPage(1)
                }}
              >
                Cancelled
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'rejected' ? 'bg-[#00C2CB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                onClick={() => {
                  setActiveTab('rejected')
                  setStatusFilter('rejected')
                  setCurrentPage(1)
                }}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
            {!loading && !error && bookings.length === 0 && (
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
            {!loading && !error && bookings.length > 0 && (
              <>
                <div className="overflow-x-auto p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead></TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Service Details</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.bookingId}>
                          <TableCell>
                            <button
                              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                              onClick={() => router.push(`/provider/bookings/${booking.bookingId}`)}
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                          </TableCell>
                          <TableCell className="font-medium">{booking.clients.name}</TableCell>
                          <TableCell>{booking.bookingSlots[0]?.date || 'N/A'}</TableCell>
                          <TableCell>{booking.serviceType} - {booking.duration}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Accepted' ? 'bg-[#2ecc71] text-white' :
                              booking.status === 'Requested' ? 'bg-[#3498db] text-white' :
                                booking.status === 'Completed' ? 'bg-[#5962b6] text-white' :
                                  booking.status === 'Cancelled' ? 'bg-[#e74c3c] text-white' :
                                    booking.status === 'Rejected' ? 'bg-[#e74c3c] text-white' :
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
    </div>
  )
}