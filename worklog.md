---
## Task ID: 3-a - Supabase Client Infrastructure & Auth
### Work Task
Create all Supabase client infrastructure, authentication utilities, middleware, types, and Zustand auth store for the SAKSI APP (Election Witness Management System).

### Work Summary

Created the following 8 files to establish complete Supabase Auth integration:

#### 1. `src/lib/supabase/client.ts` — Browser-side Supabase Client
- Uses `createBrowserClient` from `@supabase/ssr` (v0.10.0 new API)
- Marked as `'use client'` for client-side usage
- Simple factory function `createClient()` with no cookie config needed (auto-handled)

#### 2. `src/lib/supabase/server.ts` — Server-side Supabase Client
- Uses `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`
- Implements `getAll` and `setAll` cookie methods (new SSR API, not deprecated `get/set/remove`)
- `setAll` wrapped in try/catch for Server Component compatibility
- Also exports `createServiceClient()` — admin client using `SUPABASE_SERVICE_ROLE_KEY` with `createClient` from `@supabase/supabase-js` directly (no cookie handling, no session persistence)

#### 3. `src/lib/supabase/middleware.ts` — Middleware Supabase Client
- Exports `updateSession(request)` function for Next.js middleware
- Creates server client with cookie read/write from `NextRequest`
- Calls `supabase.auth.getUser()` to verify session
- Full route protection logic:
  - `/auth/*` and `/` are public
  - `/saksi/*` requires role `SAKSI`
  - `/admin/*` requires role `ADMIN`
  - `/keuangan/*` requires role `ADMIN_KEUANGAN`
  - Unauthenticated users on protected paths → redirect to `/auth/login`
  - Authenticated users on `/auth/*` → redirect to role-appropriate dashboard
  - Authenticated users with wrong role → redirect to their correct dashboard
- Fetches user profile from `profiles` table via Supabase client to check role

#### 4. `src/middleware.ts` — Next.js Middleware Entry
- Thin wrapper calling `updateSession` from middleware helper
- Matcher excludes static assets, images, and favicon

#### 5. `src/lib/auth.ts` — Server-side Auth Utilities
- `getSession()` — returns Supabase session from cookies
- `getCurrentUser()` — returns `{ user, profile }` using `getUser()` (verified) + Prisma profile lookup
- `requireAuth(requiredRole?)` — authentication guard with optional role check, returns null if unauthorized
- All functions use the server-side Supabase client + Prisma db

#### 6. `src/lib/db.ts` — Updated Prisma Client
- Kept singleton pattern for dev hot-reload
- Removed `log: ['query']` for production readiness
- Works with PostgreSQL `DATABASE_URL` and `DIRECT_URL` from `.env`

#### 7. `src/types/index.ts` — Type Definitions
- `UserRole` type matching Prisma `Role` enum
- `UserProfile` type matching Prisma `Profile` model with all fields
- `User` as backward-compatible alias
- Additional types: `AssignmentStatus`, `CheckInType`, `ReportStatus`, `PaymentStatus`
- Data types: `TPSData`, `TPSAssignmentData`, `CheckInData`, `VoteInputData`, `FraudReportData`, `PaymentData`
- Auth types: `LoginCredentials`, `RegisterData`, `AuthState`
- Utility type: `ApiResponse<T>`

#### 8. `src/store/authStore.ts` — Zustand Auth Store (Client-side)
- `login()` — uses `supabase.auth.signInWithPassword` + fetches profile
- `register()` — uses `supabase.auth.signUp` with user metadata + fetches profile
- `logout()` — uses `supabase.auth.signOut`
- `initializeAuth()` — checks existing session on app load + sets up `onAuthStateChange` listener
- `setUser()` — manual user state setter
- Properly typed with `AuthStore` interface extending `AuthState`

#### Verification
- ESLint passes with zero errors
- TypeScript compiles successfully (pre-existing errors are from unrelated example/skill files)
- Dev server running and serving pages correctly (HTTP 200)

---
## Task ID: 4 - Complete API Route Layer
### Work Task
Create all backend API routes for the SAKSI APP (Election Witness Management System), including auth, user management, TPS, assignments, check-ins, vote inputs, fraud reports, payments, file uploads, and dashboard stats.

### Work Summary

Created **25 API route files** and **1 utility update** to implement the complete backend API layer. All routes use `requireAuth()` from `@/lib/auth` for authentication and role-based access control, and `db` from `@/lib/db` for database operations.

