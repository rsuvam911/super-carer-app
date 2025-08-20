# CODEBASE_INDEX.md

This document provides a concise index of the codebase for the Next.js 15 application "Super Carer App".

## Quick start
- npm install
- npm run dev

## Tech stack
- Next.js 15
- React 19
- Tailwind CSS
- TanStack Query
- Radix UI
- Zustand
- class-variance-authority
- zod
- axios

## Project structure
- app/ (Next.js app directory with per-feature pages)
- components/ (UI library, layout components)
- data/ (mock JSON datasets)
- hooks/ (custom React hooks)
- lib/ (data access layer, helpers, auth context)
- public/ (static assets)
- styles/ (global styles)

## app/ details
- app/layout.tsx
- app/middleware.ts (currently empty)
- app/page.tsx
- app/(auth)/layout.tsx
- app/(auth)/auth/{callback, login, register, verify-otp}
- app/availability/{page, loading}
- app/bookings/{page, loading}
- app/chats/{page, loading}
- app/clients/{page, loading}
- app/dashboard/page.tsx
- app/invoices/{page, loading}
- app/payment/{page, loading}
- app/ratings/{page, loading}
- app/settings/{page, loading}

## Components
- components/auth-check.tsx
- components/header.tsx
- components/sidebar.tsx
- components/ui/* (shared UI primitives)
- components/modal/* (add-booking, add-client, create-invoice)

## lib
- lib/api.ts (mock API wrappers using React Query)
- lib/auth-context.tsx
- lib/store.ts
- lib/utils.ts

## Data
- data/appointments.json
- data/bookings.json
- data/clients.json
- data/invoices.json
- data/ratings.json
- data/service-data.json
- data/stats.json
- data/users.json
- data/client-distribution.json

## Public assets
- care_logo.png
- placeholder-logo.png
- placeholder-logo.svg
- placeholder-user.jpg
- placeholder.jpg
- placeholder.svg
- super-carer-app-logo.svg
- super-carer-logo.svg

## Configuration & tooling
- next.config.mjs
- package.json
- tsconfig.json
- tailwind.config.ts
- postcss.config.mjs

## Observations
- The app uses mock data from data/*.json via lib/api.ts.
- app/layout.tsx wires Providers and AuthCheck around the app.
- app/middleware.ts exists but is currently empty.
- lib/api.ts exposes a number of React Query hooks and auth helpers to simulate backend operations.

## How to extend this index
- Add a README-style routing map with exact path-to-component mappings.
- Document data models by listing JSON schemas (even if inferred) and their relationships.
- Add test scaffolding notes and how to run tests (if present).