'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.validation'
import { useLogin, useResendVerification } from '@/lib/hooks/use-auth'
import { useSuperForm } from '@/lib/hooks/use-form'
import { AlertCircle, Mail, Eye, EyeOff } from 'lucide-react'
import { AUTH_ROUTES } from '@/lib/routes'

export default function LoginPage() {
  const loginMutation = useLogin()
  const resendVerificationMutation = useResendVerification()
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useSuperForm<LoginInput>({
    schema: loginSchema,
    onSubmit: async (data) => {
      try {
        await loginMutation.mutateAsync(data)
        setUnverifiedEmail(null) // Clear any previous unverified state
      } catch (error) {
        if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
          // Extract email from error or use form data
          const email = (error as Error & { email?: string }).email || data.email;
          setUnverifiedEmail(email)
          // Don't show generic error message for unverified email
          return;
        }
        throw error
      }
    },
    successMessage: '', // Let the redirect happen without toast
    errorMessage: 'Invalid email or password',
  })

  const { register, formState: { errors }, handleFormSubmit, isSubmitting } = form

  const handleResendVerification = () => {
    if (unverifiedEmail) {
      resendVerificationMutation.mutate(unverifiedEmail)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <span className="inline-block px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary font-medium text-sm mb-4">
          Espace Membre
        </span>
        <h2 className="text-2xl font-semibold mb-1 text-foreground">
          Bienvenue
        </h2>
        <p className="text-sm text-muted-foreground">
          Veuillez entrer votre email et mot de passe pour vous connecter
        </p>
      </div>

      {/* Email Verification Alert */}
      {unverifiedEmail && (
        <div className="ops-status-warning rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">
                Email Verification Required
              </p>
              <p className="text-sm">
                Check your inbox for the verification link to activate your account.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={resendVerificationMutation.isPending}
                className="ops-btn-secondary mt-2"
              >
                <Mail className="mr-2 h-4 w-4" />
                {resendVerificationMutation.isPending ? 'Sending...' : 'Resend Link'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link 
              href={AUTH_ROUTES.FORGOT_PASSWORD} 
              className="text-xs font-medium hover:underline text-action-primary"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
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
        </div>

        <Button 
          type="submit" 
          className="ops-btn-primary w-full h-10" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Divider */}
        <div className="ops-divider my-6"></div>

        {/* Sign Up Link */}
        <div className="text-center text-sm text-ops-secondary">
          Don&apos;t have an account?{' '}
          <Link 
            href={AUTH_ROUTES.REGISTER} 
            className="font-medium hover:underline text-action-primary"
          >
            Create an account
          </Link>
        </div>
      </form>
    </div>
  )
}
