"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Play, Eye, Star, Video as VideoIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVideos } from "@/lib/hooks/use-videos";
import type { VideoFilters, VideoUIFilters, VideoWithRelations } from "@/lib/validations/video.validation";
import { videoUIFiltersSchema, getYouTubeThumbnailUrl } from "@/lib/validations/video.validation";
import { VideoStatus } from "@prisma/client";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { STUDENT_ROUTES } from "@/lib/routes";

const DEFAULT_FILTERS = videoUIFiltersSchema.parse({});

const ALL_CATEGORIES = "Toutes";
const ALL_LEVELS = "Tous";

export default function StudentVideosPage() {
  const router = useRouter();
  const [uiFilters, setUIFilters] = useState<VideoUIFilters>(DEFAULT_FILTERS);

  // Convert UI filters to API filters
  const apiFilters: Partial<VideoFilters> = useMemo(() => ({
    search: uiFilters.search || undefined,
    category: uiFilters.category && uiFilters.category !== ALL_CATEGORIES ? uiFilters.category : undefined,
    level: uiFilters.level && uiFilters.level !== ALL_LEVELS ? uiFilters.level : undefined,
    status: VideoStatus.ACTIVE,
    isPublic: true,
    page: 1,
    limit: 50,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  }), [uiFilters]);

  const { data: videosData, isLoading } = useVideos(apiFilters);

  const videos = useMemo(
    () => (videosData?.data?.videos as VideoWithRelations[]) || [],
    [videosData]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    videos.forEach(video => video.category && cats.add(video.category));
    return [ALL_CATEGORIES, ...Array.from(cats)];
  }, [videos]);

  const levels = useMemo(() => {
    const lvls = new Set<string>();
    videos.forEach(video => video.level && lvls.add(video.level));
    return [ALL_LEVELS, ...Array.from(lvls)];
  }, [videos]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          size={12}
          className={i < fullStars ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return <LoadingState message="Chargement des vidéos..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-[rgb(var(--brand-600))] to-[rgb(var(--brand-700))] bg-clip-text text-transparent mb-2">
            Bibliothèque de Vidéos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {videos.length} vidéo{videos.length !== 1 ? 's' : ''} disponible{videos.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={uiFilters.search}
            onChange={(value) => setUIFilters(prev => ({ ...prev, search: value }))}
            placeholder="Rechercher une vidéo..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={uiFilters.category || ALL_CATEGORIES}
            onChange={(value) => setUIFilters(prev => ({ ...prev, category: value }))}
            options={categories}
            placeholder="Catégorie"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={uiFilters.level || ALL_LEVELS}
            onChange={(value) => setUIFilters(prev => ({ ...prev, level: value }))}
            options={levels}
            placeholder="Niveau"
            className="w-full sm:w-45"
          />
        </div>
      </FilterPanel>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="ops-card border border-ops text-center py-16 sm:py-20">
          <VideoIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucune vidéo trouvée
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => router.push(STUDENT_ROUTES.VIDEO(video.id))}
              className="ops-card border border-ops group h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-[rgb(var(--brand-400))] dark:hover:border-[rgb(var(--brand-600))] cursor-pointer"
            >
              <div className="relative flex-1 flex flex-col p-4 sm:p-5">
                {/* Video Thumbnail */}
                <div className="aspect-video bg-linear-to-br from-[rgb(var(--brand-50))] via-[rgb(var(--brand-100))] to-[rgb(var(--brand-200))] dark:from-[rgb(var(--brand-950))]/40 dark:via-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:shadow-md transition-shadow duration-300">
                  {video.thumbnailFile?.publicUrl || (video.youtubeId && getYouTubeThumbnailUrl(video.youtubeId)) ? (
                    <>
                      <SupabaseImage
                        src={video.thumbnailFile?.publicUrl || (video.youtubeId ? getYouTubeThumbnailUrl(video.youtubeId) : '')}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Play className="w-8 h-8 text-[rgb(var(--brand-600))] fill-current ml-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-[rgb(var(--brand-500))]/10 blur-3xl" />
                      <VideoIcon className="relative w-16 h-16 sm:w-20 sm:h-20 text-[rgb(var(--brand-500))] dark:text-[rgb(var(--brand-400))]" />
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-black/80 backdrop-blur-sm text-white shadow-sm">
                        <Clock size={12} className="mr-1" />
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="line-clamp-2 mb-1.5 font-semibold text-gray-900 text-base sm:text-lg dark:text-white group-hover:text-[rgb(var(--brand-600))] dark:group-hover:text-[rgb(var(--brand-400))] transition-colors">
                        {video.title}
                      </h3>
                    </div>

                    {video.description && (
                      <p className="line-clamp-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {video.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {video.category && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]">
                            {video.category}
                          </span>
                        )}
                        {video.level && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            {video.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1.5">
                          <Eye size={13} className="text-gray-400" />
                          <span className="font-medium">{video.views}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-3 mt-auto pt-3">
                    {video.rating && video.rating > 0 && (
                      <div className="flex items-center gap-2 pb-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars(video.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {video.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