#### Utility Update: `src/lib/utils.ts`
- Added `haversineDistance(lat1, lon1, lat2, lon2)` — calculates GPS distance in meters using the Haversine formula
- Added `formatCurrency(amount)` — formats numbers as Indonesian Rupiah (IDR) using `Intl.NumberFormat`

#### Auth Routes (2 files)
1. **`src/app/api/auth/register/route.ts`** — POST
   - Creates Supabase Auth user via service role client
   - Creates profile in Prisma `profiles` table with role `SAKSI`
   - Validates email uniqueness, KTP uniqueness, password min length
   - Returns created profile data

2. **`src/app/api/auth/me/route.ts`** — GET
   - Returns current user's profile with aggregated stats (assignment, check-ins, vote input, payments, report count)

#### User Management Routes (2 files)
3. **`src/app/api/users/route.ts`** — GET (Admin)
   - Paginated listing with `page`, `limit`, `search` (name/email/phone), `role` filter

4. **`src/app/api/users/[id]/route.ts`** — GET, PUT, DELETE (Admin)
   - GET: Full user details with assignments, check-ins, vote inputs, reports, payments
   - PUT: Update profile fields with KTP uniqueness check
   - DELETE: Remove user (prevents self-deletion)

#### TPS Routes (2 files)
5. **`src/app/api/tps/route.ts`** — GET, POST
   - GET: List all TPS with search filter, includes active assignment count
   - POST (Admin): Create TPS with code uniqueness validation

6. **`src/app/api/tps/[id]/route.ts`** — GET, PUT, DELETE
   - GET: TPS details with active assignments and counts
   - PUT (Admin): Update TPS fields
   - DELETE (Admin): Delete TPS (prevents if active assignments exist)

#### Assignment Routes (4 files)
7. **`src/app/api/assignments/route.ts`** — GET, POST (Admin)
   - GET: Paginated list with user and TPS info, status/tpsId filters
   - POST: Assign user to TPS (prevents duplicate active assignments, reactivates cancelled)

8. **`src/app/api/assignments/my/route.ts`** — GET (Saksi)
   - Returns current user's active assignment with check-in status, vote input status, and payment status

9. **`src/app/api/assignments/[id]/route.ts`** — PUT, DELETE (Admin)
   - PUT: Update assignment status (ACTIVE/COMPLETED/CANCELLED)
   - DELETE: Remove assignment

#### Check-in Routes (2 files)
10. **`src/app/api/check-ins/route.ts`** — GET, POST
    - GET (Admin): Paginated check-in list with user and TPS info
    - POST (Saksi): Submit check-in with selfie photo (base64), GPS coordinates
      - Haversine distance calculation from assigned TPS
      - `gpsVerified = true` if within 100 meters
      - Prevents duplicate check-in of same type for same TPS
      - Auto-creates payment record on first check-in
      - Updates payment validation (gpsVerified) and recalculates validation score

11. **`src/app/api/check-ins/my/route.ts`** — GET (Saksi)
    - Returns all check-ins for current user with TPS info

#### Vote Input Routes (2 files)
12. **`src/app/api/votes/route.ts`** — GET, POST
    - GET (Admin): Paginated vote input list with user and TPS info
    - POST (Saksi): Submit vote data
      - Auto-calculates `totalValidVotes` and `totalVotes`
      - Updates payment validation (`dataInputted`, `c1Uploaded` if C1 photo provided)
      - Recalculates validation score; auto-promotes to READY_FOR_PAYMENT if score >= 2

13. **`src/app/api/votes/my/route.ts`** — GET (Saksi)
    - Returns current user's vote input with TPS info

#### Fraud Report Routes (2 files)
14. **`src/app/api/reports/route.ts`** — GET, POST
    - GET: List reports (Admin: all, Saksi: own only), supports status/category filters
    - POST (Saksi): Submit fraud report, auto-fills tpsId from active assignment if not provided

15. **`src/app/api/reports/[id]/route.ts`** — GET, PUT
    - GET: Report details (Saksi can only view own reports)
    - PUT (Admin): Update report status and review notes

#### Payment Routes (3 files)
16. **`src/app/api/payments/route.ts`** — GET
    - List payments (Admin/Finance: all, Saksi: own only), supports status filter

17. **`src/app/api/payments/my/route.ts`** — GET (Saksi)
    - Returns all payments for current user

