/**
 * Reusable Error State Component
 * Consistent error display across the application
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function ErrorState({
  message = "An error occurred",
  backHref,
  backLabel = "Go back",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {backHref && (
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-ops-secondary">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Link>
        </Button>
      )}
      <Card className="ops-card border border-border">
        <CardContent className="p-6 text-center">
          <p className="text-ops-secondary">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

