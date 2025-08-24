// --- Generic API Response ---
export interface ApiResponseMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface BaseApiResponse<T> {
  apiResponseId: string;
  success: boolean;
  statusCode: number;
  message: string;
  payload: T;
  meta?: ApiResponseMeta; // Optional, present in list responses
  timestamp: string; // ISO 8601 format
}

// --- Provider Types ---
export interface ProviderCategory {
  id: string;
  name: string;
  hourlyRate: number;
  experienceLevel: number;
}

export interface ProviderProfileBase {
  userId: string;
  providerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  yearsExperience: number;
  providesRecurringBooking: boolean | null;
  workingHours: number | null;
  categories: ProviderCategory[];
  dateOfBirth: string; // ISO 8601
  profilePictureUrl: string;
  primaryAddress: any | null; // Define more specifically if structure is known
  documents: any | null; // Define more specifically if structure is known
}

// Type for the list response payload item
export interface ProviderListItem extends ProviderProfileBase {
  // The list item payload seems to have 'documents' as null always
  // and potentially fewer details than the full profile.
  // We can reuse ProviderProfileBase for now.
}

// Type for the detailed profile response payload
export interface Qualifications {
  education: string;
  certifications: string[];
}

export interface TravelExperience {
  willingToTravel: boolean;
  maxTravelDistance: number | null;
  preferredTransportation: string | null;
  travelLocations: string | null; // Could be an array if structure is known
}

export interface Document {
  documentId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  documentUrl: string;
  documentType: string;
  issuer: string;
  verificationStatus: string; // e.g., "Pending", "Verified", "Rejected"
  uploadedAt: string; // ISO 8601
  verifiedAt: string | null; // ISO 8601
  verifiedBy: string | null;
  rejectionReason: string | null;
  country: string;
  certificationType: string;
  otherCertificationType: string;
  certificationNumber: string | null;
  expiryDate: string; // ISO 8601
  isExpired: boolean;
}

export interface ProviderProfileDetails {
  userId: string;
  providerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  yearsExperience: number;
  providesRecurringBooking: boolean | null;
  workingHours: number | null;
  categories: ProviderCategory[];
  // Note: 'hourlyRate' appears in the detailed profile example but not the list.
  // It might be the max rate or rate for a specific category context.
  // hourlyRate: number;
  dateOfBirth: string; // ISO 8601
  profilePictureUrl: string;
  primaryAddress: any | null; // Define more specifically if structure is known
  documents: Document[];
  bio: string;
  providesOvernight: boolean;
  providesLiveIn: boolean;
  qualifications: string; // This is a JSON string, needs parsing
  ratingCount: number;
  travelExperience: TravelExperience;
}

// --- Availability Types ---
export interface AvailabilitySlot {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface ProviderWeeklyAvailabilityDay {
  id: string;
  day: string; // e.g., "Monday"
  available: boolean;
  slots: AvailabilitySlot[];
}

// --- Calendar Types ---
export interface MonthlyLeave {
  month: string; // e.g., "August 2025"
  dates: number[]; // Array of day numbers
}

export interface ProviderMonthlyCalendar {
  unAvailableDays: string[]; // Array of day names, e.g., ["Wednesday"]
  monthlyLeaves: MonthlyLeave[];
}

// --- Booking Types ---
export interface BookingWindow {
  date: string; // YYYY-MM-DD format for request, ISO for response?
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

// Request payload for creating a booking
export interface CreateBookingRequest {
  providerId: string;
  userId: string;
  categoryId: string;
  specialInstructions: string;
  bookingWindows: BookingWindow[];
}

// --- Client Booking List Types ---
export interface ClientBookingLocation {
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  longitude: number;
  latitude: number;
}

export interface ClientBookingClient {
  name: string;
  phoneNumber: string;
  email: string;
  profilePictureUrl: string | null;
  location: ClientBookingLocation;
}

export interface ClientBookingCareProvider {
  Providerid: string; // Note the capital 'P' in the example
  name: string;
  phoneNumber: string;
  email: string;
  profilePictureUrl: string;
  yearsOfExperience: number;
  rating: number;
}

export interface ClientBookingSlot {
  bookingWindowId: string;
  date: string; // ISO 8601
  startTime: string; // HH:mm:ss?
  endTime: string; // HH:mm:ss?
  status: string;
  invoiceFileName: string | null;
  invoiceFileUrl: string | null;
}

export interface ClientBookingItem {
  bookingId: string;
  duration: string; // e.g., "X hours Y minutes"
  description: string; // Seems like specialInstructions?
  status: string; // e.g., "Completed", "Pending"
  serviceType: string; // Category name?
  totalAmount: number;
  clients: ClientBookingClient;
  careProviders: ClientBookingCareProvider;
  bookingSlots: ClientBookingSlot[];
}

// --- Service Interfaces ---
export interface IProviderService {
  getProviders(
    page?: number,
    pageSize?: number,
    filters?: Record<string, any>
  ): Promise<BaseApiResponse<ProviderListItem[]>>;
  getProviderProfile(
    userId: string
  ): Promise<BaseApiResponse<ProviderProfileDetails>>;
  getProviderAvailability(
    providerId: string
  ): Promise<BaseApiResponse<ProviderWeeklyAvailabilityDay[]>>;
}

export interface IBookingService {
  getMonthlyCalendar(
    providerId: string,
    monthsAhead?: number
  ): Promise<BaseApiResponse<ProviderMonthlyCalendar>>;
  getDailyAvailability(
    providerId: string,
    date: string
  ): Promise<
    BaseApiResponse<{
      id: string;
      day: string;
      available: boolean;
      slots: AvailabilitySlot[];
    }>
  >;
  createBooking(
    bookingData: CreateBookingRequest
  ): Promise<BaseApiResponse<any>>; // Adjust payload type if needed
  getClientBookings(
    userId: string,
    page?: number,
    pageSize?: number,
    filters?: Record<string, any>
  ): Promise<BaseApiResponse<ClientBookingItem[]>>;
}
