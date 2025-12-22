// Location interface for opportunities
export interface OpportunityLocation {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

// Client opportunity interface
export interface ClientOpportunity {
  id: string;
  title: string;
  description: string;
  serviceType: string;
  location: OpportunityLocation;
  date: string; // ISO date string
  urgency: string;
}

// Provider opportunity interface
export interface ProviderOpportunity {
  id: string;
  title: string;
  description: string;
  clientName: string;
  serviceType: string;
  location: OpportunityLocation;
  expectedHours: string;
  date: string; // ISO date string
  urgency: string;
  hasApplied: boolean;
  createdAt: string; // ISO timestamp
}

// Unified opportunity type that can be either client or provider
export type Opportunity = ClientOpportunity | ProviderOpportunity;

// API response interface for opportunities
export interface OpportunitiesResponse {
  apiResponseId: string;
  success: boolean;
  statusCode: number;
  payload: Opportunity[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  timestamp: string; // ISO timestamp
}
