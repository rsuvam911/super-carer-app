# ROUTING_MAP.md

This document maps Next.js 15 routes to their corresponding source files in the repository. It helps understand the public URL structure and where each page's logic lives.

Routes and source mappings

- / (Root)
  - Source: app/page.tsx
  - Notes: This page immediately redirects to /login.

- /login
  - Source: app/(auth)/login/page.tsx

- /register
  - Source: app/(auth)/register/page.tsx

- /verify-otp
  - Source: app/(auth)/verify-otp/page.tsx

- /auth/callback
  - Source: app/(auth)/auth/callback/page.tsx
  - Notes: This path is part of the authentication flow; the (auth) route group is used to organize auth pages without exposing an explicit “auth” prefix in the URL, but the inner path maps to /auth/callback.

- /dashboard
  - Source: app/dashboard/page.tsx

- /availability
  - Source: app/availability/page.tsx

- /bookings
  - Source: app/bookings/page.tsx

- /chats
  - Source: app/chats/page.tsx

- /clients
  - Source: app/clients/page.tsx

- /invoices
  - Source: app/invoices/page.tsx

- /payment
  - Source: app/payment/page.tsx

- /ratings
  - Source: app/ratings/page.tsx

- /settings
  - Source: app/settings/page.tsx

Additional notes
- Each route folder typically contains a corresponding loading.tsx for loading states and may have additional route-specific subpages (e.g., per-feature dashboards or detail views). 
- Route groups (like (auth)) are used to organize related auth pages without adding extra URL segments for the group itself.

How to extend
- Add a separate ROUTING_MAP_DETAILED.md with per-page props, data dependencies, and navigation flows.
- Cross-link to CODEBASE_INDEX.md for architectural context.