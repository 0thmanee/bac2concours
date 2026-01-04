"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminFormCardProps {
  /** Card title */
  title: string;
  /** Card description (optional) */
  description?: string;
  /** Card content */
  children: ReactNode;
  /** Whether to use smaller title (for sidebar cards) */
  compact?: boolean;
}

/**
 * Reusable form card wrapper with consistent ops styling.
 * Used for form sections in new/edit pages.
 */
export function AdminFormCard({
  title,
  description,
  children,
  compact = false,
}: AdminFormCardProps) {
  return (
    <Card className="ops-card border border-ops">
      <CardHeader>
        <CardTitle className={compact 
          ? "text-base font-semibold text-ops-primary" 
          : "text-lg font-semibold text-ops-primary"
        }>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-ops-secondary">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}
