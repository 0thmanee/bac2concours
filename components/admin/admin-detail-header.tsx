"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AdminDetailHeaderProps {
  /** Back link text */
  backLabel: string;
  /** Back link href */
  backHref: string;
  /** Page title */
  title: string;
  /** Status badge or other badges to show after title */
  badges?: ReactNode;
  /** Subtitle/author text with optional icon */
  subtitle?: ReactNode;
  /** Description text shown below title */
  description?: string;
  /** Action buttons shown on the right side */
  actions?: ReactNode;
}

/**
 * Reusable header component for admin detail pages.
 * Includes back button, title with badges, subtitle, description, and action buttons.
 */
export function AdminDetailHeader({
  backLabel,
  backHref,
  title,
  badges,
  subtitle,
  description,
  actions,
}: AdminDetailHeaderProps) {
  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-ops-secondary">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-ops-primary">{title}</h1>
            {badges}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm text-ops-secondary flex items-center gap-2">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="mt-3 text-sm text-ops-tertiary">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
