/**
 * Reusable Status Badge Component
 * Consistent status display across the application
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusClasses: Record<string, string> = {
  // Common statuses
  ACTIVE: "bg-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] hover:bg-[rgb(var(--success-light))]",
  INACTIVE: "bg-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--neutral-100))]",
  PROCESSING: "bg-[rgb(var(--warning-light))] text-[rgb(var(--warning-dark))] hover:bg-[rgb(var(--warning-light))]",
  // Payment statuses
  PENDING: "bg-[rgb(var(--warning-light))] text-[rgb(var(--warning-dark))] hover:bg-[rgb(var(--warning-light))]",
  APPROVED: "bg-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] hover:bg-[rgb(var(--success-light))]",
  REJECTED: "bg-[rgb(var(--error-light))] text-[rgb(var(--error-dark))] hover:bg-[rgb(var(--error-light))]",
  NOT_SUBMITTED: "bg-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--neutral-100))]",
};

function getStatusBadgeClasses(status: string): string {
  return statusClasses[status.toUpperCase()] || "bg-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] hover:bg-[rgb(var(--neutral-100))]";
}

function formatStatus(status: string): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <Badge className={cn(getStatusBadgeClasses(status), className)}>
      {formatStatus(status)}
    </Badge>
  );
}

