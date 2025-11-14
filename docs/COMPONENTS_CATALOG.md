# COMPONENTS_CATALOG.md

A catalog of major UI components and their typical props used across the app.

1) Button (components/ui/button.tsx)
- Props (inferred from ButtonProps):
  - variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  - size?: "default" | "sm" | "lg" | "icon"
  - asChild?: boolean
  - standard Button HTML attributes (disabled, onClick, etc.)

2) Table (components/ui/table.tsx)
- Sub components:
  - Table
  - TableHeader
  - TableBody
  - TableRow
  - TableHead
  - TableCell
- Props:
  - Likely standard table-related props; used to render tabular data with children.

3) AppointmentCard (components/appointment-card.tsx)
- Props (inferred):
  - name: string
  - date: string
  - description: string

4) AreaChart (components/area-chart.tsx)
- Props:
  - data series (inferred via internal data sources)
  - title or label (if present)
- Behavior:
  - Renders a responsive chart area

5) DonutChart (components/donut-chart.tsx)
- Props:
  - data distribution (labels, values)
- Behavior:
  - Renders a donut/pie chart

6) RatingGauge (components/rating-gauge.tsx)
- Props:
  - rating: number
  - max?: number
  - label?: string

7) Header (components/header.tsx)
- Props:
  - user/session info, navigation items (inferred)
- Behavior:
  - Renders top navigation bar

8) Sidebar (components/sidebar.tsx)
- Props:
  - navigation structure, active route indicator (inferred)

9) StatsCard (components/stats-card.tsx)
- Props:
  - title: string
  - value: string | number
  - change?: number | string
  - icon?: ReactNode

10) ThemeProvider (components/theme-provider.tsx)
- Props:
  - children
  - theme settings (if provided)

11) AuthCheck (components/auth-check.tsx)
- Props:
  - children: React.ReactNode
- Behavior:
  - Access control wrapper

12) Calendar (components/calendar.tsx)
- Props:
  - likely date-related data; interaction handlers not explicitly seen

13) Modal components
- add-booking-modal.tsx
- add-client-modal.tsx
- create-invoice-modal.tsx
- Props:
  - open/close control
  - callbacks for confirm/cancel
  - data slots for forms (inferred)

14) UI primitives (various)
- Avatar, Badge, Card, Carousel, Checkbox, Input, Label, etc.
- Props follow standard patterns (value, onChange, aria attributes)

Data flow notes
- Pages compose these components and feed data via lib/api.ts hooks (e.g., useStats, useClients, useAppointments, etc.)
- Mock data is consumed using a consistent shape exposed via the hooks.

Usage guidance
- This catalog is a living document. When components are added or props change, update this file accordingly.
- For precise prop typings, reference the actual TS types in each component file.