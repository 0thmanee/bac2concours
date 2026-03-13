"use client";

interface StudentCategoryBadgeProps {
  category: string;
  /** Kept for API compatibility; all tags use the same style. */
  variant?: "brand" | "purple" | "border";
}

/** Tags: primary platform color for border and text, no background. */
const tagClass =
  "inline-flex items-center max-w-full px-2.5 py-1 rounded-lg text-xs font-semibold wrap-break-word bg-transparent border border-brand-500 text-brand-700 dark:border-brand-400 dark:text-brand-400";

export function StudentCategoryBadge({
  category,
  variant: _variant,
}: StudentCategoryBadgeProps) {
  return <span className={tagClass}>{category}</span>;
}
