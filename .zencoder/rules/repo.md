---
description: Repository Information Overview
alwaysApply: true
---

# Super Carer Dashboard Information

## Summary
A Next.js-based dashboard application for care providers, offering features like appointment management, client tracking, invoicing, and ratings. The application includes authentication, real-time updates, and a comprehensive UI built with modern React practices.

## Structure
- **app/**: Next.js app directory with route components and layouts
- **components/**: Reusable UI components including shadcn/ui components
- **data/**: JSON data files for mock data
- **hooks/**: Custom React hooks
- **lib/**: Utility functions, API client, and context providers
- **public/**: Static assets like images and logos
- **styles/**: Global CSS and styling configurations

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.x
**Framework**: Next.js 15.2.4
**React Version**: React 19
**Build System**: Next.js built-in
**Package Manager**: pnpm (with Bun lockfile support)

## Dependencies
**Main Dependencies**:
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **State Management**: Zustand, Immer
- **Data Fetching**: Axios, TanStack Query
- **Form Handling**: React Hook Form, Zod validation
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns, react-day-picker
- **Notifications**: Sonner toast

**Development Dependencies**:
- TypeScript 5.x
- Tailwind CSS 3.4.17
- PostCSS 8.x

## Build & Installation
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Authentication
**Method**: JWT-based authentication
**Storage**: LocalStorage for tokens
**API Integration**: RESTful API with axios interceptors
**Flows**: Login, Registration, OTP Verification, Logout

## Main Features
- **Dashboard**: Overview with statistics and charts
- **Bookings**: Appointment scheduling and management
- **Clients**: Client information and management
- **Invoices**: Invoice creation and tracking
- **Ratings**: Performance ratings and feedback
- **Chat**: Communication interface
- **Settings**: User and application settings

## Routing
**Type**: Next.js App Router
**Authentication Protection**: Route protection via AuthCheck component
**Layout Structure**: Nested layouts with auth and main application separation
**Entry Point**: Root redirects to login page