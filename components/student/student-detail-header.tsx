"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailMetric {
  icon: LucideIcon;
  value: ReactNode;
}

interface StudentDetailHeaderProps {
  backHref: string;
  title: string;
  metrics?: DetailMetric[];
  actions?: ReactNode;
}

export function StudentDetailHeader({
  backHref,
  title,
  metrics,
  actions,
}: StudentDetailHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="ops-btn-ghost h-8 w-8 p-0 shrink-0 mt-1"
      >
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-ops-primary">{title}</h1>
        {metrics && metrics.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ops-secondary">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <metric.icon className="h-4 w-4" />
                <span>{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
