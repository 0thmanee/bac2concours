"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminFormCard } from "./admin-form-card";

interface AdminFormActionsProps {
  /** Submit button text */
  submitLabel: string;
  /** Loading state submit button text */
  loadingLabel: string;
  /** Cancel link href */
  cancelHref: string;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Whether mutation is pending */
  isPending?: boolean;
}

/**
 * Reusable actions card for admin form sidebars.
 * Contains submit and cancel buttons with consistent styling.
 */
export function AdminFormActions({
  submitLabel,
  loadingLabel,
  cancelHref,
  isSubmitting,
  isPending = false,
}: AdminFormActionsProps) {
  const isLoading = isSubmitting || isPending;

  return (
    <AdminFormCard title="Actions" compact>
      <Button
        type="submit"
        disabled={isLoading}
        className="ops-btn-primary w-full h-9"
      >
        {isLoading ? loadingLabel : submitLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        asChild
        className="ops-btn-secondary w-full h-9"
      >
        <Link href={cancelHref}>Annuler</Link>
      </Button>
    </AdminFormCard>
  );
}
