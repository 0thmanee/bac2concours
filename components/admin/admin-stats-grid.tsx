"use client";

import { MetricCard } from "@/components/ui/metric-card";
import { LucideIcon } from "lucide-react";

type MetricColor = "blue" | "orange" | "cyan" | "rose" | "mint" | "purple" | "yellow" | "teal";

export interface AdminStatItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: MetricColor;
  subtitle?: string;
}

interface AdminStatsGridProps {
  stats: AdminStatItem[];
  columns?: 3 | 4 | 5;
}

export function AdminStatsGrid({ stats, columns = 3 }: AdminStatsGridProps) {
  const gridCols = {
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {stats.map((stat, index) => (
        <MetricCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          subtitle={stat.subtitle}
        />
      ))}
    </div>
  );
}
