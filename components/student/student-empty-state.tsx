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
      <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        {description}
      </p>
    </div>
  );
}
