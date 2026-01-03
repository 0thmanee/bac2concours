/**
 * Reusable Loading State Component
 * Consistent loading indicators across the application
 */

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ 
  message = "Loading...", 
  className = "" 
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <p className="text-ops-secondary">{message}</p>
    </div>
  );
}

