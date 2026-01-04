"use client";

import { ReactNode } from "react";

interface StudentPageHeaderProps {
  title: string;
  count: number;
  countLabel: string;
  countLabelSingular?: string;
  actions?: ReactNode;
}

export function StudentPageHeader({
  title,
  count,
  countLabel,
  countLabelSingular,
  actions,
}: StudentPageHeaderProps) {
  const label = count === 1 && countLabelSingular ? countLabelSingular : countLabel;
  
  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-[rgb(var(--brand-600))] to-[rgb(var(--brand-700))] bg-clip-text text-transparent mb-2">
          {title}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {count} {label} disponible{count !== 1 ? "s" : ""}
        </p>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
