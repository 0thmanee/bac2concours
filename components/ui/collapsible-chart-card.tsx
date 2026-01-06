"use client";

import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
}

export function CollapsibleChartCard({
  title,
  description,
  children,
  defaultCollapsed = false,
  className,
  contentClassName,
}: CollapsibleChartCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={cn("ops-card border border-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-ops-primary">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-sm text-ops-secondary">
              {description}
            </CardDescription>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 text-ops-tertiary hover:text-ops-primary"
          aria-label={isCollapsed ? "Expand chart" : "Collapse chart"}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className={cn("pb-6", contentClassName)}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}

