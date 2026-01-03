/**
 * Reusable Status Badge Component
 * Consistent status display across the application
 */

import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClasses, formatStatus } from "@/lib/utils/startup.utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <Badge className={`${getStatusBadgeClasses(status)} ${className}`}>
      {formatStatus(status)}
    </Badge>
  );
}

