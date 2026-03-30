# SAKSI APP - Election Witness Management System

## Complete Implementation Plan

---

## Project Overview

SAKSI APP is a comprehensive election witness management system designed to manage field witnesses (Saksi) at polling stations (TPS), track their activities, validate their submissions, and process performance-based payments.

### Key Features
- Multi-role authentication system (Saksi, Admin, Admin Keuangan)
- TPS (Polling Station) assignment and management
- GPS-verified check-in system with selfie verification
- Vote count input and C1 document upload
- Fraud reporting with video evidence
- Performance-based payment validation and disbursement
- Complete audit trail for all actions

---

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **State Management**: Zustand (client state), TanStack Query (server state)
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v4
- **File Storage**: Local filesystem (public/uploads)

### Real-time (Optional)
- **WebSocket**: Socket.io for real-time notifications

---

## Database Schema

### Core Entities

#### User
- Primary entity for all system users
- Role-based access control (SAKSI, ADMIN, ADMIN_KEUANGAN)
- Saksi-specific fields: KTP, bank account, e-wallet
- Relations: assignments, checkIns, voteInputs, fraudReports, payments

#### TPS (Polling Station)
- Geographic data with coordinates
- Administrative divisions (kelurahan, kecamatan, kota, province)
- Relations: assignments, checkIns

#### TPSAssignment
- Links Users to TPS
- Status tracking (ACTIVE, COMPLETED, CANCELLED)
- Audit trail for assignment

#### CheckIn
- GPS-verified attendance
- Two types: MORNING (start of day), FINAL (after vote count)
- Selfie photo verification
- Distance calculation from TPS

#### VoteInput
- Vote counts for candidates
- C1 document photo
- Validation status

#### FraudReport
- Issue reporting with video evidence
- Status workflow (PENDING → UNDER_REVIEW → VERIFIED/DISMISSED)

#### Payment
- Performance-based payment calculation
- Validation checklist (C1 uploaded, GPS verified, data inputted)
- Payment status workflow
- Transfer proof documentation

#### AuditLog
- Complete audit trail for all actions
- Tracks old/new values for changes

#### SystemConfig
- Configuration key-value pairs
- Payment amount settings, thresholds, etc.

---

## Page Structure & Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page with role-based redirect |
| `/auth/login` | Login page |
| `/auth/register` | Registration for Saksi |

### Saksi Routes (Protected)
| Route | Description |
|-------|-------------|
| `/saksi/dashboard` | Main dashboard overview |
| `/saksi/profile` | Profile & payment method setup |
| `/saksi/tps` | Assigned TPS details |
| `/saksi/check-in` | Morning check-in with selfie |
| `/saksi/input` | Vote input & C1 upload |
| `/saksi/final-check-in` | Final selfie check-in |
| `/saksi/lapor` | Fraud reporting |
| `/saksi/payment` | Payment status & history |

### Admin Routes (Protected)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | Admin dashboard overview |
| `/admin/saksi` | Saksi management CRUD |
| `/admin/tps` | TPS management CRUD |
| `/admin/plotting` | Assign saksi to TPS |
| `/admin/reports` | View fraud reports |
| `/admin/audit` | Audit trail viewer |

### Finance Admin Routes (Protected)
| Route | Description |
|-------|-------------|
| `/keuangan/dashboard` | Finance dashboard |
| `/keuangan/payments` | Payment approval list |
| `/keuangan/disbursement` | Process payments |
| `/keuangan/history` | Payment history |

---

## Component Architecture

