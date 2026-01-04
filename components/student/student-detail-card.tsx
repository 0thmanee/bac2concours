"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface StudentDetailCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function StudentDetailCard({
  title,
  description,
  children,
  className = "",
}: StudentDetailCardProps) {
  return (
    <Card className={`ops-card border border-ops ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-ops-primary">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-ops-secondary">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
