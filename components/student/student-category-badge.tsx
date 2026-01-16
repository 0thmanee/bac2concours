"use client";

interface StudentCategoryBadgeProps {
  category: string;
  variant?: "brand" | "purple";
}

export function StudentCategoryBadge({
  category,
  variant = "brand",
}: StudentCategoryBadgeProps) {
  const variantClasses = {
    brand:
      "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-brand-400 border border-brand-200 dark:border-brand-800",
    purple:
      "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-brand-400 border border-brand-200 dark:border-brand-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${variantClasses[variant]}`}
    >
      {category}
    </span>
  );
}
