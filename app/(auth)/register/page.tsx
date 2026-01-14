'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth.validation'
import { useRegister, useResendVerification } from '@/lib/hooks/use-auth'
import { useSuperForm } from '@/lib/hooks/use-form'
import { Mail, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { AUTH_ROUTES } from '@/lib/routes'

export default function RegisterPage() {
  const registerMutation = useRegister()
  const resendVerificationMutation = useResendVerification()
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useSuperForm<RegisterInput>({
    schema: registerSchema,
    onSubmit: async (data) => {
      const result = await registerMutation.mutateAsync(data)
      // Only show verification message if verification is required
      // First user (admin) will be auto-logged in and redirected
      if (result.response.requiresVerification !== false) {
        setRegisteredEmail(data.email) // Show verification message
      }
    },
    successMessage: '', // We'll show custom message
    errorMessage: 'Échec de la création du compte',
  })

  const { register, formState: { errors }, handleFormSubmit, isSubmitting } = form

  const handleResendVerification = () => {
    if (registeredEmail) {
      resendVerificationMutation.mutate(registeredEmail)
    }
  }

  // Show success message after registration
  if (registeredEmail) {
    return (
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full ops-status-success">
            <CheckCircle className="h-8 w-8" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-ops-primary">
            Vérifiez votre Email
          </h2>
          <p className="text-sm text-ops-secondary">
            Nous avons envoyé un lien de vérification à :
          </p>
          <p className="text-sm font-medium text-action-primary">
            {registeredEmail}
          </p>
        </div>

        {/* Instructions */}
        <div className="ops-status-info rounded-lg p-4 text-left">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Prochaines Étapes</p>
              <ul className="space-y-1.5 text-sm">
                <li>1. Vérifiez votre boîte de réception pour l&apos;email de vérification</li>
                <li>2. Cliquez sur le lien de vérification pour activer votre compte</li>
                <li>3. Revenez ici pour vous connecter une fois vérifié</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resend Button */}
        <div className="space-y-3">
          <p className="text-sm text-center text-ops-secondary">
            Vous n&apos;avez pas reçu l&apos;email ?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleResendVerification}
            disabled={resendVerificationMutation.isPending}
            className="w-full h-10"
          >
            <Mail className="h-4 w-4 mr-2 text-foreground" />
            {resendVerificationMutation.isPending ? 'Envoi...' : 'Renvoyer l\'email'}
          </Button>
        </div>

        {/* Back to Login */}
        <div className="ops-divider"></div>
        <div className="text-center">
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="text-sm font-medium hover:underline text-action-primary"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-1 text-foreground">
          Créer un Compte
        </h2>
        <p className="text-sm text-muted-foreground">
          Rejoignez la plateforme de préparation aux concours
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nom Complet
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Prénom Nom"
            {...register('name')}
            disabled={isSubmitting}
            className="ops-input h-10"
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Adresse Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nom@exemple.com"
            {...register('email')}
            disabled={isSubmitting}
            className="ops-input h-10"
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Mot de passe
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
              {...register('password')}
              disabled={isSubmitting}
              className="ops-input h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ops-tertiary"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.password.message}
            </p>
          )}
          <p className="text-xs text-ops-tertiary">
            Doit contenir au moins 8 caractères
          </p>
        </div>

        <Button
          type="submit"
          className="ops-btn-primary w-full h-10"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Création du compte...' : 'Créer un compte'}
        </Button>

        {/* Terms */}
        {/* <p className="text-xs text-center text-ops-tertiary">
          By creating an account, you agree to our{' '}
          <a href="#" className="hover:underline text-action-primary">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="hover:underline text-action-primary">
            Privacy Policy
          </a>
        </p> */}

        {/* Divider */}
        <div className="ops-divider my-6"></div>

        {/* Sign In Link */}
        <div className="text-center text-sm text-ops-secondary">
          Vous avez déjà un compte ?{' '}
          <Link
            href={AUTH_ROUTES.LOGIN}
            className="font-medium hover:underline text-action-primary"
          >
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  )
}
