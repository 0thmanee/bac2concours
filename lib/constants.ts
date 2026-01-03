/**
 * Application-wide constants
 * Centralized constants for easy maintenance and scaling
 */

import {
  ExpenseStatus,
  StartupStatus,
  UserRole,
  UserStatus,
  UpdateFrequency,
  PaymentStatus,
} from "@prisma/client";

// ============================================================
// STATUS VALUES
// ============================================================

export const STARTUP_STATUS = {
  ACTIVE: "ACTIVE" as StartupStatus,
  INACTIVE: "INACTIVE" as StartupStatus,
} as const;

export const EXPENSE_STATUS = {
  PENDING: "PENDING" as ExpenseStatus,
  APPROVED: "APPROVED" as ExpenseStatus,
  REJECTED: "REJECTED" as ExpenseStatus,
} as const;

export const USER_ROLE = {
  ADMIN: "ADMIN" as UserRole,
  FOUNDER: "FOUNDER" as UserRole,
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

export const UPDATE_FREQUENCY = {
  WEEKLY: "WEEKLY" as UpdateFrequency,
  MONTHLY: "MONTHLY" as UpdateFrequency,
} as const;

// ============================================================
// FRONTEND ROUTES (re-export from routes.ts for convenience)
// ============================================================

export { ADMIN_ROUTES, FOUNDER_ROUTES, AUTH_ROUTES } from "@/lib/routes";

// ============================================================
// API ROUTES
// ============================================================

export const API_ROUTES = {
  STARTUPS: "/api/startups",
  STARTUPS_ME: "/api/startups/me",
  STARTUP: (id: string) => `/api/startups/${id}`,
  STARTUP_BUDGETS: (id: string) => `/api/startups/${id}/budgets`,
  STARTUP_BUDGETS_METRICS: (id: string) =>
    `/api/startups/${id}/budgets/metrics`,
  BUDGETS: "/api/budgets",
  BUDGET: (id: string) => `/api/budgets/${id}`,
  EXPENSES: "/api/expenses",
  EXPENSE: (id: string) => `/api/expenses/${id}`,
  EXPENSE_APPROVE: (id: string) => `/api/expenses/${id}/approve`,
  EXPENSE_REJECT: (id: string) => `/api/expenses/${id}/reject`,
  EXPENSES_METRICS: "/api/expenses/metrics",
  PROGRESS: "/api/progress",
  PROGRESS_ME: "/api/progress/me",
  USERS: "/api/users",
  USER: (id: string) => `/api/users/${id}`,
  USERS_METRICS: "/api/users/metrics",
  CATEGORIES: "/api/categories",
  CATEGORY: (id: string) => `/api/categories/${id}`,
  CATEGORIES_METRICS: "/api/categories/metrics",
  SETTINGS: "/api/settings",
  STARTUPS_METRICS: "/api/startups/metrics",
  REPORTS_BUDGET: "/api/reports/budget",
  REPORTS_EXPENSES: "/api/reports/expenses",
  REPORTS_ACTIVITY: "/api/reports/activity",
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
} as const;

// ============================================================
// QUERY KEYS
// ============================================================

export const QUERY_KEYS = {
  STARTUPS: {
    ALL: ["startups"] as const,
    LISTS: () => [...QUERY_KEYS.STARTUPS.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.STARTUPS.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.STARTUPS.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.STARTUPS.DETAILS(), id] as const,
    BUDGETS: (id: string) =>
      [...QUERY_KEYS.STARTUPS.DETAIL(id), "budgets"] as const,
    METRICS: () => [...QUERY_KEYS.STARTUPS.ALL, "metrics"] as const,
  },
  BUDGETS: {
    ALL: ["budgets"] as const,
    BY_STARTUP: (startupId: string) =>
      [...QUERY_KEYS.BUDGETS.ALL, "startup", startupId] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.BUDGETS.ALL, id] as const,
  },
  EXPENSES: {
    ALL: ["expenses"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.EXPENSES.ALL, "list", filters] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.EXPENSES.ALL, id] as const,
    METRICS: () => [...QUERY_KEYS.EXPENSES.ALL, "metrics"] as const,
  },
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
  PROGRESS: {
    ALL: ["progress"] as const,
    BY_STARTUP: (startupId: string) =>
      [...QUERY_KEYS.PROGRESS.ALL, "startup", startupId] as const,
    ME: () => [...QUERY_KEYS.PROGRESS.ALL, "me"] as const,
  },
  REPORTS: {
    ALL: ["reports"] as const,
    BUDGET: (params?: { startupId?: string }) =>
      [...QUERY_KEYS.REPORTS.ALL, "budget", params] as const,
    EXPENSES: (params?: {
      startupId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }) => [...QUERY_KEYS.REPORTS.ALL, "expenses", params] as const,
    ACTIVITY: (params?: {
      startupId?: string;
      startDate?: string;
      endDate?: string;
    }) => [...QUERY_KEYS.REPORTS.ALL, "activity", params] as const,
  },
  SETTINGS: {
    ALL: ["settings"] as const,
    DETAIL: () => [...QUERY_KEYS.SETTINGS.ALL, "detail"] as const,
  },
  CATEGORIES: {
    ALL: ["categories"] as const,
    LISTS: () => [...QUERY_KEYS.CATEGORIES.ALL, "list"] as const,
    LIST: (filters?: Record<string, unknown>) =>
      [...QUERY_KEYS.CATEGORIES.LISTS(), filters] as const,
    DETAILS: () => [...QUERY_KEYS.CATEGORIES.ALL, "detail"] as const,
    DETAIL: (id: string) => [...QUERY_KEYS.CATEGORIES.DETAILS(), id] as const,
    ACTIVE: () => [...QUERY_KEYS.CATEGORIES.ALL, "active"] as const,
    METRICS: () => [...QUERY_KEYS.CATEGORIES.ALL, "metrics"] as const,
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
  PAYMENTS: {
    ALL: ["payments"] as const,
    STATUS: () => [...QUERY_KEYS.PAYMENTS.ALL, "status"] as const,
    PENDING: () => [...QUERY_KEYS.PAYMENTS.ALL, "pending"] as const,
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
  RECENT_EXPENSES_LIMIT: 10,
  RECENT_ITEMS_LIMIT: 5,
  REPORT_EXPENSES_LIMIT: 50, // Limit for expense queries in reports
  REPORT_TIMELINE_LIMIT: 100, // Limit for timeline items in activity reports

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
  UPDATE_FREQUENCY: UPDATE_FREQUENCY.MONTHLY,
  AUTO_APPROVE_EXPENSES: false,
} as const;

// ============================================================
// VALIDATION CONSTANTS
// ============================================================

export const VALIDATION = {
  STARTUP: {
    NAME_MIN_LENGTH: 2,
    BUDGET_MIN: 0,
  },
  BUDGET: {
    MIN: 0,
    STEP: 100,
  },
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
    STARTUP_CREATED: "Startup créé avec succès",
    STARTUP_UPDATED: "Startup mis à jour avec succès",
    STARTUP_DELETED: "Startup supprimé avec succès",
    BUDGET_CREATED: "Catégorie de budget créée avec succès",
    BUDGET_DELETED: "Catégorie de budget supprimée avec succès",
    EXPENSE_CREATED: "Dépense créée avec succès",
    EXPENSE_UPDATED: "Dépense mise à jour avec succès",
    EXPENSE_APPROVED: "Dépense approuvée avec succès",
    EXPENSE_REJECTED: "Dépense rejetée avec succès",
    USER_CREATED: "Utilisateur créé avec succès",
    USER_UPDATED: "Utilisateur mis à jour avec succès",
    USER_DELETED: "Utilisateur supprimé avec succès",
    CATEGORY_CREATED: "Catégorie créée avec succès",
    CATEGORY_UPDATED: "Catégorie mise à jour avec succès",
    CATEGORY_DELETED: "Catégorie supprimée avec succès",
    PAYMENT_UPLOADED: "Preuve de paiement envoyée avec succès",
    PAYMENT_APPROVED: "Paiement approuvé avec succès",
    PAYMENT_REJECTED: "Paiement rejeté",
    BOOK_CREATED: "Livre créé avec succès",
    BOOK_UPDATED: "Livre mis à jour avec succès",
    BOOK_DELETED: "Livre supprimé avec succès",
  },
  ERROR: {
    STARTUP_NOT_FOUND: "Startup non trouvé",
    BUDGET_NOT_FOUND: "Catégorie de budget non trouvée",
    BUDGET_HAS_EXPENSES:
      "Impossible de supprimer une catégorie avec des dépenses existantes",
    BUDGET_EXCEEDS_STARTUP: (categoryTotal: number, startupBudget: number) =>
      `Le total des catégories (${categoryTotal}) dépasserait le budget du startup (${startupBudget})`,
    EXPENSE_NOT_FOUND: "Dépense non trouvée",
    EXPENSE_CANNOT_EDIT: (status: string) =>
      `Impossible de modifier les dépenses ${status.toLowerCase()}`,
    PROGRESS_NOT_FOUND: "Mise à jour de progression non trouvée",
    EXPENSE_ALREADY_PROCESSED: (status: string) =>
      `La dépense est déjà ${status.toLowerCase()}`,
    EXPENSE_INVALID_CATEGORY: "Catégorie invalide pour ce startup",
    EXPENSE_EXCEEDS_BUDGET: (available: number) =>
      `La dépense dépasserait le budget de la catégorie. Disponible: ${available.toLocaleString(
        "fr-FR",
        { style: "currency", currency: "MAD" }
      )}`,
    EXPENSE_APPROVAL_EXCEEDS_BUDGET: (available: number) =>
      `L'approbation dépasserait le budget de la catégorie. Disponible: ${available.toLocaleString(
        "fr-FR",
        { style: "currency", currency: "MAD" }
      )}`,
    EXPENSE_REJECTION_REASON_REQUIRED:
      "Veuillez fournir une raison de rejet (minimum 5 caractères)",
    UNAUTHORIZED: "Non autorisé - Veuillez vous connecter",
    FORBIDDEN: "Accès interdit - Accès administrateur requis",
    ACCOUNT_INACTIVE: "Compte inactif. Veuillez contacter un administrateur.",
    EMAIL_NOT_VERIFIED_API:
      "Email non vérifié. Veuillez vérifier votre email avant d'accéder à la plateforme.",
    EMAIL_ALREADY_EXISTS: "Cet email existe déjà",
    USER_NOT_FOUND: "Utilisateur non trouvé",
    USER_HAS_STARTUPS:
      "Impossible de supprimer un utilisateur avec des startups assignés",
    CATEGORY_NOT_FOUND: "Catégorie non trouvée",
    CATEGORY_NAME_EXISTS: "Une catégorie avec ce nom existe déjà",
    CATEGORY_HAS_EXPENSES:
      "Impossible de supprimer une catégorie avec des dépenses existantes",
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
    STARTUPS: "Chargement des startups...",
    STARTUP: "Chargement des détails du startup...",
    BUDGETS: "Chargement des budgets...",
    EXPENSES: "Chargement des dépenses...",
    USERS: "Chargement des utilisateurs...",
    USER: "Chargement des détails de l'utilisateur...",
    CATEGORIES: "Chargement des catégories...",
    CATEGORY: "Chargement des détails de la catégorie...",
    PAYMENT: "Chargement du statut de paiement...",
  },
} as const;
