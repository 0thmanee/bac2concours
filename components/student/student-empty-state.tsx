"use client";

import { LucideIcon } from "lucide-react";

interface StudentEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function StudentEmptyState({
  icon: Icon,
  title,
  description,
}: StudentEmptyStateProps) {
  return (
    <div className="ops-card border border-border text-center py-16 sm:py-20">
      <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}
