import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ChartCard({
  title,
  description,
  children,
  action,
  className,
  contentClassName,
}: ChartCardProps) {
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
        {action}
      </CardHeader>
      <CardContent className={cn("pb-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