18. **`src/app/api/payments/[id]/route.ts`** — GET, PUT (Finance)
    - GET: Payment details (Saksi can only view own)
    - PUT: Update payment via `?action=approve|disburse|reject` query param
      - `approve`: READY_FOR_PAYMENT → APPROVED
      - `disburse`: APPROVED → DISBURSED
      - `reject`: any non-disbursed/cancelled → CANCELLED
      - Also accepts body fields: paymentMethod, accountNumber, accountName, transferProof

#### Upload Route (1 file)
19. **`src/app/api/upload/route.ts`** — POST
    - Accepts multipart form data with `file` field
    - Validates file type (jpg, png, gif, webp, mp4, webm)
    - Max size: 10MB images, 50MB videos
    - Saves to `public/uploads/images/` or `public/uploads/videos/` with UUID filename
    - Returns public path, filename, mimetype, and size

#### Dashboard Stats Routes (3 files)
20. **`src/app/api/dashboard/admin/route.ts`** — GET (Admin)
    - Overview: totalSaksi, totalTps, activeAssignments, checkInRate, dataInputRate
    - Check-in breakdown by type (MORNING/FINAL)
    - Payment summary by status with counts and amounts
    - Recent saksi registrations (last 10)
    - Recent fraud reports (last 10)

21. **`src/app/api/dashboard/saksi/route.ts`** — GET (Saksi)
    - Profile info and assignment details
    - Check-in status (morning/final) with GPS verification
    - Vote input status
    - Payment status with validation checklist
    - Recent fraud reports (last 5)

22. **`src/app/api/dashboard/keuangan/route.ts`** — GET (Finance)
    - Payment counts by status (pending, ready, approved, disbursed, failed, cancelled)
    - Total disbursed amount and count
    - Total ready-for-payment amount
    - Status breakdown with amounts
    - Recent disbursements (last 10)

#### Verification
- ESLint passes with zero errors
- All routes follow consistent patterns: `requireAuth()` check, try/catch, `{ success, data, error }` response format
- Proper TypeScript typing throughout
- Dev server running normally

---
## Task ID: 5 - Complete Frontend Pages Integration with Real APIs
### Work Task
Create all frontend pages for the SAKSI APP and integrate them with the real API endpoints. Replace any mock/hardcoded data with actual API calls. Build the complete UI for all 3 roles: Saksi, Admin, and Keuangan.

### Work Summary

Created **23 frontend page files**, **1 provider component**, and updated **2 existing files** (layout.tsx, page.tsx) to build the complete frontend layer integrated with all real API endpoints.

#### Foundation (3 files)

1. **`src/components/providers/AuthProvider.tsx`** — Auth initialization provider
   - Client component that calls `useAuthStore.initializeAuth()` on mount
   - Sets up `onAuthStateChange` listener for session persistence
   - Wraps the entire app in the root layout

2. **`src/app/layout.tsx`** — Updated root layout
   - Added `AuthProvider` wrapper around children
   - Switched from `Toaster` to `Sonner` toast provider for consistent notifications
   - Updated metadata to SAKSI APP branding

3. **`src/app/page.tsx`** — Landing page with auth detection
   - Full marketing landing page with hero, features, how-it-works, roles, and CTA sections
   - Auth state detection: redirects authenticated users to their role-specific dashboard
   - Shows loading state while auth initializes
   - Uses shadcn/ui components throughout

#### Auth Pages (2 files)

4. **`src/app/auth/login/page.tsx`** — Login page
   - Email/password form using `useAuthStore.login()` with Supabase
   - Quick-fill demo buttons for saksi@demo.com, admin@demo.com, finance@demo.com
   - Role-based redirect after successful login
   - Password visibility toggle, loading states, error handling via sonner toast

5. **`src/app/auth/register/page.tsx`** — Registration page
   - Complete form: name, email, password, phone, KTP, bank info, e-wallet info
   - Calls `POST /api/auth/register` endpoint
   - Password confirmation, validation, loading states
   - Redirects to login with success toast after registration

#### Saksi Pages (8 files)

6. **`src/app/saksi/dashboard/page.tsx`** — Saksi personal dashboard
   - Calls `GET /api/dashboard/saksi` for all data
   - Shows assignment status, check-in status (morning/final), vote input status
   - Payment status with validation checklist (GPS, data, C1)
   - Quick action cards linking to check-in, input, report, payment pages
   - Recent fraud reports list

