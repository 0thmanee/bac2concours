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

const colorStyles: Record<MetricColor, { iconBg: string; icon: string; accentColor: string }> = {
  blue: {
    iconBg: "bg-metric-blue-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-blue",
  },
  orange: {
    iconBg: "bg-metric-orange-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-orange",
  },
  cyan: {
    iconBg: "bg-metric-cyan-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-cyan",
  },
  rose: {
    iconBg: "bg-metric-rose-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-rose",
  },
  mint: {
    iconBg: "bg-metric-mint-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-mint",
  },
  purple: {
    iconBg: "bg-metric-purple-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-purple",
  },
  yellow: {
    iconBg: "bg-metric-yellow-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-yellow",
  },
  teal: {
    iconBg: "bg-metric-teal-main",
    icon: "text-foreground-reverse",
    accentColor: "text-metric-teal",
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
    <Card className={cn("border border-border bg-card transition-all hover:border-border/80", className)}>
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
            <p className={cn("text-3xl font-bold", styles.accentColor)}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <p className={cn("text-xs font-medium flex items-center gap-1", trend.isPositive ? "text-success-dark dark:text-success" : "text-error-dark dark:text-error")}>
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

