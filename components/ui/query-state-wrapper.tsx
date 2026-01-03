import { ReactNode } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { PageLoader } from "./page-loader";
import { EmptyState } from "./empty-state";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { AlertCircle, LucideIcon } from "lucide-react";

interface QueryStateWrapperProps<T> {
  query: UseQueryResult<T, Error>;
  loadingComponent?: ReactNode;
  loadingText?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: ReactNode;
  showEmptyState?: boolean;
  onRetry?: () => void;
  children: (data: T) => ReactNode;
}

/**
 * A reusable wrapper for React Query that handles loading, error, and empty states
 * 
 * @example
 * ```tsx
 * const startupsQuery = useStartups();
 * 
 * return (
 *   <QueryStateWrapper
 *     query={startupsQuery}
 *     loadingText="Loading startups..."
 *     emptyTitle="No startups found"
 *     emptyDescription="Get started by creating your first startup"
 *     emptyIcon={Building2}
 *     emptyAction={<Button>Add Startup</Button>}
 *   >
 *     {(startups) => (
 *       <Table>
 *         {startups.map(startup => ...)}
 *       </Table>
 *     )}
 *   </QueryStateWrapper>
 * )
 * ```
 */
export function QueryStateWrapper<T>({
  query,
  loadingComponent,
  loadingText = "Loading...",
  errorTitle = "Error loading data",
  emptyTitle = "No data found",
  emptyDescription,
  emptyIcon,
  emptyAction,
  showEmptyState = true,
  onRetry,
  children,
}: QueryStateWrapperProps<T>) {
  const { data, isLoading, error, refetch } = query;

  // Loading state
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <PageLoader text={loadingText} />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-100 items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{errorTitle}</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <p>{error.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onRetry) {
                  onRetry();
                } else {
                  refetch();
                }
              }}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (
    showEmptyState &&
    (!data || (Array.isArray(data) && data.length === 0))
  ) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  // Success state - render children with data
  if (!data) {
    return null;
  }

  return <>{children(data)}</>;
}
