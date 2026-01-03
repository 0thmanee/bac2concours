"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useVerifyEmail } from "@/lib/hooks/use-auth";
import { AUTH_ROUTES } from "@/lib/routes";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const { mutate: verifyEmail, isPending, isSuccess, isError, error } = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push(AUTH_ROUTES.LOGIN);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  if (!token) {
    return (
      <div className="space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full ops-status-error">
            <XCircle className="h-8 w-8" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-ops-primary">
            Invalid Link
          </h2>
          <p className="text-sm text-ops-secondary">
            No verification token provided
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            asChild
            className="ops-btn-primary w-full h-10"
          >
            <Link href={AUTH_ROUTES.REGISTER}>
              Create New Account
            </Link>
          </Button>
          <div className="text-center">
            <Link 
              href={AUTH_ROUTES.LOGIN} 
              className="text-sm font-medium hover:underline text-action-primary"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isPending && (
        <>
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-ops">
              <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-ops-primary">
              Verifying your email...
            </h2>
            <p className="text-sm text-ops-secondary">
              Please wait while we verify your email address.
            </p>
          </div>
        </>
      )}

      {/* Success State */}
      {isSuccess && (
        <>
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full ops-status-success">
              <CheckCircle className="h-8 w-8" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-ops-primary">
              Email Verified!
            </h2>
            <p className="text-sm text-ops-secondary">
              Your email has been verified successfully.
            </p>
            <p className="text-xs mt-2 text-ops-tertiary">
              Redirecting to login page...
            </p>
          </div>
          <div className="text-center">
            <Link 
              href={AUTH_ROUTES.LOGIN}
              className="text-sm font-medium hover:underline text-action-primary"
            >
              Click here if you&apos;re not redirected
            </Link>
          </div>
        </>
      )}

      {/* Error State */}
      {isError && (
        <>
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full ops-status-error">
              <XCircle className="h-8 w-8" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-ops-primary">
              Verification Failed
            </h2>
            <p className="text-sm text-ops-secondary">
              {error instanceof Error ? error.message : "Failed to verify email. The link may have expired."}
            </p>
          </div>

          {/* Info Box */}
          <div className="ops-status-info rounded-lg p-4">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium">What to do next</p>
                <ul className="space-y-1.5 text-sm">
                  <li>• Request a new verification link</li>
                  <li>• Check your email spam folder</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              asChild
              className="ops-btn-primary w-full h-10"
            >
              <Link href={AUTH_ROUTES.REGISTER}>
                Create New Account
              </Link>
            </Button>
            <div className="text-center">
            <Link 
              href={AUTH_ROUTES.LOGIN}
              className="text-sm font-medium hover:underline text-action-primary"
            >
              Back to Login
            </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 border border-ops">
            <Loader2 className="h-8 w-8 animate-spin text-action-primary" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-ops-primary">
            Verifying your email...
          </h2>
          <p className="text-sm text-ops-secondary">
            Please wait...
          </p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
