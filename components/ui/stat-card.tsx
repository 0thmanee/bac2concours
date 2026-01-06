import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string;
    label: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("ops-card border border-border", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-ops-secondary">
              {title}
            </p>
            <p className="text-3xl font-bold text-ops-primary">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-ops-tertiary">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-2 pt-1">
                <span className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  trend.isPositive ? "text-[rgb(var(--success))]" : "text-[rgb(var(--error))]"
                )}>
                  <span>{trend.isPositive ? "↑" : "↓"}</span>
                  {trend.value}
                </span>
                <span className="text-xs text-ops-tertiary">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-lg shrink-0 bg-[rgb(var(--neutral-100))]"
          >
            <Icon 
              className="h-6 w-6 text-action-primary"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