7. **`src/app/saksi/profile/page.tsx`** — Profile management
   - Loads profile from `GET /api/auth/me`
   - Editable form for personal info and payment details
   - Updates via `PUT /api/users/[id]`
   - Displays email (readonly), role badge, registration date

8. **`src/app/saksi/tps/page.tsx`** — TPS assignment detail
   - Loads from `GET /api/assignments/my`
   - Shows TPS details: code, name, address, coordinates, DPT
   - Status cards for check-in morning/final and vote input
   - Quick action buttons for check-in, input, report

9. **`src/app/saksi/check-in/page.tsx`** — Morning check-in
   - Camera access with `getUserMedia` for selfie capture
   - GPS coordinates via `navigator.geolocation.getCurrentPosition`
   - Submits to `POST /api/check-ins` with type=MORNING
   - Shows GPS verification result (distance from TPS)
   - Success screen with verification status

10. **`src/app/saksi/input/page.tsx`** — Vote data input
    - Loads existing vote from `GET /api/votes/my` (prevents duplicate)
    - Form for 3 candidates + invalid votes with auto-calculated totals
    - C1 photo upload via `POST /api/upload` then submits path to `POST /api/votes`
    - File preview, size validation (10MB max)
    - Success screen with totals

11. **`src/app/saksi/final-check-in/page.tsx`** — Final check-in
    - Same camera + GPS flow as morning check-in
    - Submits to `POST /api/check-ins` with type=FINAL
    - Shows GPS verification result
    - Links to input suara and dashboard after completion

12. **`src/app/saksi/lapor/page.tsx`** — Fraud report submission
    - Category selector (7 fraud types: suara siluman, penghitungan ulang, etc.)
    - Title and description fields
    - Optional video upload via `POST /api/upload`
    - Submits to `POST /api/reports`
    - Success screen with option to create another report

13. **`src/app/saksi/payment/page.tsx`** — Payment history
    - Loads from `GET /api/payments/my`
    - Shows payment cards with status badges, amounts, validation checklist
    - Payment method details when available
    - Approved/disbursed timestamps

#### Admin Pages (6 files)

14. **`src/app/admin/dashboard/page.tsx`** — Admin overview dashboard
    - Calls `GET /api/dashboard/admin` for all stats
    - Stats cards: total saksi, TPS, active assignments, fraud reports
    - Rate cards: check-in rate, data input rate, total check-ins
    - Payment summary with status breakdown and amounts
    - Quick action buttons to saksi, TPS, plotting, reports management
    - Recent saksi registrations and fraud reports lists

15. **`src/app/admin/saksi/page.tsx`** — Saksi management
    - Loads from `GET /api/users?role=SAKSI` with search and pagination
    - Table view with name, email, phone, KTP, registration date
    - Detail dialog showing full profile, assignments, check-ins, vote inputs, reports
    - Delete functionality with confirmation
    - Debounced search input

16. **`src/app/admin/tps/page.tsx`** — TPS management
    - Loads from `GET /api/tps` with search
    - Table view with code, name, address, region, DPT, active saksi count
    - Add/Edit dialog with full form (code, name, address, lat/lng, region, DPT)
    - Delete functionality with validation (prevents if active assignments)

17. **`src/app/admin/plotting/page.tsx`** — Assignment plotting
    - Loads unassigned saksi by cross-referencing users and assignments
    - TPS list with active assignment count
    - Assign dialog to link saksi to TPS via `POST /api/assignments`
    - Current assignments table with remove functionality

18. **`src/app/admin/reports/page.tsx`** — Fraud report management
    - Loads from `GET /api/reports` with search, status filter, pagination
    - Table view with title, reporter, category, status, date
    - Detail dialog showing full report with video player
    - Status update form (PENDING/UNDER_REVIEW/VERIFIED/DISMISSED) with review notes
    - Updates via `PUT /api/reports/[id]`

19. **`src/app/admin/audit/page.tsx`** — Audit log viewer
    - Loads check-ins from `GET /api/check-ins` and votes from `GET /api/votes`
    - Tab-based view: Check-ins log and Vote input log
    - Check-in log: timestamp, type, saksi, TPS, GPS verification, distance
    - Vote log: timestamp, saksi, TPS, per-candidate votes, total, C1 status

#### Keuangan Pages (4 files)

