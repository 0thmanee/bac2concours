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
  ACTIVE: "bg-success-light text-success-dark hover:bg-success-light",
  INACTIVE: "bg-neutral-100 text-neutral-600 hover:bg-neutral-100",
  PROCESSING: "bg-warning-light text-warning-dark hover:bg-warning-light",
  // Payment statuses
  PENDING: "bg-warning-light text-warning-dark hover:bg-warning-light",
  APPROVED: "bg-success-light text-success-dark hover:bg-success-light",
  REJECTED: "bg-error-light text-error-dark hover:bg-error-light",
  NOT_SUBMITTED: "bg-neutral-100 text-neutral-600 hover:bg-neutral-100",
};

function getStatusBadgeClasses(status: string): string {
  return statusClasses[status.toUpperCase()] || "bg-neutral-100 text-neutral-600 hover:bg-neutral-100";
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

