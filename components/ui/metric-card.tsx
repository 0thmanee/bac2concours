import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricColor = "blue" | "orange" | "cyan" | "rose" | "mint" | "purple" | "yellow" | "teal";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: MetricColor;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

const colorStyles: Record<MetricColor, { bg: string; iconBg: string; icon: string; text: string }> = {
  blue: {
    bg: "bg-[rgb(var(--metric-blue-light))]",
    iconBg: "bg-[rgb(var(--metric-blue-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-blue-dark))]",
  },
  orange: {
    bg: "bg-[rgb(var(--metric-orange-light))]",
    iconBg: "bg-[rgb(var(--metric-orange-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-orange-dark))]",
  },
  cyan: {
    bg: "bg-[rgb(var(--metric-cyan-light))]",
    iconBg: "bg-[rgb(var(--metric-cyan-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-cyan-dark))]",
  },
  rose: {
    bg: "bg-[rgb(var(--metric-rose-light))]",
    iconBg: "bg-[rgb(var(--metric-rose-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-rose-dark))]",
  },
  mint: {
    bg: "bg-[rgb(var(--metric-mint-light))]",
    iconBg: "bg-[rgb(var(--metric-mint-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-mint-dark))]",
  },
  purple: {
    bg: "bg-[rgb(var(--metric-purple-light))]",
    iconBg: "bg-[rgb(var(--metric-purple-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-purple-dark))]",
  },
  yellow: {
    bg: "bg-[rgb(var(--metric-yellow-light))]",
    iconBg: "bg-[rgb(var(--metric-yellow-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-yellow-dark))]",
  },
  teal: {
    bg: "bg-[rgb(var(--metric-teal-light))]",
    iconBg: "bg-[rgb(var(--metric-teal-main))]",
    icon: "text-white",
    text: "text-[rgb(var(--metric-teal-dark))]",
  },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
  className,
}: MetricCardProps) {
  const styles = colorStyles[color];

  return (
    <Card className={cn("border border-border bg-card transition-all", className)}>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Icon */}
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", styles.iconBg)}>
            <Icon className={cn("w-6 h-6", styles.icon)} />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className={cn("text-3xl font-bold text-foreground")}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <p className={cn("text-xs font-medium flex items-center gap-1", trend.isPositive ? "text-[rgb(var(--success-dark))] dark:text-[rgb(var(--success))]" : "text-[rgb(var(--error-dark))] dark:text-[rgb(var(--error))]")}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                {trend.value}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

