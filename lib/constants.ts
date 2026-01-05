/**
 * Application-wide constants
 * Centralized constants for easy maintenance and scaling
 */

import { UserRole, UserStatus, PaymentStatus } from "@prisma/client";

// ============================================================
// STATUS VALUES
// ============================================================

export const USER_ROLE = {
  ADMIN: "ADMIN" as UserRole,
  STUDENT: "STUDENT" as UserRole,
} as const;

export const USER_STATUS = {
  ACTIVE: "ACTIVE" as UserStatus,
  INACTIVE: "INACTIVE" as UserStatus,
} as const;

export const PAYMENT_STATUS = {
  NOT_SUBMITTED: "NOT_SUBMITTED" as PaymentStatus,
  PENDING: "PENDING" as PaymentStatus,
  APPROVED: "APPROVED" as PaymentStatus,
  REJECTED: "REJECTED" as PaymentStatus,
} as const;

// ============================================================
// FRONTEND ROUTES (re-export from routes.ts for convenience)
// ============================================================

export { ADMIN_ROUTES, STUDENT_ROUTES, AUTH_ROUTES } from "@/lib/routes";

// ============================================================
// API ROUTES
// ============================================================

export const API_ROUTES = {
  USERS: "/api/users",
  USER: (id: string) => `/api/users/${id}`,
  USERS_METRICS: "/api/users/metrics",
  SETTINGS: "/api/settings",
  AUTH_SESSION: "/api/auth/session",
  AUTH_SIGNOUT: "/api/auth/signout",
  AUTH_CHECK_EMAIL_VERIFICATION: "/api/auth/check-email-verification",
  AUTH_REGISTER: "/api/auth/register",
  AUTH_VERIFY_EMAIL: "/api/auth/verify-email",
  AUTH_FORGOT_PASSWORD: "/api/auth/forgot-password",
  AUTH_RESET_PASSWORD: "/api/auth/reset-password",
  AUTH_RESEND_VERIFICATION: "/api/auth/resend-verification",
  PROFILE: "/api/profile",
  // Notifications
  NOTIFICATIONS: "/api/notifications",
  NOTIFICATION: (id: string) => `/api/notifications/${id}`,
  NOTIFICATIONS_UNREAD_COUNT: "/api/notifications/unread-count",
  NOTIFICATIONS_MARK_READ: "/api/notifications/mark-read",
  NOTIFICATIONS_PREFERENCES: "/api/notifications/preferences",
  // Payments
  PAYMENTS_UPLOAD: "/api/payments/upload",
  PAYMENTS_STATUS: "/api/payments/status",
  PAYMENTS_REVIEW: (userId: string) => `/api/payments/${userId}/review`,
  PAYMENTS_PENDING: "/api/payments/pending",
  // Books
  BOOKS: "/api/books",
  BOOK: (id: string) => `/api/books/${id}`,
  BOOK_COUNTER: (id: string) => `/api/books/${id}/counter`,
  BOOKS_STATS: "/api/books/stats",
  BOOKS_FILTERS: "/api/books/filters",
  // Videos
  VIDEOS: "/api/videos",
  VIDEO: (id: string) => `/api/videos/${id}`,
  VIDEO_VIEW: (id: string) => `/api/videos/${id}/view`,
  VIDEO_RELATED: (id: string) => `/api/videos/${id}/related`,
  VIDEOS_STATS: "/api/videos/stats",
  VIDEOS_FILTERS: "/api/videos/filter-options",
  // Schools
  SCHOOLS: "/api/schools",
  SCHOOL: (id: string) => `/api/schools/${id}`,
  SCHOOL_VIEW: (id: string) => `/api/schools/${id}/view`,
  SCHOOL_RELATED: (id: string) => `/api/schools/${id}/related`,
  SCHOOLS_STATS: "/api/schools/stats",
  SCHOOLS_FILTERS: "/api/schools/filters",
  // QCM - Questions
  QUESTIONS: "/api/questions",
  QUESTION: (id: string) => `/api/questions/${id}`,
  QUESTIONS_STATS: "/api/questions/stats",
  QUESTIONS_FILTERS: "/api/questions/filter-options",
  // QCM - Quiz
  QUIZ_START: "/api/quiz/start",
  QUIZ_SUBMIT: "/api/quiz/submit",
  QUIZ_HISTORY: "/api/quiz/history",
  QUIZ_ATTEMPT: (id: string) => `/api/quiz/${id}`,
  QUIZ_FILTERS: "/api/quiz/filter-options",
  QUIZ_MATIERES: (school: string) =>
    `/api/quiz/matieres?school=${encodeURIComponent(school)}`,
  QUIZ_COUNT: (school: string, matiere: string) =>
    `/api/quiz/count?school=${encodeURIComponent(
      school
    )}&matiere=${encodeURIComponent(matiere)}`,
  // Settings Resources
  CATEGORIES: "/api/settings/categories",
  CATEGORY: (id: string) => `/api/settings/categories/${id}`,
  CATEGORIES_ACTIVE: "/api/settings/categories/active",
  LEVELS: "/api/settings/levels",
  LEVEL: (id: string) => `/api/settings/levels/${id}`,
  LEVELS_ACTIVE: "/api/settings/levels/active",
  MATIERES: "/api/settings/matieres",
  MATIERE: (id: string) => `/api/settings/matieres/${id}`,
  MATIERES_ACTIVE: "/api/settings/matieres/active",
  DROPDOWN_OPTIONS: "/api/settings/dropdown-options",
} as const;

