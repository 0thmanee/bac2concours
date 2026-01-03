"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface FilterPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ children, className }) => {
  return (
    <Card
      className={cn(
        "p-5",
        "bg-white dark:bg-white/[0.03]",
        "border-gray-200 dark:border-gray-800",
        "transition-all duration-200",
        className
      )}
    >
      {children}
    </Card>
  );
};

interface FilterGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export const FilterGrid: React.FC<FilterGridProps> = ({ 
  children, 
  columns = 3,
  className 
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {children}
    </div>
  );
};
