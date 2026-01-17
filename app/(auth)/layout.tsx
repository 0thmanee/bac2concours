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
    <section className="relative min-h-screen w-full overflow-hidden public-background flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto px-4 z-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="2BAConcours"
              width={200}
              height={80}
              className="h-16 w-auto invert dark:invert-0"
              priority
            />
          </div>
        </div>
        
        {/* Content Card */}
        <div className="glass-card rounded-2xl p-8 border border-ops-border">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Authentification sécurisée · Préparation aux concours
          </p>
        </div>
      </div>
    </section>
  )
}