20. **`src/app/keuangan/dashboard/page.tsx`** — Finance dashboard
    - Calls `GET /api/dashboard/keuangan` for all stats
    - Stats cards: pending, ready for payment, approved, disbursed with amounts
    - Total disbursed highlight card
    - Payment status breakdown grid
    - Quick action buttons to approval, disbursement, history pages
    - Recent disbursements list

21. **`src/app/keuangan/payments/page.tsx`** — Payment approval
    - Loads from `GET /api/payments?status=READY_FOR_PAYMENT` with pagination
    - Table with saksi, amount, validation badges, bank info
    - Review dialog showing user info, validation checklist, score
    - Payment method form (method, account number, account name)
    - Approve via `PUT /api/payments/[id]?action=approve` or reject

22. **`src/app/keuangan/disbursement/page.tsx`** — Fund disbursement
    - Loads from `GET /api/payments?status=APPROVED` with pagination
    - Table with saksi, amount, payment method, account details, approval date
    - Disburse button with confirmation via `PUT /api/payments/[id]?action=disburse`

23. **`src/app/keuangan/history/page.tsx`** — Payment history
    - Loads from `GET /api/payments?status=DISBURSED` with pagination
    - Summary card with total amount for current page
    - Table with disbursement date, saksi, amount, method, account, validation

#### Design & UX Patterns Used Throughout
- **shadcn/ui components**: Card, Button, Badge, Dialog, Table, Input, Label, Select, Textarea, Skeleton
- **sonner** for toast notifications (import `toast` from `sonner`)
- **Lucide icons** throughout for consistent iconography
- **Loading states** using `Skeleton` components
- **Error states** with try/catch and descriptive messages
- **Pagination** with Previous/Next buttons and page indicators
- **Search** with debounced input (500ms delay)
- **Responsive design** using Tailwind CSS grid (1-col mobile, 2/3/4-col desktop)
- **formatCurrency()** utility for IDR formatting
- **Date formatting** using `toLocaleString('id-ID')` and `toLocaleDateString('id-ID')`

#### Verification
- ESLint passes with zero errors
- Dev server running normally with all pages compiling successfully
- All 23 pages call real API endpoints (no mock/hardcoded data)
- Auth flow properly integrated via AuthProvider + useAuthStore + Supabase

---
## Task ID: 6 - Real Leaflet/OpenStreetMap Maps Implementation
### Work Task
Implement real Leaflet/OpenStreetMap maps in all places where maps are needed across the SAKSI APP, including admin TPS management, saksi TPS detail, and GPS check-in pages.

### Work Summary

Created **3 new map components**, **1 admin map overview component**, and updated **4 existing pages** to integrate interactive Leaflet/OpenStreetMap maps.

#### New Map Components (3 files)

1. **`src/components/maps/TPSMapView.tsx`** — Reusable multi-TPS map
   - Displays all TPS locations as color-coded markers on OpenStreetMap
   - Green markers: TPS with active saksi assignments
   - Yellow markers: TPS without saksi
   - Red markers: TPS with issues
   - Custom SVG markers via `L.divIcon` with CSS for each color
   - Auto-calculates map center from average of all TPS coordinates
   - Dynamic zoom level based on TPS spread (10-15)
   - Legend overlay showing marker color meanings
   - Props: `tpsData`, `height`, `zoom`, `showLegend`, `className`
   - Exports `TPSMapItem` interface for type safety

2. **`src/components/maps/SingleTPSMap.tsx`** — Single TPS location map
   - Shows one TPS marker with blue pin icon (SVG with checkmark design)
   - Zoom level 15 for closer view
   - Popup with TPS name, code, address, and coordinates
   - Props: `latitude`, `longitude`, `name`, `code`, `address`, `height`, `className`
   - Validates coordinates before rendering (shows skeleton if invalid)

3. **`src/components/maps/CheckInMap.tsx`** — GPS check-in verification map
   - Shows TPS location with orange marker
   - Shows user's current GPS position with blue marker
   - Draws dashed circle (100m radius) around TPS for verification zone
   - User marker turns green if `isWithinRange=true`, red if false
   - Status badge overlay ("Dalam Radius" / "Di Luar Radius" / "Lokasi Terdeteksi")
   - Props: `tpsLatitude`, `tpsLongitude`, `tpsName`, `tpsCode`, `userLatitude`, `userLongitude`, `isWithinRange`, `radiusMeters`, `height`, `className`

#### Admin Component (1 file)

