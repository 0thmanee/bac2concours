/**
 * Route definitions and role-based access control
 */

export const ROOT_ROUTES = {
  HOME: "/",
  NOT_FOUND: "/not-found",
  FORBIDDEN: "/forbidden",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  STARTUPS: "/admin/startups",
  STARTUP: (id: string) => `/admin/startups/${id}`,
  STARTUP_NEW: "/admin/startups/new",
  STARTUP_EDIT: (id: string) => `/admin/startups/${id}/edit`,
  STARTUP_BUDGETS: (id: string) => `/admin/startups/${id}/budgets`,
  BUDGETS: "/admin/budgets",
  EXPENSES: "/admin/expenses",
  USERS: "/admin/users",
  USER: (id: string) => `/admin/users/${id}`,
  CATEGORIES: "/admin/categories",
  CATEGORY: (id: string) => `/admin/categories/${id}`,
  BOOKS: "/admin/books",
  BOOK: (id: string) => `/admin/books/${id}`,
  BOOK_NEW: "/admin/books/new",
  BOOK_EDIT: (id: string) => `/admin/books/${id}/edit`,
  SETTINGS: "/admin/settings",
  REPORTS: "/admin/reports",
  PROFILE: "/admin/profile",
} as const;

export const FOUNDER_ROUTES = {
  DASHBOARD: "/founder",
  PENDING: "/founder/pending",
  PAYMENT: "/founder/payment",
  PAYMENT_REJECTED: "/founder/payment-rejected",
  EXPENSES: "/founder/expenses",
  EXPENSE_NEW: "/founder/expenses/new",
  PROGRESS: "/founder/progress",
  PROGRESS_NEW: "/founder/progress/new",
  BOOKS: "/founder/books",
  PROFILE: "/founder/profile",
} as const;

export const PUBLIC_ROUTES = [
  ROOT_ROUTES.HOME,
  ROOT_ROUTES.NOT_FOUND,
  ROOT_ROUTES.FORBIDDEN,
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.VERIFY_EMAIL,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  "/contact", // Contact page is public
  "/api-docs", // API documentation is public
] as const;

export type PublicRoute = (typeof PUBLIC_ROUTES)[number];

// Routes that require authentication but no specific role
export const PROTECTED_ROUTES = ["/admin", "/founder"];

// Role-based route patterns
export const ADMIN_ROUTE_PATTERN = /^\/admin/;
export const FOUNDER_ROUTE_PATTERN = /^\/founder/;

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return (PUBLIC_ROUTES as readonly string[]).some(
    (route) => pathname === route || pathname.startsWith(route)
  );
}

/**
 * Check if a route requires admin role
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PATTERN.test(pathname);
}

/**
 * Check if a route requires founder role
 */
export function isFounderRoute(pathname: string): boolean {
  return FOUNDER_ROUTE_PATTERN.test(pathname);
}

/**
 * Get the default dashboard route for a user role
 */
export function getDefaultDashboard(
  role: "ADMIN" | "FOUNDER" | import("@prisma/client").UserRole
): string {
  return role === "ADMIN" ? ADMIN_ROUTES.DASHBOARD : FOUNDER_ROUTES.DASHBOARD;
}