// ============================================================
// QUERY KEYS
// ============================================================

export const QUERY_KEYS = {
  USERS: {
    ALL: ["users"] as const,
    LISTS: () => [...QUERY_KEYS.USERS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.USERS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.USERS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.USERS.DETAILS(), id] as const,
    BY_ROLE: (role: UserRole) => [...QUERY_KEYS.USERS.ALL, role] as const,
    METRICS: () => [...QUERY_KEYS.USERS.ALL, "metrics"] as const,
  },
  SETTINGS: {
    ALL: ["settings"] as const,
    DETAIL: () => [...QUERY_KEYS.SETTINGS.ALL, "detail"] as const,
  },
  NOTIFICATIONS: {
    ALL: ["notifications"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.NOTIFICATIONS.ALL, "list", filters] as const,
    UNREAD_COUNT: () =>
      [...QUERY_KEYS.NOTIFICATIONS.ALL, "unread-count"] as const,
    PREFERENCES: () =>
      [...QUERY_KEYS.NOTIFICATIONS.ALL, "preferences"] as const,
  },
  BOOKS: {
    ALL: ["books"] as const,
    LISTS: () => [...QUERY_KEYS.BOOKS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.BOOKS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.BOOKS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.BOOKS.DETAILS(), id] as const,
    STATS: () => [...QUERY_KEYS.BOOKS.ALL, "stats"] as const,
    FILTERS: () => [...QUERY_KEYS.BOOKS.ALL, "filters"] as const,
  },
  VIDEOS: {
    ALL: ["videos"] as const,
    LISTS: () => [...QUERY_KEYS.VIDEOS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.VIDEOS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.VIDEOS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.VIDEOS.DETAILS(), id] as const,
    RELATED: (id: string) =>
      [...QUERY_KEYS.VIDEOS.DETAIL(id), "related"] as const,
    STATS: () => [...QUERY_KEYS.VIDEOS.ALL, "stats"] as const,
    FILTERS: () => [...QUERY_KEYS.VIDEOS.ALL, "filters"] as const,
  },
  SCHOOLS: {
    ALL: ["schools"] as const,
    LISTS: () => [...QUERY_KEYS.SCHOOLS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.SCHOOLS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.SCHOOLS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.SCHOOLS.DETAILS(), id] as const,
    STATS: () => [...QUERY_KEYS.SCHOOLS.ALL, "stats"] as const,
    FILTERS: () => [...QUERY_KEYS.SCHOOLS.ALL, "filters"] as const,
  },
  QUESTIONS: {
    ALL: ["questions"] as const,
    LISTS: () => [...QUERY_KEYS.QUESTIONS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.QUESTIONS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.QUESTIONS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.QUESTIONS.DETAILS(), id] as const,
    STATS: () => [...QUERY_KEYS.QUESTIONS.ALL, "stats"] as const,
    FILTERS: () => [...QUERY_KEYS.QUESTIONS.ALL, "filters"] as const,
  },
  QUIZ: {
    ALL: ["quiz"] as const,
    RANDOM: (school: string, matiere: string) =>
      [...QUERY_KEYS.QUIZ.ALL, "random", school, matiere] as const,
    HISTORY: () => [...QUERY_KEYS.QUIZ.ALL, "history"] as const,
    HISTORY_LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.QUIZ.HISTORY(), filters] as const,
    ATTEMPT: (id: string) => [...QUERY_KEYS.QUIZ.ALL, "attempt", id] as const,
    FILTERS: () => [...QUERY_KEYS.QUIZ.ALL, "filters"] as const,
    MATIERES: (school: string) =>
      [...QUERY_KEYS.QUIZ.ALL, "matieres", school] as const,
    COUNT: (school: string, matiere: string) =>
      [...QUERY_KEYS.QUIZ.ALL, "count", school, matiere] as const,
  },
  PAYMENTS: {
    ALL: ["payments"] as const,
    STATUS: () => [...QUERY_KEYS.PAYMENTS.ALL, "status"] as const,
    PENDING: () => [...QUERY_KEYS.PAYMENTS.ALL, "pending"] as const,
  },
  CATEGORIES: {
    ALL: ["categories"] as const,
    LISTS: () => [...QUERY_KEYS.CATEGORIES.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.CATEGORIES.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.CATEGORIES.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.CATEGORIES.DETAILS(), id] as const,
    ACTIVE: () => [...QUERY_KEYS.CATEGORIES.ALL, "active"] as const,
  },
  LEVELS: {
    ALL: ["levels"] as const,
    LISTS: () => [...QUERY_KEYS.LEVELS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.LEVELS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.LEVELS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.LEVELS.DETAILS(), id] as const,
    ACTIVE: () => [...QUERY_KEYS.LEVELS.ALL, "active"] as const,
  },
  MATIERES: {
    ALL: ["matieres"] as const,
    LISTS: () => [...QUERY_KEYS.MATIERES.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.MATIERES.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.MATIERES.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.MATIERES.DETAILS(), id] as const,
    ACTIVE: () => [...QUERY_KEYS.MATIERES.ALL, "active"] as const,
  },
  DROPDOWN_OPTIONS: {
    ALL: ["dropdown-options"] as const,
  },
} as const;

