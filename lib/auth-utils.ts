import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserRole, UserStatus } from '@prisma/client'
import { USER_STATUS } from '@/lib/constants'
import { AUTH_ROUTES, getDefaultDashboard } from '@/lib/routes'

/**
 * Get the current authenticated user session
 * Redirects to login if not authenticated or inactive
 */
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user) {
    redirect(AUTH_ROUTES.LOGIN)
  }
  
  // Redirect inactive users to login (defense in depth)
  if (session.user.status === USER_STATUS.INACTIVE) {
    redirect(`${AUTH_ROUTES.LOGIN}?error=account_inactive`)
  }
  
  // Redirect unverified users to login (defense in depth)
  if (!session.user.emailVerified) {
    redirect(`${AUTH_ROUTES.LOGIN}?error=email_not_verified`)
  }
  
  return session.user
}

/**
 * Check if user has admin role
 */
export async function requireAdmin() {
  const user = await getCurrentUser()
  
  if (user.role !== UserRole.ADMIN) {
    redirect(getDefaultDashboard(user.role))
  }
  
  return user
}

/**
 * Check if user has founder role
 */
export async function requireFounder() {
  const user = await getCurrentUser()
  
  if (user.role !== UserRole.FOUNDER) {
    redirect(getDefaultDashboard(user.role))
  }
  
  return user
}

/**
 * Get optional user session (doesn't redirect)
 */
export async function getOptionalUser() {
  const session = await auth()
  return session?.user || null
}
