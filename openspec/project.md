# Project Context

## Purpose

The Super Carer App is a healthcare provider management platform built with Next.js. It serves as a dashboard application for care providers and clients in the healthcare industry, facilitating appointment management, invoicing, client communications, and service delivery.

The application supports two distinct user roles:

- Clients who seek care services
- Care providers who deliver care services

## Tech Stack

- **Frontend Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **UI Components**: Radix UI primitives with custom components
- **State Management**: Zustand for global state, React Query for server state
- **Authentication**: JWT-based authentication with refresh token mechanism
- **Real-time Communication**: WebSocket integration for chat functionality
- **Form Handling**: React Hook Form with Zod validation
- **Payments**: Stripe integration
- **Charts & Data Visualization**: Recharts
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Build Tool**: Bun (for faster builds)
- **Deployment**: Docker containerization with Nginx reverse proxy

## Project Conventions

### Code Style

- TypeScript for type safety across the entire codebase
- Functional components with React Hooks
- Strict typing for all components, functions, and API responses
- Component files organized by feature/functionality
- Consistent naming conventions:
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Functions: camelCase (e.g., `getUserData()`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)
  - Files: kebab-case (e.g., `user-profile.tsx`)
- Tailwind CSS for styling with utility-first approach
- Responsive design principles applied throughout

### Architecture Patterns

- **Component-Based Architecture**: Reusable UI components organized in a components directory
- **Feature-Sliced Design**: Code organized by features (auth, client, provider, etc.)
- **Service Layer**: Dedicated service files for API interactions (`services/` directory)
- **Hook-Based Logic**: Custom hooks for reusable logic (`hooks/` directory)
- **Context API**: For global state management (authentication, theme, etc.)
- **Middleware**: For route protection and authentication enforcement
- **Container/Presentational Pattern**: Separation of data fetching logic from UI components

### Testing Strategy

- Unit testing with Jest for utility functions and helpers
- Component testing with React Testing Library
- End-to-end testing with Cypress
- Integration testing for API services
- Manual testing for UI/UX flows

### Git Workflow

- Feature branch workflow
- Pull requests with code reviews required for merging
- Semantic commit messages
- Main branch protection with required status checks
- Release tagging for deployments

## Domain Context

The application serves the healthcare industry with a focus on connecting care providers with clients who need various types of care services including:

- Elderly care
- Children care
- Disability care

Key domain concepts:

- **Users**: Two distinct roles - clients and care providers
- **Appointments**: Scheduled care sessions between clients and providers
- **Bookings**: Requests for care services that become appointments
- **Invoices**: Billing documents for services rendered
- **Ratings**: Client feedback on provider performance
- **Availability**: Provider schedules indicating when they can provide services
- **Chat**: Real-time communication between clients and providers
- **Payments**: Financial transactions for services

## Important Constraints

- Role-based access control enforced at both frontend and backend levels
- Token-based authentication with automatic refresh
- GDPR compliance for handling personal health information
- Responsive design requirement for mobile and desktop access
- Dockerized deployment for consistent environments
- HTTPS-only communication in production
- Rate limiting for API endpoints

## External Dependencies

- **Backend API**: RESTful API at `https://careappapi.intellexio.com/api/v1`
- **WebSocket Server**: Real-time communication at `ws://localhost:5221/ws`
- **Stripe API**: Payment processing
- **Docker Hub**: Container image registry
- **Nginx**: Reverse proxy and load balancing
- **Redis**: Caching and session storage
- **GitHub**: Source code repository and CI/CD
