# CODEBASE_INDEX_DETAILED.md

This document expands CODEBASE_INDEX.md with concrete data models, API surface, and component roles.

Data models
- Appointment
  - id: string
  - name: string
  - date: string
  - description: string

- Booking
  - id: string
  - clientName: string
  - location: string
  - date: string
  - serviceDetails: string

- Client
  - id: string
  - name: string
  - location: string
  - date: string
  - serviceDetails: string
  - status: string

- Invoice
  - id: string
  - invoiceNo: string
  - clientName: string
  - price: number
  - dueDate: string
  - status: string

- ClientDistribution
  - elderlyCare: number
  - childrenCare: number
  - disabilityCare: number

Data sources (mock)
- data/appointments.json
- data/bookings.json
- data/clients.json
- data/invoices.json
- data/ratings.json
- data/service-data.json
- data/stats.json
- data/users.json
- data/client-distribution.json

lib/api.ts surface
- useStats(): fetches stats from data/stats.json
- useClients(): fetches clients from data/clients.json
- useInvoices(): fetches invoices from data/invoices.json
- useBookings(): fetches bookings from data/bookings.json
- useAppointments(): fetches appointments from data/appointments.json
- useClientDistribution(): fetches client distribution from data/client-distribution.json
- useServiceData(): fetches service data from data/service-data.json
- useRatings(): fetches ratings from data/ratings.json
- useUser(): fetches a user object and currentDate from data/users.json
- loginUser(email, password): mock login against users.json
- registerUser(name, email, password): mock registration (no persistence)
- socialLogin(provider): mock social login returning first user

App routing and pages
- ROUTING_MAP.md documents the URL-to-page mappings (root, login, register, verify-otp, auth/callback, dashboard, availability, bookings, chats, clients, invoices, payment, ratings, settings)

UI primitives and components
- Button (components/ui/button.tsx) and other UI primitives (Table, Calendar, DonutChart, AreaChart, RatingGauge, etc.)
- Key pages compose these components to render data from lib/api.ts

How data flows
- App pages call hooks from lib/api.ts to retrieve mock data
- Components render data via props and internal state
- The app uses app/layout.tsx to provide Providers and AuthCheck wrappers

Running and development notes
- To run: npm install, then npm run dev
- The app uses Next.js 15, Tailwind, and React Query via @tanstack/react-query
- Mock data is used for development; this is not a production API

Observations
- Data schemas are inferred from the data/*.json files and the API hooks in lib/api.ts
- The authentication flow scaffolding exists under app/(auth)

Next steps
- Normalize data types (e.g., date formats) for consistent modeling
- Add tests and type validations for data loading
- Create a CODEBASE_INDEX_DETAILED.md for UI props and a DATA_MODEL.md for explicit JSON schemas