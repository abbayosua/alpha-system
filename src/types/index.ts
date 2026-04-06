// ============================================================
// Types for SAKSI APP - Election Witness Management System
// ============================================================

// User roles matching the Prisma Role enum
export type UserRole = 'SAKSI' | 'ADMIN' | 'ADMIN_KEUANGAN'

// User profile matching the Prisma Profile model
export type UserProfile = {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
  ktpNumber?: string | null
  ktpPhoto?: string | null
  bankName?: string | null
  bankAccount?: string | null
  bankHolderName?: string | null
  eWalletType?: string | null
  eWalletNumber?: string | null
  createdAt: string
  updatedAt: string
}

// Backward-compatible alias
export type User = UserProfile

// Assignment statuses
export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED'

// Check-in types
export type CheckInType = 'MORNING' | 'FINAL'

// Report statuses
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED'

// Payment statuses
export type PaymentStatus = 'PENDING' | 'READY_FOR_PAYMENT' | 'APPROVED' | 'DISBURSED' | 'FAILED' | 'CANCELLED'

// TPS (Tempat Pemungutan Suara) - Voting Location
export type TPSData = {
  id: string
  code: string
  name: string
  address: string
  latitude: number
  longitude: number
  kelurahan?: string | null
  kecamatan?: string | null
  kota?: string | null
  province?: string | null
  totalDpt: number
  createdAt: string
  updatedAt: string
}

// TPS Assignment
export type TPSAssignmentData = {
  id: string
  userId: string
  tpsId: string
  status: AssignmentStatus
  assignedBy?: string | null
  assignedAt: string
  createdAt: string
  updatedAt: string
  tps?: TPSData
  user?: UserProfile
}

// Check-in record
export type CheckInData = {
  id: string
  userId: string
  tpsId: string
  type: CheckInType
  selfiePhoto: string
  latitude: number
  longitude: number
  gpsVerified: boolean
  distance?: number | null
  timestamp: string
  createdAt: string
}

// Vote input record
export type VoteInputData = {
  id: string
  userId: string
  tpsId: string
  candidate1Votes: number
  candidate2Votes: number
  candidate3Votes: number
  totalValidVotes: number
  totalInvalidVotes: number
  totalVotes: number
  c1Photo?: string | null
  c1Verified: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
}

// Fraud report
export type FraudReportData = {
  id: string
  userId: string
  tpsId?: string | null
  title: string
  description: string
  category?: string | null
  videoPath?: string | null
  status: ReportStatus
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNotes?: string | null
  createdAt: string
  updatedAt: string
}

// Payment record
export type PaymentData = {
  id: string
  userId: string
  amount: number
  status: PaymentStatus
  c1Uploaded: boolean
  gpsVerified: boolean
  dataInputted: boolean
  validationScore: number
  paymentMethod?: string | null
  accountNumber?: string | null
  accountName?: string | null
  transferProof?: string | null
  approvedBy?: string | null
  approvedAt?: string | null
  disbursedAt?: string | null
  createdAt: string
  updatedAt: string
}

// Auth-related types
export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  email: string
  password: string
  name: string
  phone?: string
}

export type AuthState = {
  user: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

// API response wrapper
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  success: boolean
}
