"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Play, Eye, Video as VideoIcon, Clock } from "lucide-react";
import { useVideos, useVideoFilterOptions } from "@/lib/hooks/use-videos";
import { formatDuration, toApiParam } from "@/lib/utils/filter.utils";
import type { VideoUIFilters, VideoWithRelations } from "@/lib/validations/video.validation";
import { getYouTubeThumbnailUrl } from "@/lib/validations/video.validation";
import { VideoStatus } from "@prisma/client";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { TablePagination } from "@/components/ui/data-table";
import { STUDENT_ROUTES } from "@/lib/routes";
import {
  StudentPageHeader,
  StudentEmptyState,
  StudentMediaCard,
} from "@/components/student";

// Default filter values
const DEFAULT_FILTERS: VideoUIFilters = {
  search: "",
  category: "",
  level: "",
};

export default function StudentVideosPage() {
  const router = useRouter();
  
  // Filter state using proper types
  const [filters, setFilters] = useState<VideoUIFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // API calls with proper params
  const { data: videosData, isLoading } = useVideos({
    search: toApiParam(filters.search),
    category: toApiParam(filters.category),
    level: toApiParam(filters.level),
    status: VideoStatus.ACTIVE,
    isPublic: true,
    page: currentPage,
    limit: pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: filtersData } = useVideoFilterOptions();

  // Extract data from response
  const videos = (videosData?.data?.videos as VideoWithRelations[]) || [];
  const paginationData = videosData?.data;
  const filterOptions = filtersData?.data || {
    categories: [],
    schools: [],
    levels: [],
    subjects: [],
  };

  // Filter change handler - resets pagination
  const updateFilter = useCallback(<K extends keyof VideoUIFilters>(key: K, value: VideoUIFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  if (isLoading) {
    return <LoadingState message="Chargement des vidéos..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <StudentPageHeader
        title="Bibliothèque de Vidéos"
        count={paginationData?.total || videos.length}
        countLabel="vidéos"
        countLabelSingular="vidéo"
      />

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            placeholder="Rechercher une vidéo..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={filters.category || "all"}
            onChange={(value) => updateFilter("category", value === "all" ? "" : value)}
            options={["Toutes", ...filterOptions.categories]}
            placeholder="Catégorie"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={filters.level || "all"}
            onChange={(value) => updateFilter("level", value === "all" ? "" : value)}
            options={["Tous", ...filterOptions.levels]}
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

      {/* Pagination */}
      {paginationData && paginationData.totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          totalItems={paginationData.total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
