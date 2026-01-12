"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Eye, Star, Calendar, Clock, Play, Video as VideoIcon } from "lucide-react";
import { formatDuration } from "@/lib/utils/filter.utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { LoadingState } from "@/components/shared/loading-state";

import { STUDENT_ROUTES } from "@/lib/routes";
import {
  useVideo,
  useRelatedVideos,
  useIncrementVideoViews,
} from "@/lib/hooks/use-videos";
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
} from "@/lib/validations/video.validation";
import type { VideoWithRelations } from "@/lib/validations/video.validation";
import {
  StudentDetailHeader,
  StudentDetailCard,
  StudentDetailInfo,
  StudentRelatedItems,
} from "@/components/student";

export default function StudentVideoDetailPage() {
  const params = useParams();
  const videoId = params.videoId as string;

  // Fetch video data
  const { data: videoData, isLoading } = useVideo(videoId);
  const video = videoData?.data as VideoWithRelations | undefined;

  // Fetch related videos
  const { data: relatedData } = useRelatedVideos(videoId);
  const relatedVideos = (relatedData?.data as VideoWithRelations[]) || [];

  // Track view mutation
  const viewMutation = useIncrementVideoViews(videoId);

  // Track view on mount
  useEffect(() => {
    if (video) {
      viewMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id]);

  if (isLoading) {
    return <LoadingState message="Chargement de la vidéo..." />;
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <VideoIcon className="h-16 w-16 text-ops-tertiary" />
        <h2 className="text-2xl font-bold text-ops-primary">
          Vidéo introuvable
        </h2>
        <p className="text-ops-secondary">
          Cette vidéo n&apos;existe pas ou a été supprimée.
        </p>
        <Button asChild variant="outline" className="ops-btn-secondary">
          <Link href={STUDENT_ROUTES.VIDEOS}>Retour aux vidéos</Link>
        </Button>
      </div>
    );
  }

  const embedUrl = video.youtubeId ? getYouTubeEmbedUrl(video.youtubeId) : null;
  const thumbnailUrl =
    video.thumbnailFile?.publicUrl ||
    (video.youtubeId ? getYouTubeThumbnailUrl(video.youtubeId) : null);

  // Prepare header metrics
  const headerMetrics: { icon: typeof Calendar; value: React.ReactNode }[] = [
    {
      icon: Calendar,
      value: new Date(video.createdAt).toLocaleDateString("fr-FR"),
    },
    { icon: Eye, value: `${video.views || 0} vues` },
  ];


  if (video.duration) {
    headerMetrics.push({
      icon: Clock,
      value: formatDuration(video.duration) || "",
    });
  }

  // Prepare detail info items
  const detailItems = [
    { label: "Catégorie", value: video.category, isBadge: true, badgeVariant: "brand" as const },
    { label: "Niveau", value: video.level, isBadge: true, badgeVariant: "outline" as const },
    { label: "École/Filière", value: video.school },
  ];

  if (video.subject) {
    detailItems.push({ label: "Matière", value: video.subject });
  }

  // Prepare related items for sidebar
  const relatedItemsData = relatedVideos.map((v) => ({
    id: v.id,
    title: v.title,
    thumbnailUrl:
      v.thumbnailFile?.publicUrl ||
      (v.youtubeId ? getYouTubeThumbnailUrl(v.youtubeId) : null),
    views: v.views,
    duration: formatDuration(v.duration),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <StudentDetailHeader
        backHref={STUDENT_ROUTES.VIDEOS}
        title={video.title}
        metrics={headerMetrics}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="ops-card border border-border overflow-hidden">
            <CardContent className="p-0">
              {embedUrl ? (
                <div className="relative aspect-video w-full">
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : thumbnailUrl ? (
                <div className="relative aspect-video w-full">
                  <SupabaseImage
                    src={thumbnailUrl}
                    alt={video.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="p-6 rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video w-full bg-linear-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center">
                  <VideoIcon className="h-20 w-20 text-brand-500/30" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <StudentDetailCard title="Description">
            {video.description ? (
              <p className="text-ops-secondary whitespace-pre-wrap">
                {video.description}
              </p>
            ) : (
              <p className="text-ops-tertiary italic">
                Aucune description disponible
              </p>
            )}
          </StudentDetailCard>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <StudentDetailCard title="Étiquettes">
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </StudentDetailCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <StudentDetailInfo title="Détails" items={detailItems} />

          {/* Related Videos */}
          <StudentRelatedItems
            title="Vidéos Similaires"
            description="Vous pourriez aussi aimer"
            items={relatedItemsData}
            getHref={(id) => STUDENT_ROUTES.VIDEO(id)}
            fallbackIcon={VideoIcon}
            maxItems={5}
            thumbnailAspect="video"
          />

          {/* Watch on YouTube Button */}
          {video.url && (
            <Button asChild className="w-full ops-btn-primary">
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 fill-current" />
                Regarder sur YouTube
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
