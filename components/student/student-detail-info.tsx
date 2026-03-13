"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailInfoItem {
  label: string;
  value: ReactNode;
  isBadge?: boolean;
  badgeVariant?: "brand" | "outline";
}

interface StudentDetailInfoProps {
  title: string;
  items: DetailInfoItem[];
}

export function StudentDetailInfo({ title, items }: StudentDetailInfoProps) {
  return (
    <Card className="ops-card border border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-ops-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <p className="text-xs font-medium text-ops-tertiary">{item.label}</p>
            {item.isBadge ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-transparent border border-brand-500 text-brand-700 dark:border-brand-400 dark:text-brand-400">
                {item.value}
              </span>
            ) : (
              <p className="text-sm text-ops-primary">{item.value}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
