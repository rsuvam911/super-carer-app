export interface BookingLocation {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  longitude: number;
  latitude: number;
}

export interface BookingClient {
  name: string;
  phoneNumber: string;
  email: string;
  profilePictureUrl: string;
  location: BookingLocation | null;
}

export interface BookingCareProvider {
  Providerid: string;
  name: string;
  phoneNumber: string;
  email: string;
  profilePictureUrl: string;
  yearsOfExperience: number;
  rating: number;
}

export interface BookingSlot {
  bookingWindowId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  invoiceFileName: string | null;
  invoiceFileUrl: string | null;
}

export interface Booking {
  bookingId: string;
  duration: string;
  description: string;
  status: "Requested" | "Accepted" | "Completed" | "Cancelled";
  serviceType: string;
  totalAmount: number;
  clients: BookingClient;
  careProviders: BookingCareProvider;
  bookingSlots: BookingSlot[];
}

export interface BookingListResponse {
  apiResponseId: string;
  success: boolean;
  statusCode: number;
  message: string;
  payload: Booking[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  timestamp: string;
}
