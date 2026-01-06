"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: LucideIcon;
  onActionClick?: () => void;
}

export function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  actionIcon: ActionIcon,
  onActionClick,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-ops-primary">{title}</h1>
        <p className="mt-1 text-sm text-ops-secondary">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Button asChild className="ops-btn-primary h-9 gap-2 w-full sm:w-auto">
          <Link href={actionHref}>
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            {actionLabel}
          </Link>
        </Button>
      )}
      {actionLabel && onActionClick && !actionHref && (
        <Button onClick={onActionClick} className="ops-btn-primary h-9 gap-2">
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
