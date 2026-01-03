/**
 * Security utilities for validating sessions and authorization
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";
import { AUTH_ROUTES, ROOT_ROUTES } from "@/lib/routes";
import { USER_STATUS } from "@/lib/constants";

export interface ValidatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: Date | null;
}

/**
 * Get and validate current session
 * Validates against database to ensure user hasn't been deactivated or changed
 * This prevents JWT token replay attacks after user status changes
 */
export async function getValidatedSession(): Promise<ValidatedUser | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Check database to ensure user state hasn't changed since JWT was issued
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      emailVerified: true,
    },
  });

  // User was deleted or not found - invalidate session
  if (!dbUser) {
    return null;
  }

  // Return validated user with current database state
  return dbUser;
}

/**
 * Require authenticated session or redirect to login
 * Validates user is active and email is verified
 */
export async function requireAuth(): Promise<ValidatedUser> {
  const user = await getValidatedSession();

  if (!user) {
    redirect(AUTH_ROUTES.LOGIN);
  }

  // Enforce email verification (defense in depth)
  if (!user.emailVerified) {
    redirect(`${AUTH_ROUTES.LOGIN}?error=email_not_verified`);
  }

  // Enforce active status (defense in depth)
  if (user.status === USER_STATUS.INACTIVE) {
    // Founders with inactive status need to go through payment/approval flow
    // Admins should never be inactive
    if (user.role === UserRole.ADMIN) {
      redirect(`${AUTH_ROUTES.LOGIN}?error=account_inactive`);
    }
    // For founders, let layouts handle redirect to payment/pending
  }

  return user;
}

/**
 * Require admin role or redirect
 */
export async function requireAdmin(): Promise<ValidatedUser> {
  const user = await requireAuth();

  if (user.role !== UserRole.ADMIN) {
    redirect(ROOT_ROUTES.FORBIDDEN);
  }

  // Admins must be active
  if (user.status !== USER_STATUS.ACTIVE) {
    redirect(`${AUTH_ROUTES.LOGIN}?error=account_inactive`);
  }

  return user;
}

/**
 * Require founder role or redirect
 */
export async function requireFounder(): Promise<ValidatedUser> {
  const user = await requireAuth();

  if (user.role !== UserRole.FOUNDER) {
    redirect(ROOT_ROUTES.FORBIDDEN);
  }

  return user;
}

/**
 * Validate API request has valid session
 * Returns user or null (doesn't redirect - for API use)
 */
export async function validateApiSession(): Promise<ValidatedUser | null> {
  return getValidatedSession();
}

/**
 * Validate API request requires admin role
 * Returns user or throws error with HTTP status (for API use)
 */
export async function requireApiAdmin(): Promise<ValidatedUser> {
  const user = await validateApiSession();

  if (!user) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  if (user.role !== UserRole.ADMIN) {
    throw new ApiAuthError("Forbidden", 403);
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    throw new ApiAuthError("Account inactive", 403);
  }

  return user;
}

/**
 * Validate API request requires founder role
 * Returns user or throws error with HTTP status (for API use)
 */
export async function requireApiFounder(): Promise<ValidatedUser> {
  const user = await validateApiSession();

  if (!user) {
    throw new ApiAuthError("Unauthorized", 401);
  }

  if (user.role !== UserRole.FOUNDER) {
    throw new ApiAuthError("Forbidden", 403);
  }

  if (!user.emailVerified) {
    throw new ApiAuthError("Email not verified", 403);
  }

  return user;
}

/**
 * Custom error for API authentication failures
 */
export class ApiAuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiAuthError";
  }
}