### Shared Components
```
src/components/
├── ui/                    # shadcn/ui components (existing)
├── layout/
│   ├── Header.tsx         # App header with navigation
│   ├── Sidebar.tsx        # Role-based sidebar navigation
│   ├── Footer.tsx         # App footer
│   └── PageWrapper.tsx    # Layout wrapper with sticky footer
├── auth/
│   ├── LoginForm.tsx      # Login form component
│   └── RegisterForm.tsx   # Registration form component
├── saksi/
│   ├── CheckInForm.tsx    # GPS + Selfie check-in
│   ├── VoteInputForm.tsx  # Vote count input
│   ├── C1Upload.tsx       # C1 document upload
│   ├── FraudReportForm.tsx # Fraud report form
│   └── PaymentCard.tsx    # Payment status card
├── admin/
│   ├── SaksiTable.tsx     # Saksi data table
│   ├── TPSTable.tsx       # TPS data table
│   ├── PlottingMap.tsx    # Assignment plotting
│   └── ReportCard.tsx     # Fraud report card
├── keuangan/
│   ├── PaymentTable.tsx   # Payment list table
│   ├── ValidationChecklist.tsx # Payment validation
│   └── DisbursementForm.tsx # Payment processing
└── common/
    ├── StatsCard.tsx      # Statistics card
    ├── DataTable.tsx      # Reusable data table
    ├── FileUpload.tsx     # File upload component
    ├── GPSCapture.tsx     # GPS capture component
    ├── CameraCapture.tsx  # Camera/selfie capture
    └── StatusBadge.tsx    # Status badge component
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new saksi |
| POST | `/api/auth/login` | Login (NextAuth) |
| POST | `/api/auth/logout` | Logout (NextAuth) |

### User Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update current user profile |
| GET | `/api/users` | List users (Admin) |
| GET | `/api/users/:id` | Get user by ID (Admin) |
| PUT | `/api/users/:id` | Update user (Admin) |
| DELETE | `/api/users/:id` | Delete user (Admin) |

### TPS Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tps` | List TPS |
| GET | `/api/tps/:id` | Get TPS details |
| POST | `/api/tps` | Create TPS (Admin) |
| PUT | `/api/tps/:id` | Update TPS (Admin) |
| DELETE | `/api/tps/:id` | Delete TPS (Admin) |

### Assignment Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List assignments |
| GET | `/api/assignments/my` | Get my assignment (Saksi) |
| POST | `/api/assignments` | Create assignment (Admin) |
| PUT | `/api/assignments/:id` | Update assignment (Admin) |
| DELETE | `/api/assignments/:id` | Remove assignment (Admin) |

### Check-In
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/check-ins` | List check-ins |
| GET | `/api/check-ins/my` | Get my check-ins |
| POST | `/api/check-ins` | Submit check-in (Saksi) |

### Vote Input
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/votes` | List vote inputs |
| GET | `/api/votes/my` | Get my vote input |
| POST | `/api/votes` | Submit vote input (Saksi) |
| PUT | `/api/votes/:id` | Update vote input (Saksi) |

### Fraud Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | List reports |
| GET | `/api/reports/:id` | Get report details |
| POST | `/api/reports` | Submit report (Saksi) |
| PUT | `/api/reports/:id` | Update report status (Admin) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List payments |
| GET | `/api/payments/my` | Get my payments (Saksi) |
| GET | `/api/payments/:id` | Get payment details |
| PUT | `/api/payments/:id/approve` | Approve payment (Finance) |
| PUT | `/api/payments/:id/disburse` | Mark as disbursed (Finance) |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload file (image/video) |

---

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Database schema design
- [ ] Prisma schema implementation
- [ ] Database migration
- [ ] Basic authentication setup

### Phase 2: Frontend Core
- [ ] Landing page
- [ ] Authentication pages (Login, Register)
- [ ] Layout components (Header, Sidebar, Footer)
- [ ] Protected route middleware

### Phase 3: Saksi Module
- [ ] Saksi dashboard
- [ ] Profile & payment method setup
- [ ] TPS details view
- [ ] Check-in feature (GPS + Selfie)
- [ ] Vote input & C1 upload
- [ ] Final check-in
- [ ] Fraud reporting

