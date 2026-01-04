"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
              <Badge
                variant={item.badgeVariant === "outline" ? "outline" : "secondary"}
                className={
                  item.badgeVariant === "outline"
                    ? "border-ops-border text-ops-secondary"
                    : "bg-linear-to-r from-brand-400/10 to-brand-600/10 text-brand-700 dark:text-brand-300 border-brand-500/20"
                }
              >
                {item.value}
              </Badge>
            ) : (
              <p className="text-sm text-ops-primary">{item.value}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
