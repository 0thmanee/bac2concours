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
  ACTIVE: "bg-green-100 text-green-700 hover:bg-green-100",
  INACTIVE: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  PROCESSING: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  // Payment statuses
  PENDING: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  APPROVED: "bg-green-100 text-green-700 hover:bg-green-100",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-100",
  NOT_SUBMITTED: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

function getStatusBadgeClasses(status: string): string {
  return statusClasses[status.toUpperCase()] || "bg-gray-100 text-gray-700 hover:bg-gray-100";
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

