"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AdminFormHeaderProps {
  /** Back link text */
  backLabel: string;
  /** Back link href */
  backHref: string;
  /** Page title */
  title: string;
  /** Description text shown below title */
  description?: string;
}

/**
 * Reusable header component for admin form pages (new/edit).
 * Includes back button, title, and description.
 */
export function AdminFormHeader({
  backLabel,
  backHref,
  title,
  description,
}: AdminFormHeaderProps) {
  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-ops-secondary">
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Link>
      </Button>
      <h1 className="text-2xl font-semibold text-ops-primary">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-ops-secondary">{description}</p>
      )}
    </div>
  );
}
