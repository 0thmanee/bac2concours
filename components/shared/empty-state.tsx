/**
 * Reusable Empty State Component
 * Consistent empty state display across the application
 */

interface EmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function EmptyState({
  title = "No items found",
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="text-sm text-ops-tertiary">{title}</p>
      {description && (
        <p className="text-xs text-ops-tertiary mt-1">{description}</p>
      )}
    </div>
  );
}

