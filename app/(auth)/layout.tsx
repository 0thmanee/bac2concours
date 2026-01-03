import { redirect } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { getDefaultDashboard } from '@/lib/routes'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Try to get session, but handle JWT errors gracefully (e.g., when AUTH_SECRET changes)
  let session = null
  try {
    session = await auth()
  } catch {
    // If JWT decryption fails, treat as no session (user will need to re-login)
    // Silently handle - user will be redirected to login
  }

  // Redirect authenticated users to their appropriate dashboard
  if (session?.user) {
    const dashboard = getDefaultDashboard(session.user.role);
    redirect(dashboard);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ops-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="2BAConcours"
              width={200}
              height={80}
              className="h-16 w-auto brightness-0 dark:brightness-0 dark:invert"
              priority
            />
          </div>
        </div>
        
        {/* Content Card */}
        <div className="ops-card p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ops-tertiary">
            Authentification sécurisée · Préparation aux concours
          </p>
        </div>
      </div>
    </div>
  )
}
