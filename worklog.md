# SAKSI APP - Election Witness Management System

## Project Overview
A comprehensive election witness management system with performance-based payment module.

---
Task ID: 1
Agent: Main Planner
Task: Architecture Planning & Database Schema Design

## System Architecture

### User Roles
1. **Saksi (Witness)** - Field witnesses at TPS
2. **Admin** - System administrators for plotting & management
3. **Admin Keuangan (Finance Admin)** - Payment approval & disbursement

### Technology Stack
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (Prisma)
- **Authentication**: NextAuth.js v4
- **File Storage**: Local file system with organized uploads
- **Real-time**: Optional WebSocket for notifications

### Database Schema Design

```prisma
// Core Tables

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  phone         String?
  password      String
  name          String
  role          Role      @default(SAKSI)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Saksi-specific fields
  ktpNumber     String?   @unique
  ktpPhoto      String?    // Path to KTP image
  bankName      String?
  bankAccount   String?
  bankHolderName String?
  eWalletType   String?    // GoPay, OVO, DANA, etc.
  eWalletNumber String?
  
  // Relations
  assignments   TPSAssignment[]
  checkIns      CheckIn[]
  voteInputs    VoteInput[]
  fraudReports  FraudReport[]
  payments      Payment[]
  auditLogs     AuditLog[]
  
  @@map("users")
}

enum Role {
  SAKSI
  ADMIN
  ADMIN_KEUANGAN
}

model TPS {
  id            String    @id @default(cuid())
  code          String    @unique  // TPS Code
  name          String
  address       String
  latitude      Float
  longitude     Float
  kelurahan     String?
  kecamatan     String?
  Kota          String?
  province      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  assignments   TPSAssignment[]
  checkIns      CheckIn[]
  
  @@map("tps")
}

model TPSAssignment {
  id            String    @id @default(cuid())
  userId        String
  tpsId         String
  status        AssignmentStatus @default(ACTIVE)
  assignedBy    String?   // Admin ID
  assignedAt    DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  tps           TPS       @relation(fields: [tpsId], references: [id])
  
  @@unique([userId, tpsId])
  @@map("tps_assignments")
}

enum AssignmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

model CheckIn {
  id            String    @id @default(cuid())
  userId        String
  tpsId         String
  type          CheckInType
  selfiePhoto   String    // Path to selfie image
  latitude      Float
  longitude     Float
  gpsVerified   Boolean   @default(false)
  distance      Float?    // Distance from TPS in meters
  timestamp     DateTime  @default(now())
  createdAt     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
  tps           TPS       @relation(fields: [tpsId], references: [id])
  
  @@map("check_ins")
}

enum CheckInType {
  MORNING       // Pagi hari - check in awal
  FINAL         // Setelah penghitungan selesai
}

model VoteInput {
  id            String    @id @default(cuid())
  userId        String
  tpsId         String
  // Vote counts for each candidate/party
  candidate1Votes   Int      @default(0)
  candidate2Votes   Int      @default(0)
  candidate3Votes   Int      @default(0)
  // Can add more candidates as needed
  totalValidVotes   Int      @default(0)
  totalInvalidVotes Int      @default(0)
  totalVotes        Int      @default(0)
  
  // C1 Document
  c1Photo       String?   // Path to C1 photo
  c1Verified    Boolean   @default(false)
  
  submittedAt   DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  tps           TPS       @relation(fields: [tpsId], references: [id])
  
  @@map("vote_inputs")
}

model FraudReport {
  id            String    @id @default(cuid())
  userId        String
  tpsId         String?
  title         String
  description   String
  videoPath     String?   // Path to video evidence
  status        ReportStatus @default(PENDING)
  reviewedBy    String?
  reviewedAt    DateTime?
  reviewNotes   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  
  @@map("fraud_reports")
}

enum ReportStatus {
  PENDING
  UNDER_REVIEW
  VERIFIED
  DISMISSED
}

model Payment {
  id            String    @id @default(cuid())
  userId        String
  amount        Float
  status        PaymentStatus @default(PENDING)
  
  // Validation checklist
  c1Uploaded    Boolean   @default(false)
  gpsVerified   Boolean   @default(false)
  dataInputted  Boolean   @default(false)
  validationScore Int     @default(0)  // Percentage 0-100
  
  // Payment details
  paymentMethod String?   // BANK / EWALLET
  accountNumber String?
  accountName   String?
  transferProof String?   // Path to transfer proof image
  
  approvedBy    String?   // Admin Keuangan ID
  approvedAt    DateTime?
  disbursedAt   DateTime?
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(fields: [userId], references: [id])
  
  @@map("payments")
}

enum PaymentStatus {
  PENDING           // Waiting for validation
  READY_FOR_PAYMENT // All requirements met (100%)
  APPROVED          // Approved by Admin Keuangan
  DISBURSED         // Payment sent
  FAILED            // Payment failed
  CANCELLED         // Cancelled
}

model AuditLog {
  id            String    @id @default(cuid())
  userId        String?
  action        String
  entityType    String
  entityId      String?
  oldValue      String?
  newValue      String?
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())
  
  user          User?     @relation(fields: [userId], references: [id])
  
  @@map("audit_logs")
}

model SystemConfig {
  id            String    @id @default(cuid())
  key           String    @unique
  value         String
  description   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("system_configs")
}
```

