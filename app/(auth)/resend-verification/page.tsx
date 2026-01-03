"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResendVerification } from "@/lib/hooks/use-auth";
import {
  resendVerificationSchema,
  type ResendVerificationInput,
} from "@/lib/validations/auth.validation";
import { AUTH_ROUTES } from "@/lib/routes";

export default function ResendVerificationPage() {
  const { mutate: resendVerification, isPending, isSuccess } = useResendVerification();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
  });

  const onSubmit = (data: ResendVerificationInput) => {
    resendVerification(data.email);
  };

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
            Verification Email Sent
          </h2>
          <p className="text-sm text-ops-secondary">
            We&apos;ve sent a new verification link to your email address.
          </p>
        </div>

        {/* Instructions */}
        <div className="ops-status-info rounded-lg p-4 text-left">
          <div className="flex gap-3">
            <Mail className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Next Steps</p>
              <ul className="space-y-1.5 text-sm">
                <li>1. Check your inbox for the verification email</li>
                <li>2. Click the verification link to activate your account</li>
                <li>3. Return here to sign in once verified</li>
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
    <div className="space-y-5">\n      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold mb-1 text-ops-primary">\n          Resend Verification Email\n        </h2>\n        <p className="text-sm text-ops-secondary">
          Enter your email to receive a new verification link
        </p>
      </div>

      {/* Info Box */}
      <div className="ops-status-info rounded-lg p-4">
        <div className="flex gap-3">
          <Mail className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Why resend?</p>
            <p className="text-sm">
              If you didn&apos;t receive the verification email, check your spam folder or request a new one.
            </p>
          </div>
        </div>
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
            disabled={isPending}
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
          {isPending ? 'Sending...' : 'Send Verification Email'}
        </Button>

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

