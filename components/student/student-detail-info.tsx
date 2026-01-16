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
              <span
                className={
                  item.badgeVariant === "outline"
                    ? "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                    : "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                }
              >
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