4. **`src/components/admin/TPSMap.tsx`** — Admin TPS overview dashboard
   - Fetches TPS data from `/api/tps` API
   - Stats cards: Total TPS, Dengan Saksi, Tanpa Saksi, Total Saksi
   - Integrates `TPSMapView` to show all TPS on map
   - Scrollable TPS list with color-coded status indicators
   - Loading skeletons and error handling

#### Updated Pages (4 files)

5. **`src/app/saksi/tps/page.tsx`** — Added `SingleTPSMap`
   - Dynamically imported with `ssr: false`
   - Displays TPS location map below GPS coordinates section
   - Uses assignment data (latitude, longitude, name, code, address)

6. **`src/app/saksi/check-in/page.tsx`** — Added `CheckInMap`
   - Dynamically imported with `ssr: false`
   - Shows TPS location, 100m verification radius, and user GPS position
   - Updates in real-time as GPS coordinates change
   - Positioned inside the GPS verification card

7. **`src/app/saksi/final-check-in/page.tsx`** — Added `CheckInMap`
   - Same map integration as morning check-in page
   - Shows TPS location and user GPS for final check-in verification

8. **`src/app/admin/tps/page.tsx`** — Added map overview and dialog preview
   - Full TPS sebaran (distribution) map card using `TPSMapView` above the table
   - `TPSInlineMap` helper component transforms tpsList to TPSMapView format
   - Inline map preview in Add/Edit dialog: shows marker at typed latitude/longitude
   - Map preview updates dynamically as user enters coordinates
   - Uses `SingleTPSMap` with `height="200px"` for compact dialog view

#### CSS & Dependencies

9. **`src/app/globals.css`** — Added `@import "leaflet/dist/leaflet.css"` for Leaflet styles

10. **Package installation** — Installed `leaflet`, `react-leaflet`, `@types/leaflet`, `@swc/helpers`

#### Technical Decisions

- **SSR handling**: All react-leaflet components (`MapContainer`, `TileLayer`, `Marker`, `Popup`, `Circle`) imported via `next/dynamic` with `ssr: false`
- **Mount detection**: Used `useSyncExternalStore` hook instead of `useState` + `useEffect` pattern to avoid React lint warning about setState in effects
- **Default icon fix**: All three map components include the Leaflet default marker icon fix using unpkg CDN URLs for marker-icon.png, marker-icon-2x.png, and marker-shadow.png
- **Custom markers**: SVG-based colored markers via `L.divIcon` for TPSMapView (green/yellow/red), SingleTPSMap (blue with checkmark), and CheckInMap (orange for TPS, blue/green/red for user)
- **Map styling**: `rounded-lg border shadow-sm overflow-hidden` for consistent appearance
- **Tile layer**: OpenStreetMap standard tiles with proper attribution
- **Zoom calculation**: Dynamic zoom based on TPS coordinate spread (single TPS: 15, spread > 0.1: 10, etc.)

#### Verification
- ESLint passes with zero errors
- Dev server running normally (HTTP 200)
- All map components properly handle SSR, loading states, and invalid coordinates

---
## Task ID: 5b - CRITICAL FIX: Recreate Missing Layout Components, Common Components, and Sub-Layouts
### Work Task
Recreate all critical layout components (Sidebar, Header, Footer, PageWrapper), common components (StatusBadge, StatsCard, LanguageToggle), sub-layouts (saksi, admin, keuangan), and redirect pages that were deleted by the frontend update agent.

### Work Summary

Created **10 new files** and restored the complete layout infrastructure for the SAKSI APP.

#### Layout Components (4 files in `src/components/layout/`)

1. **`src/components/layout/PageWrapper.tsx`** — Flex column wrapper
   - `min-h-screen flex flex-col` layout wrapper
   - Passes children through, used in all sub-layouts

2. **`src/components/layout/Sidebar.tsx`** — Role-based navigation sidebar (`AppSidebar`)
   - 'use client' component with `useState` for mobile toggle
   - Three role-based navigation configs:
     - **SAKSI**: Dashboard, TPS Saya, Check-in, Input Suara, Check-in Akhir, Lapor, Pembayaran
     - **ADMIN**: Dashboard, Kelola Saksi, Kelola TPS, Plotting, Laporan, Audit Log
     - **ADMIN_KEUANGAN**: Dashboard, Pembayaran, Pencairan, Riwayat
   - Each nav item has label, href, icon (lucide-react)
   - Active item highlighting based on `usePathname()` with primary color
   - Mobile-responsive: hamburger overlay with backdrop, slide-in animation
   - User info section at bottom with avatar initials, name, role badge (color-coded), and logout button
   - Uses `useAuthStore` from `@/store/authStore` to get user and role
   - Logout calls `useAuthStore.getState().logout()` then `router.push('/auth/login')`
   - Fixed positioning on desktop (w-64), overlay on mobile with smooth transition
   - ScrollArea for navigation items to handle overflow