### Phase 4: Admin Module
- [ ] Admin dashboard
- [ ] Saksi management CRUD
- [ ] TPS management CRUD
- [ ] Assignment plotting
- [ ] Report management

### Phase 5: Finance Module
- [ ] Finance dashboard
- [ ] Payment approval workflow
- [ ] Disbursement processing
- [ ] Payment history

### Phase 6: API Implementation
- [ ] Authentication API
- [ ] User management API
- [ ] TPS management API
- [ ] Assignment API
- [ ] Check-in API
- [ ] Vote input API
- [ ] Fraud report API
- [ ] Payment API
- [ ] File upload API

### Phase 7: Polish & Testing
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design testing
- [ ] Accessibility improvements
- [ ] Performance optimization

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (saksi)/
│   │   └── saksi/
│   │       ├── dashboard/page.tsx
│   │       ├── profile/page.tsx
│   │       ├── tps/page.tsx
│   │       ├── check-in/page.tsx
│   │       ├── input/page.tsx
│   │       ├── final-check-in/page.tsx
│   │       ├── lapor/page.tsx
│   │       └── payment/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/page.tsx
│   │       ├── saksi/page.tsx
│   │       ├── tps/page.tsx
│   │       ├── plotting/page.tsx
│   │       ├── reports/page.tsx
│   │       └── audit/page.tsx
│   ├── (keuangan)/
│   │   └── keuangan/
│   │       ├── dashboard/page.tsx
│   │       ├── payments/page.tsx
│   │       ├── disbursement/page.tsx
│   │       └── history/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── tps/
│   │   ├── assignments/
│   │   ├── check-ins/
│   │   ├── votes/
│   │   ├── reports/
│   │   ├── payments/
│   │   └── upload/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── auth/
│   ├── saksi/
│   ├── admin/
│   ├── keuangan/
│   └── common/
├── hooks/
│   ├── useAuth.ts
│   ├── useGPS.ts
│   ├── useCamera.ts
│   └── useFileUpload.ts
├── lib/
│   ├── db.ts
│   ├── utils.ts
│   ├── auth.ts
│   └── constants.ts
├── store/
│   ├── authStore.ts
│   └── uiStore.ts
└── types/
    └── index.ts
```

---

## Security Considerations

1. **Authentication**: NextAuth.js with secure session management
2. **Authorization**: Role-based access control on all routes and API endpoints
3. **Input Validation**: Zod schemas for all user inputs
4. **File Upload**: Validate file types, size limits, scan for malware
5. **GPS Verification**: Calculate distance from TPS, set acceptable radius
6. **Audit Trail**: Log all critical actions with user, timestamp, IP
7. **CSRF Protection**: Built-in with Next.js
8. **Rate Limiting**: Implement on authentication endpoints

---

## Performance Considerations

1. **Database**: Proper indexing on frequently queried fields
2. **Caching**: In-memory caching for frequently accessed data
3. **Pagination**: Implement for all list endpoints
4. **Image Optimization**: Next.js Image component for uploaded photos
5. **Code Splitting**: Dynamic imports for large components
6. **Lazy Loading**: Load images and components on demand

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Default admin user created
- [ ] File upload directory permissions set
- [ ] SSL certificate configured
- [ ] Backup strategy implemented
- [ ] Monitoring and logging set up

---

## Current Task Priority

1. **Update Prisma Schema** - Implement the designed schema
2. **Build Landing Page** - Create the main entry point
3. **Build Auth Pages** - Login and registration
4. **Build Saksi Dashboard** - Core user interface
5. **Build Admin Dashboard** - Management interface
6. **Build Finance Dashboard** - Payment management
7. **Implement APIs** - Backend functionality

---

## Notes

- All monetary values stored as Float (consider using Decimal for production)
- GPS coordinates stored as Float
- File paths stored as strings (relative to uploads directory)
- Consider implementing real-time notifications with WebSocket for production
- Add email/SMS notifications for critical events
