import { ReactNode } from "react";
import { PageLoader } from "./page-loader";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DataStateProps<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | undefined;
  loadingText?: string;
  emptyState?: ReactNode;
  errorTitle?: string;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
}

export function DataState<T>({
  isLoading,
  error,
  data,
  loadingText = "Loading...",
  emptyState,
  errorTitle = "Error loading data",
  onRetry,
  children,
}: DataStateProps<T>) {
  // Loading state
  if (isLoading) {
    return <PageLoader text={loadingText} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorTitle}</AlertTitle>
          <AlertDescription className="mt-2">
            {error.message}
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-4"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0)) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    return null;
  }

  // Success state - render children with data
  return <>{children(data)}</>;
}