## Page Structure

### Public Pages
- `/` - Landing page (redirect based on role)
- `/auth/login` - Login page
- `/auth/register` - Registration for saksi

### Saksi (Witness) Pages
- `/saksi/dashboard` - Main dashboard
- `/saksi/profile` - Profile & bank account setup
- `/saksi/tps` - Assigned TPS details
- `/saksi/check-in` - Morning check-in with selfie
- `/saksi/input` - Vote input & C1 upload
- `/saksi/final-check-in` - Final selfie
- `/saksi/lapor` - Fraud reporting
- `/saksi/payment` - Payment status & history

### Admin Pages
- `/admin/dashboard` - Admin dashboard
- `/admin/saksi` - Saksi management
- `/admin/tps` - TPS management
- `/admin/plotting` - Assign saksi to TPS
- `/admin/reports` - View fraud reports
- `/admin/audit` - Audit trail

### Admin Keuangan (Finance) Pages
- `/keuangan/dashboard` - Finance dashboard
- `/keuangan/payments` - Payment approval list
- `/keuangan/disbursement` - Process payments
- `/keuangan/history` - Payment history

## Stage Summary
- Designed comprehensive database schema with all required entities
- Defined user roles and access control
- Planned page structure for all user types
- Ready for implementation planning

---
Task ID: 2
Agent: Main Developer
Task: Frontend Implementation

## Work Log:
- Created comprehensive PLAN.md with implementation phases
- Updated Prisma schema with all entities (User, TPS, TPSAssignment, CheckIn, VoteInput, FraudReport, Payment, AuditLog, SystemConfig)
- Pushed database schema with `bun run db:push`
- Created TypeScript types in src/types/index.ts
- Created Zustand auth store in src/store/authStore.ts
- Created constants file in src/lib/constants.ts

### Layout Components:
- Sidebar.tsx - Role-based navigation sidebar
- Header.tsx - Page header with breadcrumbs
- Footer.tsx - Sticky footer
- PageWrapper.tsx - Layout wrapper

### Common Components:
- StatsCard.tsx - Statistics display card
- StatusBadge.tsx - Status badge with variants

### Auth Components:
- LoginForm.tsx - Login form with validation
- RegisterForm.tsx - Registration form with payment method setup

### Pages Created:
- Landing page (/) with features, benefits, and CTA
- Login page (/auth/login)
- Register page (/auth/register)
- Dashboard layout (/layout.tsx)

#### Saksi Pages:
- Dashboard (/saksi/dashboard) - Task checklist, payment status
- Profile (/saksi/profile) - Personal info & payment method
- TPS (/saksi/tps) - Assigned TPS details
- Check-in (/saksi/check-in) - GPS verification & selfie
- Input (/saksi/input) - Vote count input & C1 upload
- Final Check-in (/saksi/final-check-in) - Final selfie
- Lapor (/saksi/lapor) - Fraud reporting with video
- Payment (/saksi/payment) - Payment status & history

#### Admin Pages:
- Dashboard (/admin/dashboard) - Stats & overview
- Saksi (/admin/saksi) - Saksi management CRUD
- TPS (/admin/tps) - TPS management CRUD
- Plotting (/admin/plotting) - Assign saksi to TPS
- Reports (/admin/reports) - Fraud report management
- Audit (/admin/audit) - Audit trail viewer

#### Finance Pages:
- Dashboard (/keuangan/dashboard) - Payment stats
- Payments (/keuangan/payments) - Payment approval
- Disbursement (/keuangan/disbursement) - Process payments
- History (/keuangan/history) - Payment history

## Stage Summary:
- Complete frontend implementation with 116 files
- All pages use responsive design with Tailwind CSS
- shadcn/ui components for consistent UI
- TypeScript for type safety
- Zustand for state management
- React Hook Form + Zod for form validation
- Pushed to GitHub: https://github.com/abbayosua/alpha-system.git

