"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { StudentCategoryBadge } from "./student-category-badge";

interface MediaCardMetric {
  icon: LucideIcon;
  value: number | string;
}

interface StudentMediaCardProps {
  onClick: () => void;
  thumbnailUrl?: string | null;
  thumbnailAlt: string;
  thumbnailAspect?: "video" | "book";
  fallbackIcon: LucideIcon;
  badge?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  metrics?: MediaCardMetric[];
  actions?: ReactNode;
  overlayContent?: ReactNode;
}

export function StudentMediaCard({
  onClick,
  thumbnailUrl,
  thumbnailAlt,
  thumbnailAspect = "video",
  fallbackIcon: FallbackIcon,
  badge,
  title,
  subtitle,
  description,
  category,
  level,
  metrics,
  actions,
  overlayContent,
}: StudentMediaCardProps) {
  const aspectClass = thumbnailAspect === "book" ? "aspect-3/4" : "aspect-video";

  return (
    <div
      onClick={onClick}
      className="ops-card border border-border group h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-brand-400 dark:hover:border-brand-600 cursor-pointer"
    >
      <div className="relative flex-1 flex flex-col p-4 sm:p-5 border border-border rounded-lg">
        {/* Thumbnail */}
        <div
          className={`${aspectClass} bg-linear-to-br from-[rgb(var(--brand-50))] via-[rgb(var(--brand-100))] to-[rgb(var(--brand-200))] dark:from-[rgb(var(--brand-950))]/40 dark:via-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:shadow-md transition-shadow duration-300`}
        >
          {thumbnailUrl ? (
            <>
              <SupabaseImage
                src={thumbnailUrl}
                alt={thumbnailAlt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              {overlayContent}
            </>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-brand-500/10 blur-3xl" />
              <FallbackIcon className="relative w-16 h-16 sm:w-20 sm:h-20 text-brand-500 dark:text-brand-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Main content */}
          <div className="space-y-3">
            <div>
              <h3 className="line-clamp-2 mb-1.5 font-semibold text-foreground text-base sm:text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {title}
              </h3>
              {subtitle && (
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>

            {description && (
              <p className="line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {/* Category badges */}
            {(category || level) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {category && <StudentCategoryBadge category={category} variant="brand" />}
                {level && <StudentCategoryBadge category={level} variant="purple" />}
              </div>
            )}
          </div>

          {/* Footer metrics - pushed to bottom */}
          {metrics && metrics.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 mt-auto border-t border-border">
              {metrics.map((metric, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  <metric.icon size={13} className="text-muted-foreground" />
                  <span className="font-medium">{metric.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
