"use client";

import { LucideIcon } from "lucide-react";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className="text-center py-8">
      <Icon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-lg font-medium text-foreground mb-1">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
