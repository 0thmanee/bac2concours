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
      "bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]",
    purple:
      "bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${variantClasses[variant]}`}
    >
      {category}
    </span>
  );
}
