# ReturnDesk — Full Stack Return Management System

ReturnDesk is an enterprise customer support dashboard application engineered for support agents to triage, audit, manage, and resolve customer return and replacement requests.

Built in compliance with the hiring assignment specifications using **Next.js App Router**, **React (JavaScript only)**, **Tailwind CSS**, and **Neon PostgreSQL** with **Prisma ORM**.

---

## Key Features

1. **Modern SaaS Support Dashboard**:
   - Live metrics: Total Returns, Open, In Review, Approved, Rejected, Completed.
   - Status distribution and root-cause reason distribution analytics charts.
   - Recent return requests table and real-time team activity feed.
   - Linear & Stripe-inspired clean aesthetic, responsive down to 375px.

2. **Customer Orders Module**:
   - 10 realistic seeded reference orders with 2–4 purchased products each.
   - Search orders by Order ID, Customer Name, and Customer Email.
   - Order details breakdown with high-resolution e-commerce items, SKUs, and unit prices.
   - One-click **"Create Return Request"** action that pre-populates the order and product item.

3. **Return Requests Management**:
   - **Server-side Search**: Debounced search across Return Reference, Customer Name, Email, and Order ID.
   - **Server-side Filtering**: Instant filtering by Status and Return Reason.
   - **Server-side Sorting & Pagination**: Sort by date, reference, customer, or status with configurable page limits.
   - Auto-generated human-readable reference IDs: `RET-2026-XXXX`.

4. **Detailed Return Case Management**:
   - Visual lifecycle timeline (`Open` → `In Review` → `Approved` → `Completed`, with `Rejected` terminal branch).
   - Dynamic **Action Panel** that displays **only** legally permitted actions for current request status.
   - **Immutable Activity Feed & Notes**: Support notes are permanent audit entries that can never be modified or deleted.

---

## Business Rules (Enforced on Server & Database)

All business rules are strictly validated on the backend API layer before modifying any database records:

### Rule 1: Status Lifecycle Transitions
- **Allowed Transitions**:
  - `Open` → `In Review`
  - `In Review` → `Approved`
  - `In Review` → `Rejected`
  - `Approved` → `Completed`
- `Rejected` and `Completed` are terminal states. Any invalid transition attempt returns HTTP 400 with `INVALID_STATUS_TRANSITION`.

### Rule 2: Approval Requires Resolution
- Valid resolution methods: `Refund`, `Replacement`, `Store Credit`.
- A request cannot transition to `Approved` without selecting a resolution.
- If resolution is `Refund`: `refundAmount` must be strictly greater than 0.
- If resolution is `Replacement` or `Store Credit`: `refundAmount` must be null or absent.

### Rule 3: Single Live Request Per Order Item
- A customer cannot have two concurrent live requests for the same order item.
- Live statuses: `Open`, `In Review`, `Approved`.
- If a previous request reached `Rejected` or `Completed` (or was soft-deleted), a new request for that same order item is allowed.
- Attempts to submit duplicate live requests return HTTP 409 with `DUPLICATE_LIVE_REQUEST`.

### Rule 4: Locked Details After Decision
- Once a request reaches `Approved`, `Rejected`, or `Completed`, customer and item details become read-only.
- Support agents can still append immutable audit notes.
- Editing attempts return HTTP 403 with `DETAILS_LOCKED`.

### Rule 5: Soft Removal
- Requests can only be removed when status is `Open` or `Rejected`.
- Records are never permanently deleted from PostgreSQL; `deletedAt` timestamp is recorded.
- Soft-deleted requests are filtered out from all active tables, search results, and detail endpoints.
- Deletion attempts on `In Review`, `Approved`, or `Completed` return HTTP 400 with `CANNOT_DELETE_REQUEST`.

---

## Tech Stack & Architecture

- **Framework**: Next.js 14+ (App Router)
- **Language**: JavaScript (Strictly NO TypeScript)
- **Database**: Neon Serverless PostgreSQL (`provider = "postgresql"`)
- **ORM**: Prisma ORM with connection pooling support
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Project Structure

```
├── app/
│   ├── api/
│   │   ├── orders/          # GET /api/orders, GET /api/orders/[id]
│   │   ├── returns/         # GET & POST /api/returns, GET/PATCH/DELETE /api/returns/[id]
│   │   │   ├── [id]/status/ # PATCH /api/returns/[id]/status
│   │   │   └── [id]/notes/  # POST /api/returns/[id]/notes
│   │   └── stats/           # GET /api/stats (metrics & distribution)
│   ├── orders/              # Orders list & Order details view
│   ├── returns/             # Return requests table & details page
│   ├── globals.css          # Tailwind base & animations
│   ├── layout.jsx           # App layout with ToastProvider & DashboardShell
│   └── page.jsx             # Operations overview dashboard
├── components/              # Modular UI components (Tables, Charts, Skeletons, ActionPanel)
├── hooks/                   # Custom React hooks (useDebounce, useToast)
├── lib/
│   ├── api-response.js      # Standard JSON success and error response helpers
│   ├── constants.js         # Statuses, reasons, resolutions, color configs
│   └── prisma.js            # PrismaClient singleton instance
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema with relations & indexes
│   ├── seedData.js          # 10 mock orders reference data
│   └── seed.js              # Database seed script (10 orders + 34 returns)
├── services/
│   ├── businessRules.js     # Server-side business rule validation engine
│   ├── returnService.js     # Return requests query & mutation operations
│   ├── orderService.js      # Orders data access layer
│   └── statsService.js      # Aggregation service for dashboard metrics
└── utils/
    ├── cn.js                # Tailwind class utility
    ├── formatters.js        # Currency, datetime, and relative time formatters
    └── referenceGenerator.js# Unique RET-YYYY-XXXX auto-generator
```

---

## Setup & Installation

### 1. Prerequisites
- Node.js v18.18+ or v20+ / v22+
- npm or pnpm
- A Neon PostgreSQL account ([neon.tech](https://neon.tech))

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and configure your Neon connection string:
```env
DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/[database]?sslmode=require"
```

### 3. Generate Prisma Client & Push Schema
Run Prisma database push to apply tables, indexes, and relations to Neon:
```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Database
Execute the seed script to populate 10 mock orders and 34 return requests:
```bash
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Backend API Documentation

All API endpoints follow a consistent JSON response envelope:

### Standard Success Response:
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "total": 35,
    "page": 1,
    "limit": 10,
    "totalPages": 4
  }
}
```

### Standard Error Response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "This status transition is not allowed."
  }
}
```

### API Endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List orders with optional `?search=` filter |
| `GET` | `/api/orders/[id]` | Fetch single order by ID with line items and active returns |
| `GET` | `/api/returns` | List returns with server-side `search`, `status`, `reason`, `sortBy`, `sortOrder`, `page`, `limit` |
| `POST` | `/api/returns` | Create return request (auto-generates `RET-YYYY-XXXX`, checks duplicate live request) |
| `GET` | `/api/returns/[id]` | Get return request details by ID or Reference |
| `PATCH` | `/api/returns/[id]` | Update customer or item details (Rule 4: locked if Approved/Rejected/Completed) |
| `PATCH` | `/api/returns/[id]/status` | Transition status (Rule 1 & Rule 2: validates lifecycle & resolution) |
| `POST` | `/api/returns/[id]/notes` | Add an immutable audit note |
| `DELETE` | `/api/returns/[id]` | Soft removal (Rule 5: allowed only for Open or Rejected requests) |
| `GET` | `/api/stats` | Aggregated dashboard metrics, charts, and activity feed |
