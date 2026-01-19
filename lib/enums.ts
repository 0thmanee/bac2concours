/**
 * Shared enums for client and server components
 * These mirror the Prisma schema enums but can be safely imported in client components
 */

// User & Authentication
export const UserRole = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const PaymentStatus = {
  NOT_SUBMITTED: "NOT_SUBMITTED",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Books
export const BookStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PROCESSING: "PROCESSING",
} as const;
export type BookStatus = (typeof BookStatus)[keyof typeof BookStatus];

// Files
export const FileType = {
  IMAGE: "IMAGE",
  DOCUMENT: "DOCUMENT",
  PAYMENT_PROOF: "PAYMENT_PROOF",
  OTHER: "OTHER",
} as const;
export type FileType = (typeof FileType)[keyof typeof FileType];

// Videos
export const VideoStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PROCESSING: "PROCESSING",
} as const;
export type VideoStatus = (typeof VideoStatus)[keyof typeof VideoStatus];

// Schools
export const SchoolStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DRAFT: "DRAFT",
} as const;
export type SchoolStatus = (typeof SchoolStatus)[keyof typeof SchoolStatus];

export const SchoolType = {
  UNIVERSITE: "UNIVERSITE",
  ECOLE_INGENIEUR: "ECOLE_INGENIEUR",
  ECOLE_COMMERCE: "ECOLE_COMMERCE",
  INSTITUT: "INSTITUT",
  FACULTE: "FACULTE",
} as const;
export type SchoolType = (typeof SchoolType)[keyof typeof SchoolType];

// Questions / QCM
export const QuestionDifficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
export type QuestionDifficulty =
  (typeof QuestionDifficulty)[keyof typeof QuestionDifficulty];

export const QuestionStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DRAFT: "DRAFT",
} as const;
export type QuestionStatus =
  (typeof QuestionStatus)[keyof typeof QuestionStatus];

// Notifications
export const NotificationType = {
  // User Management
  USER_ACTIVATED: "USER_ACTIVATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
  USER_DELETED: "USER_DELETED",
  NEW_USER_REGISTERED: "NEW_USER_REGISTERED",
  EMAIL_VERIFIED: "EMAIL_VERIFIED",
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  
  // System
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
  
  // Payment
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAYMENT_RESUBMITTED: "PAYMENT_RESUBMITTED",
  PAYMENT_APPROVED: "PAYMENT_APPROVED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  PAYMENT_CONFIRMATION: "PAYMENT_CONFIRMATION",
  
  // Resources
  NEW_RESOURCE: "NEW_RESOURCE",
  RESOURCE_UPDATED: "RESOURCE_UPDATED",
  RESOURCE_DELETED: "RESOURCE_DELETED",
  
  // Quiz
  QUIZ_COMPLETED: "QUIZ_COMPLETED",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationChannel = {
  IN_APP: "IN_APP",
  EMAIL: "EMAIL",
  BOTH: "BOTH",
} as const;
export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

// ============================================================
// INTERFACES (for client components that can't import @prisma/client)
// ============================================================

export interface QuizAttempt {
  id: string;
  school: string;
  matiere: string;
  totalQuestions: number;
  score: number;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  timeSpent: number | null;
  completedAt: Date | string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Level {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Matiere {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