// ============================================================
// NUMERIC CONSTANTS
// ============================================================

export const NUMERIC_CONSTANTS = {
  // Currency formatting
  CURRENCY_DIVISOR: 1000, // For K conversion
  CURRENCY_STEP: 100, // Minimum currency increment

  // Percentages
  PERCENTAGE_MAX: 100,
  PERCENTAGE_DECIMALS: 1, // Decimal places for percentage display

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Lists
  RECENT_ITEMS_LIMIT: 5,

  // Progress bar
  PROGRESS_BAR_WIDTH: 20, // Tailwind width units (w-20)
} as const;

// ============================================================
// STORAGE KEYS
// ============================================================

export const STORAGE_KEYS = {
  REPORT_HISTORY: "incubationos_report_history",
} as const;

// ============================================================
// REACT QUERY CONFIG
// ============================================================

export const QUERY_CONFIG = {
  STALE_TIME: {
    SHORT: 30 * 1000, // 30 seconds
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 10 * 60 * 1000, // 10 minutes
  },
  CACHE_TIME: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 10 * 60 * 1000, // 10 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
  },
  RETRY: {
    DEFAULT: 3,
    NONE: 0,
  },
} as const;

// ============================================================
// TOKEN EXPIRY CONSTANTS
// ============================================================

export const TOKEN_EXPIRY = {
  VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
} as const;

// ============================================================
// SETTINGS CONSTANTS
// ============================================================

export const SETTINGS_DEFAULTS = {
  INCUBATOR_NAME: "2BAConcours",
} as const;

// ============================================================
// VALIDATION CONSTANTS
// ============================================================

export const VALIDATION = {
  PAYMENT: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
    REJECTION_REASON_MIN_LENGTH: 10,
  },
} as const;

// ============================================================
// DATE FORMATS
// ============================================================

export const DATE_FORMATS = {
  DISPLAY: "fr-FR", // Locale for date display
  INPUT: "YYYY-MM-DD", // ISO date format for inputs
} as const;

// ============================================================
// MESSAGES
// ============================================================

export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: "Utilisateur créé avec succès",
    USER_UPDATED: "Utilisateur mis à jour avec succès",
    USER_DELETED: "Utilisateur supprimé avec succès",
    PAYMENT_UPLOADED: "Preuve de paiement envoyée avec succès",
    PAYMENT_APPROVED: "Paiement approuvé avec succès",
    PAYMENT_REJECTED: "Paiement rejeté",
    BOOK_CREATED: "Livre créé avec succès",
    BOOK_UPDATED: "Livre mis à jour avec succès",
    BOOK_DELETED: "Livre supprimé avec succès",
  },
  ERROR: {
    UNAUTHORIZED: "Non autorisé - Veuillez vous connecter",
    FORBIDDEN: "Accès interdit - Accès administrateur requis",
    ACCOUNT_INACTIVE: "Compte inactif. Veuillez contacter un administrateur.",
    EMAIL_NOT_VERIFIED_API:
      "Email non vérifié. Veuillez vérifier votre email avant d'accéder à la plateforme.",
    EMAIL_ALREADY_EXISTS: "Cet email existe déjà",
    USER_NOT_FOUND: "Utilisateur non trouvé",
    GENERIC: "Une erreur s'est produite",
    NETWORK: "Erreur réseau - Veuillez vérifier votre connexion",
    PAYMENT_UPLOAD_FAILED: "Échec de l'envoi de la preuve de paiement",
    PAYMENT_FILE_TOO_LARGE: "Le fichier est trop volumineux (max 5 Mo)",
    PAYMENT_INVALID_FILE_TYPE:
      "Type de fichier non valide. Utilisez JPG, PNG, WebP ou PDF",
    PAYMENT_ALREADY_SUBMITTED: "Une preuve de paiement a déjà été soumise",
    PAYMENT_NOT_FOUND: "Preuve de paiement non trouvée",
    PAYMENT_REJECTION_REASON_REQUIRED:
      "Veuillez fournir une raison de rejet (minimum 10 caractères)",
  },
  LOADING: {
    USERS: "Chargement des utilisateurs...",
    USER: "Chargement des détails de l'utilisateur...",
    PAYMENT: "Chargement du statut de paiement...",
  },
} as const;
