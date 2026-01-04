"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminFormCard } from "./admin-form-card";

interface StatusOption {
  value: string;
  label: string;
}

interface AdminStatusVisibilityProps {
  /** Current status value */
  status: string;
  /** Handler for status change */
  onStatusChange: (value: string) => void;
  /** Status options */
  statusOptions: StatusOption[];
  /** Current isPublic value */
  isPublic: boolean;
  /** Handler for isPublic change */
  onIsPublicChange: (value: boolean) => void;
  /** Custom label for public toggle (default: "Public") */
  publicLabel?: string;
  /** Custom description for public toggle */
  publicDescription?: string;
}

/**
 * Reusable status and visibility card for admin form sidebars.
 * Contains status select and public checkbox with consistent styling.
 */
export function AdminStatusVisibility({
  status,
  onStatusChange,
  statusOptions,
  isPublic,
  onIsPublicChange,
  publicLabel = "Public",
  publicDescription = "Visible par tous les utilisateurs",
}: AdminStatusVisibilityProps) {
  return (
    <AdminFormCard title="Statut & Visibilité" compact>
      <div className="space-y-2">
        <Label htmlFor="status" className="text-sm font-medium">
          Statut
        </Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger id="status" className="ops-input h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="ops-card">
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="isPublic" className="text-sm font-medium">
            {publicLabel}
          </Label>
          <p className="text-xs text-ops-tertiary">{publicDescription}</p>
        </div>
        <input
          id="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => onIsPublicChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
        />
      </div>
    </AdminFormCard>
  );
}