3. **`src/components/layout/Header.tsx`** — Sticky header with breadcrumbs
   - 'use client' component with mobile hamburger menu button
   - Shows "SAKSI APP" title on mobile only
   - Breadcrumb navigation based on current path with friendly Indonesian labels
   - Uses shadcn Breadcrumb component
   - Hides single-item breadcrumbs on mobile for cleaner look

4. **`src/components/layout/Footer.tsx`** — Simple footer
   - "© 2024 SAKSI APP. All rights reserved."
   - Sticky to bottom using `mt-auto` in the flex layout

#### Common Components (3 files in `src/components/common/`)

5. **`src/components/common/StatusBadge.tsx`** — Status badge system
   - Helper functions with color mappings:
     - `getPaymentStatusVariant()` / `getPaymentStatusLabel()` — 6 statuses (Pending, Siap Bayar, Disetujui, Dicairkan, Gagal, Dibatalkan)
     - `getReportStatusVariant()` / `getReportStatusLabel()` — 4 statuses (Menunggu, Ditinjau, Terverifikasi, Ditolak)
     - `getAssignmentStatusVariant()` / `getAssignmentStatusLabel()` — 3 statuses (Aktif, Selesai, Dibatalkan)
   - 5 color variants: success (emerald), warning (amber), danger (red), info (blue), secondary (gray)
   - Dark mode compatible with dark: variant styles
   - Pre-built badge components: `PaymentStatusBadge`, `ReportStatusBadge`, `AssignmentStatusBadge`
   - Generic `StatusBadge` for custom use

6. **`src/components/common/StatsCard.tsx`** — Statistics card
   - Card with icon, title, value, and optional description
   - Optional trend indicator with `TrendingUp`/`TrendingDown` icons (positive/negative percentage)
   - Uses shadcn Card component
   - Configurable icon background color via `iconClassName`

7. **`src/components/common/LanguageToggle.tsx`** — Language switcher dropdown
   - Globe icon button with dropdown menu
   - Indonesian (🇮🇩) and English (🇬🇧) options
   - Active language highlighted with `bg-accent`
   - Uses the language Zustand store

#### Store (1 file)

8. **`src/store/languageStore.ts`** — Language state management
   - Zustand store with `language` state ('id' | 'en')
   - `setLanguage()` to switch languages
   - `t(id, en)` helper for inline translations

#### Sub-Layouts (3 files)

9. **`src/app/saksi/layout.tsx`** — Saksi sub-layout
   - Wraps children with `PageWrapper`, `AppSidebar`, `Header`, `Footer`
   - Mobile-responsive sidebar with overlay, desktop fixed at `lg:ml-64`

10. **`src/app/admin/layout.tsx`** — Admin sub-layout (same pattern as saksi)

11. **`src/app/keuangan/layout.tsx`** — Keuangan sub-layout (same pattern as saksi)

#### Redirect Pages (3 files)

12. **`src/app/saksi/page.tsx`** — Redirects to `/saksi/dashboard`
13. **`src/app/admin/page.tsx`** — Redirects to `/admin/dashboard`
14. **`src/app/keuangan/page.tsx`** — Redirects to `/keuangan/dashboard`

#### Design Decisions
- Custom sidebar implementation (not using shadcn/ui SidebarProvider) for simpler mobile toggle control with `useState`
- Used the standard shadcn/ui Badge component with custom color classes via `variant="outline"` + className override for status badges
- Breadcrumb labels use Indonesian-friendly names for all route segments
- Role badges use distinct color schemes: emerald (Saksi), blue (Admin), amber (Keuangan)
- All components use CSS variable-based colors (`bg-card`, `text-foreground`, etc.) for dark mode compatibility

#### Verification
- ESLint passes with zero errors
- Dev server compiling successfully — `/saksi` returns 200 with redirect working (307)
- `/saksi/dashboard` loads correctly with new layout
- All 10 new files created, no existing files modified
