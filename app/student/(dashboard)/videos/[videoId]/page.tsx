"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Star, Calendar, Clock, Play, Video as VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { LoadingState } from "@/components/shared/loading-state";

import { STUDENT_ROUTES } from "@/lib/routes";
import { useVideo, useRelatedVideos, useIncrementVideoViews } from "@/lib/hooks/use-videos";
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/validations/video.validation";
import type { VideoWithRelations } from "@/lib/validations/video.validation";

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
        <h2 className="text-2xl font-bold text-ops-primary">Vidéo introuvable</h2>
        <p className="text-ops-secondary">Cette vidéo n&apos;existe pas ou a été supprimée.</p>
        <Button asChild variant="outline" className="ops-btn-secondary">
          <Link href={STUDENT_ROUTES.VIDEOS}>Retour aux vidéos</Link>
        </Button>
      </div>
    );
  }

  const embedUrl = video.youtubeId ? getYouTubeEmbedUrl(video.youtubeId) : null;
  const thumbnailUrl = video.thumbnailFile?.publicUrl || 
    (video.youtubeId ? getYouTubeThumbnailUrl(video.youtubeId) : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="ops-btn-ghost h-8 w-8 p-0"
        >
          <Link href={STUDENT_ROUTES.VIDEOS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-ops-primary">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-ops-secondary">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{new Date(video.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{video.views || 0} vues</span>
            </div>
            {video.rating && video.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{video.rating.toFixed(1)}</span>
              </div>
            )}
            {video.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{video.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <Card className="ops-card border border-ops overflow-hidden">
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
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-ops-primary">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {video.description ? (
                <p className="text-ops-secondary whitespace-pre-wrap">{video.description}</p>
              ) : (
                <p className="text-ops-tertiary italic">Aucune description disponible</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Étiquettes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1 bg-linear-to-r from-brand-400/10 to-brand-600/10 text-brand-700 dark:text-brand-300 border-brand-500/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Détails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-ops-tertiary">Catégorie</p>
                <Badge
                  variant="secondary"
                  className="bg-linear-to-r from-brand-400/10 to-brand-600/10 text-brand-700 dark:text-brand-300 border-brand-500/20"
                >
                  {video.category}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-ops-tertiary">Niveau</p>
                <Badge variant="outline" className="border-ops-border text-ops-secondary">
                  {video.level}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-ops-tertiary">École/Filière</p>
                <p className="text-sm text-ops-primary">{video.school}</p>
              </div>

              {video.subject && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-ops-tertiary">Matière</p>
                  <p className="text-sm text-ops-primary">{video.subject}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Videos */}
          {relatedVideos.length > 0 && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Vidéos Similaires
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Vous pourriez aussi aimer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedVideos.slice(0, 5).map((relatedVideo) => {
                  const relatedThumbnail = relatedVideo.thumbnailFile?.publicUrl || 
                    (relatedVideo.youtubeId ? getYouTubeThumbnailUrl(relatedVideo.youtubeId) : null);

                  return (
                    <Link
                      key={relatedVideo.id}
                      href={STUDENT_ROUTES.VIDEO(relatedVideo.id)}
                      className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="relative w-24 h-16 rounded overflow-hidden shrink-0">
                        {relatedThumbnail ? (
                          <SupabaseImage
                            src={relatedThumbnail}
                            alt={relatedVideo.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center">
                            <VideoIcon className="h-6 w-6 text-brand-500/30" />
                          </div>
                        )}
                        {relatedVideo.duration && (
                          <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-white text-xs">
                            {relatedVideo.duration}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-ops-primary line-clamp-2 group-hover:text-brand-500 transition-colors">
                          {relatedVideo.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-ops-tertiary">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {relatedVideo.views || 0}
                          </span>
                          {relatedVideo.rating && relatedVideo.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {relatedVideo.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Watch on YouTube Button */}
          {video.url && (
            <Button
              asChild
              className="w-full ops-btn-primary"
            >
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
