"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/lib/hooks/use-auth";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth.validation";
import { AUTH_ROUTES } from "@/lib/routes";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-ops-primary">
            Invalid Link
          </h2>
          <p className="text-sm text-ops-secondary">
            This password reset link is invalid or has expired
          </p>
        </div>

        <div className="ops-status-error rounded-lg p-4">
          <p className="text-sm font-medium mb-2">Link Not Valid</p>
          <p className="text-sm">
            The reset link may have expired or been used already. Please request a new one.
          </p>
        </div>

        <div className="ops-divider"></div>

        <div className="text-center">
          <Button
            asChild
            className="ops-btn-primary h-10"
          >
            <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>
              Request New Link
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) return;
    resetPassword({
      token,
      password: data.password,
    });
  };

  // Show success state after password reset
  if (isSuccess) {
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
            Password Reset Successful
          </h2>
          <p className="text-sm text-ops-secondary">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            asChild
            className="ops-btn-primary w-full h-10"
          >
            <Link href={AUTH_ROUTES.LOGIN}>
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1 text-ops-primary">
          Reset Password
        </h2>
        <p className="text-sm text-ops-secondary">
          Create a new secure password for your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="ops-input h-10 pr-10"
              {...register("password")}
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
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="ops-input h-10 pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ops-tertiary"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="ops-btn-primary w-full h-10"
        >
          {isPending ? 'Resetting Password...' : 'Reset Password'}
        </Button>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-ops-primary">
            Reset Password
          </h2>
          <p className="text-sm text-ops-secondary">
            Loading...
          </p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
