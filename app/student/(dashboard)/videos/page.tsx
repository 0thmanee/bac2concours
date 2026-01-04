"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Play, Eye, Video as VideoIcon, Clock } from "lucide-react";
import { useVideos } from "@/lib/hooks/use-videos";
import type {
  VideoFilters,
  VideoUIFilters,
  VideoWithRelations,
} from "@/lib/validations/video.validation";
import {
  videoUIFiltersSchema,
  getYouTubeThumbnailUrl,
} from "@/lib/validations/video.validation";
import { VideoStatus } from "@prisma/client";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { STUDENT_ROUTES } from "@/lib/routes";
import {
  StudentPageHeader,
  StudentEmptyState,
  StudentMediaCard,
} from "@/components/student";

const DEFAULT_FILTERS = videoUIFiltersSchema.parse({});
const ALL_CATEGORIES = "Toutes";
const ALL_LEVELS = "Tous";

export default function StudentVideosPage() {
  const router = useRouter();
  const [uiFilters, setUIFilters] = useState<VideoUIFilters>(DEFAULT_FILTERS);

  // Convert UI filters to API filters
  const apiFilters: Partial<VideoFilters> = useMemo(
    () => ({
      search: uiFilters.search || undefined,
      category:
        uiFilters.category && uiFilters.category !== ALL_CATEGORIES
          ? uiFilters.category
          : undefined,
      level:
        uiFilters.level && uiFilters.level !== ALL_LEVELS
          ? uiFilters.level
          : undefined,
      status: VideoStatus.ACTIVE,
      isPublic: true,
      page: 1,
      limit: 50,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [uiFilters]
  );

  const { data: videosData, isLoading } = useVideos(apiFilters);

  const videos = useMemo(
    () => (videosData?.data?.videos as VideoWithRelations[]) || [],
    [videosData]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    videos.forEach((video) => video.category && cats.add(video.category));
    return [ALL_CATEGORIES, ...Array.from(cats)];
  }, [videos]);

  const levels = useMemo(() => {
    const lvls = new Set<string>();
    videos.forEach((video) => video.level && lvls.add(video.level));
    return [ALL_LEVELS, ...Array.from(lvls)];
  }, [videos]);

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  if (isLoading) {
    return <LoadingState message="Chargement des vidéos..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <StudentPageHeader
        title="Bibliothèque de Vidéos"
        count={videos.length}
        countLabel="vidéos"
        countLabelSingular="vidéo"
      />

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={uiFilters.search}
            onChange={(value) =>
              setUIFilters((prev) => ({ ...prev, search: value }))
            }
            placeholder="Rechercher une vidéo..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={uiFilters.category || ALL_CATEGORIES}
            onChange={(value) =>
              setUIFilters((prev) => ({ ...prev, category: value }))
            }
            options={categories}
            placeholder="Catégorie"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={uiFilters.level || ALL_LEVELS}
            onChange={(value) =>
              setUIFilters((prev) => ({ ...prev, level: value }))
            }
            options={levels}
            placeholder="Niveau"
            className="w-full sm:w-45"
          />
        </div>
      </FilterPanel>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <StudentEmptyState
          icon={VideoIcon}
          title="Aucune vidéo trouvée"
          description="Essayez de modifier vos critères de recherche ou vos filtres."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {videos.map((video) => {
            const thumbnailUrl =
              video.thumbnailFile?.publicUrl ||
              (video.youtubeId ? getYouTubeThumbnailUrl(video.youtubeId) : null);
            const duration = formatDuration(video.duration);

            return (
              <StudentMediaCard
                key={video.id}
                onClick={() => router.push(STUDENT_ROUTES.VIDEO(video.id))}
                thumbnailUrl={thumbnailUrl}
                thumbnailAlt={video.title}
                thumbnailAspect="video"
                fallbackIcon={VideoIcon}
                badge={
                  duration ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-black/80 backdrop-blur-sm text-white shadow-sm">
                      <Clock size={12} className="mr-1" />
                      {duration}
                    </span>
                  ) : undefined
                }
                title={video.title}
                description={video.description}
                category={video.category}
                level={video.level}
                metrics={[{ icon: Eye, value: video.views || 0 }]}
                rating={video.rating}
                overlayContent={
                  thumbnailUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Play className="w-8 h-8 text-[rgb(var(--brand-600))] fill-current ml-1" />
                      </div>
                    </div>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
