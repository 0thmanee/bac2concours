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
    <Card className="ops-card border border-ops">
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
                    ? "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                    : "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]"
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
