/**
 * Coming Soon Component
 * Professional placeholder for features under development
 */

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-ops">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-action-primary" />}
          <div>
            <h1 className="text-2xl font-semibold text-ops-primary">
              {title}
            </h1>
            <p className="mt-1 text-sm text-ops-secondary">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="ops-card">
        <CardContent className="p-12 text-center">
          <div className="ops-status-info inline-flex px-4 py-2 rounded-lg mb-4">
            <span className="text-sm font-medium uppercase tracking-wide">
              In Development
            </span>
          </div>
          <p className="text-sm max-w-md mx-auto text-ops-secondary">
            This module is currently under development. Check back soon for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
