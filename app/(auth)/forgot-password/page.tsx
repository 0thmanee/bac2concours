"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth.validation";
import { AUTH_ROUTES } from "@/lib/routes";

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPassword(data.email);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full ops-status-success">
            <Mail className="h-8 w-8" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Vérifiez votre Email
          </h2>
          <p className="text-sm text-muted-foreground">
            Nous avons envoyé les instructions de réinitialisation à votre email.
          </p>
        </div>

        {/* Instructions */}
        <div className="ops-status-info rounded-lg p-4 text-left">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Next Steps</p>
              <ul className="space-y-1.5 text-sm">
                <li>1. Check your inbox for the password reset email</li>
                <li>2. Click the reset link (valid for 1 hour)</li>
                <li>3. Create a new password and sign in</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="ops-divider"></div>
        <div className="text-center">
          <Link 
            href={AUTH_ROUTES.LOGIN} 
            className="text-sm font-medium hover:underline text-action-primary"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <span className="inline-block px-4 py-1 bg-purple-900/30 border border-purple-600/30 rounded-full text-purple-300 font-medium text-sm mb-4">
          Mot de Passe Oublié
        </span>
        <h2 className="text-2xl font-semibold mb-1 text-foreground">
          Réinitialiser le Mot de Passe
        </h2>
        <p className="text-sm text-muted-foreground">
          Entrez votre email pour recevoir les instructions
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            className="ops-input h-10"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.email.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="ops-btn-primary w-full h-10"
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Info Box */}
        <div className="ops-status-info rounded-lg p-3">
          <p className="text-xs text-center">
            The reset link will be valid for 1 hour. Check your spam folder if you don&apos;t receive an email.
          </p>
        </div>

        {/* Back to Login */}
        <div className="ops-divider"></div>
        <div className="text-center">
          <Link 
            href={AUTH_ROUTES.LOGIN} 
            className="text-sm font-medium hover:underline text-action-primary"
          >
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
