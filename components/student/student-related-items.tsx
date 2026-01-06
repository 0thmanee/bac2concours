"use client";

import Link from "next/link";
import { LucideIcon, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SupabaseImage } from "@/components/ui/supabase-image";

interface RelatedItem {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  views?: number | null;
  duration?: string | null;
  extraInfo?: string;
}

interface StudentRelatedItemsProps {
  title: string;
  description?: string;
  items: RelatedItem[];
  getHref: (id: string) => string;
  fallbackIcon: LucideIcon;
  maxItems?: number;
  thumbnailAspect?: "video" | "book";
}

export function StudentRelatedItems({
  title,
  description,
  items,
  getHref,
  fallbackIcon: FallbackIcon,
  maxItems = 5,
  thumbnailAspect = "video",
}: StudentRelatedItemsProps) {
  if (items.length === 0) return null;

  const thumbnailClass = thumbnailAspect === "book" ? "w-12 h-16" : "w-24 h-16";

  return (
    <Card className="ops-card border border-border">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-ops-primary">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-ops-secondary">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, maxItems).map((item) => (
          <Link
            key={item.id}
            href={getHref(item.id)}
            className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className={`relative ${thumbnailClass} rounded overflow-hidden shrink-0`}>
              {item.thumbnailUrl ? (
                <SupabaseImage
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center">
                  <FallbackIcon className="h-6 w-6 text-brand-500/30" />
                </div>
              )}
              {item.duration && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-white text-xs">
                  {item.duration}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-ops-primary line-clamp-2 group-hover:text-brand-500 transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-ops-tertiary">
                {item.views !== undefined && item.views !== null && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {item.views}
                  </span>
                )}
                {item.extraInfo && <span>{item.extraInfo}</span>}
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
