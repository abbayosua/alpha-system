// User types
export type Role = 'SAKSI' | 'ADMIN' | 'ADMIN_KEUANGAN';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  ktpNumber?: string;
  ktpPhoto?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolderName?: string;
  eWalletType?: string;
  eWalletNumber?: string;
}

// TPS types
export interface TPS {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  province?: string;
  createdAt: string;
  updatedAt: string;
}

// Assignment types
export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TPSAssignment {
  id: string;
  userId: string;
  tpsId: string;
  status: AssignmentStatus;
  assignedBy?: string;
  assignedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  tps?: TPS;
}

// Check-in types
export type CheckInType = 'MORNING' | 'FINAL';

export interface CheckIn {
  id: string;
  userId: string;
  tpsId: string;
  type: CheckInType;
  selfiePhoto: string;
  latitude: number;
  longitude: number;
  gpsVerified: boolean;
  distance?: number;
  timestamp: string;
  createdAt: string;
  user?: User;
  tps?: TPS;
}

// Vote input types
export interface VoteInput {
  id: string;
  userId: string;
  tpsId: string;
  candidate1Votes: number;
  candidate2Votes: number;
  candidate3Votes: number;
  totalValidVotes: number;
  totalInvalidVotes: number;
  totalVotes: number;
  c1Photo?: string;
  c1Verified: boolean;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Fraud report types
export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED';

export interface FraudReport {
  id: string;
  userId: string;
  tpsId?: string;
  title: string;
  description: string;
  videoPath?: string;
  status: ReportStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Payment types
export type PaymentStatus = 'PENDING' | 'READY_FOR_PAYMENT' | 'APPROVED' | 'DISBURSED' | 'FAILED' | 'CANCELLED';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  c1Uploaded: boolean;
  gpsVerified: boolean;
  dataInputted: boolean;
  validationScore: number;
  paymentMethod?: string;
  accountNumber?: string;
  accountName?: string;
  transferProof?: string;
  approvedBy?: string;
  approvedAt?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

// Audit log types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

// Dashboard stats
export interface DashboardStats {
  totalSaksi: number;
  totalTPS: number;
  totalCheckIns: number;
  totalVoteInputs: number;
  totalReports: number;
  pendingPayments: number;
  completedPayments: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
