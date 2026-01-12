"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Smartphone, Monitor } from "lucide-react"

export function MobileAlert() {
  const isMobile = useIsMobile()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render on server or if not mobile
  if (!isClient || !isMobile) {
    return null
  }

  return (
    <div className="fixed inset-0 z-9999 bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Smartphone className="h-24 w-24 text-brand-600" strokeWidth={1.5} />
            <div className="absolute -bottom-2 -right-2 bg-destructive rounded-full p-2">
              <Monitor className="h-6 w-6 text-destructive-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            Version Mobile
          </h1>
          <p className="text-xl text-white/70">
            En cours de développement
          </p>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-base text-white/70 leading-relaxed">
            La version mobile de <span className="font-semibold text-brand-600">2BAConcours</span> est actuellement en développement.
          </p>
          <p className="text-base text-white/70 leading-relaxed">
            Pour accéder à la plateforme, veuillez utiliser un ordinateur de bureau ou augmenter la taille de votre fenêtre.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
          <p className="text-sm text-brand-800 dark:text-brand-200">
            <span className="font-semibold">Bientôt disponible :</span> Une expérience mobile optimisée arrive prochainement !
          </p>
        </div>
      </div>
    </div>
  )
}
