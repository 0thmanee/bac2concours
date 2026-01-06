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
  USERS: "/admin/users",
  USER: (id: string) => `/admin/users/${id}`,
  BOOKS: "/admin/books",
  BOOK: (id: string) => `/admin/books/${id}`,
  BOOK_NEW: "/admin/books/new",
  BOOK_EDIT: (id: string) => `/admin/books/${id}/edit`,
  VIDEOS: "/admin/videos",
  VIDEO: (id: string) => `/admin/videos/${id}`,
  VIDEO_NEW: "/admin/videos/new",
  VIDEO_EDIT: (id: string) => `/admin/videos/${id}/edit`,
  SCHOOLS: "/admin/schools",
  SCHOOL: (id: string) => `/admin/schools/${id}`,
  SCHOOL_NEW: "/admin/schools/new",
  SCHOOL_EDIT: (id: string) => `/admin/schools/${id}/edit`,
  QCM: "/admin/qcm",
  QCM_VIEW: (id: string) => `/admin/qcm/${id}`,
  QCM_NEW: "/admin/qcm/new",
  QCM_EDIT: (id: string) => `/admin/qcm/${id}/edit`,
  SETTINGS: "/admin/settings",
  PROFILE: "/admin/profile",
} as const;

export const STUDENT_ROUTES = {
  DASHBOARD: "/student",
  PENDING: "/student/pending",
  PAYMENT: "/student/payment",
  PAYMENT_REJECTED: "/student/payment-rejected",
  BOOKS: "/student/books",
  BOOK: (id: string) => `/student/books/${id}`,
  VIDEOS: "/student/videos",
  VIDEO: (id: string) => `/student/videos/${id}`,
  SCHOOLS: "/student/schools",
  SCHOOL: (id: string) => `/student/schools/${id}`,
  QUIZ: "/student/qcm",
  QUIZ_HISTORY: "/student/qcm/history",
  QUIZ_ATTEMPT: (id: string) => `/student/qcm/history/${id}`,
  PROFILE: "/student/profile",
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
export const PROTECTED_ROUTES = ["/admin", "/student"];

// Role-based route patterns
export const ADMIN_ROUTE_PATTERN = /^\/admin/;
export const STUDENT_ROUTE_PATTERN = /^\/student/;

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
 * Check if a route requires student role
 */
export function isStudentRoute(pathname: string): boolean {
  return STUDENT_ROUTE_PATTERN.test(pathname);
}

/**
 * Get the default dashboard route for a user role
 */
export function getDefaultDashboard(
  role: "ADMIN" | "STUDENT" | import("@prisma/client").UserRole
): string {
  return role === "ADMIN" ? ADMIN_ROUTES.DASHBOARD : STUDENT_ROUTES.DASHBOARD;
}
