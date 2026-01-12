"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Eye, Play, Clock, School, Calendar, ExternalLink } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useVideo, useDeleteVideo } from "@/lib/hooks/use-videos";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { format } from "date-fns";
import { formatDuration } from "@/lib/utils/filter.utils";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { AdminDetailHeader } from "@/components/admin";
import { getYouTubeThumbnailUrl } from "@/lib/validations/video.validation";

export default function VideoDetailPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const router = useRouter();
  const { data: videoData, isLoading, error, isError } = useVideo(videoId);
  const deleteMutation = useDeleteVideo();

  if (isLoading) {
    return <LoadingState message="Chargement de la vidéo..." />;
  }

  if (isError || error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Vidéo non trouvée"}
        backHref={ADMIN_ROUTES.VIDEOS}
        backLabel="Retour aux Vidéos"
      />
    );
  }

  const video = videoData?.data;

  if (!video) {
    return (
      <ErrorState
        message="Vidéo non trouvée"
        backHref={ADMIN_ROUTES.VIDEOS}
        backLabel="Retour aux Vidéos"
      />
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(videoId);
      toast.success("Vidéo supprimée avec succès");
      router.push(ADMIN_ROUTES.VIDEOS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const handleWatch = () => {
    if (video.url) {
      window.open(video.url, "_blank");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      INACTIVE: "bg-linear-to-r from-gray-50 to-gray-100 text-gray-600 border-border",
      PROCESSING: "bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      PROCESSING: "En traitement",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${styles[status] || styles.ACTIVE}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Get thumbnail URL
  const thumbnailUrl = video.thumbnailFile?.publicUrl 
    || (video.youtubeId ? getYouTubeThumbnailUrl(video.youtubeId, "hq") : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminDetailHeader
        backLabel="Retour aux Vidéos"
        backHref={ADMIN_ROUTES.VIDEOS}
        title={video.title}
        badges={
          <>
            {getStatusBadge(video.status)}
            {video.isPublic && <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-brand-700 border border-brand-200">Public</span>}
          </>
        }
        subtitle={
          <>
            <School className="h-4 w-4" />
            {video.school} • {video.category}
          </>
        }
        description={video.description || undefined}
        actions={
          <>
            <Button onClick={handleWatch} variant="outline" className="ops-btn-secondary h-9 gap-2">
              <ExternalLink className="h-4 w-4" />
              Regarder
            </Button>
            <Button asChild variant="outline" className="ops-btn-secondary h-9 gap-2">
              <Link href={ADMIN_ROUTES.VIDEO_EDIT(videoId)}>
                <Edit className="h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="ops-btn-secondary h-9 gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la Vidéo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &ldquo;{video.title}&rdquo; ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Vues"
          value={video.views?.toLocaleString() || "0"}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Durée"
          value={formatDuration(video.duration)}
          icon={Clock}
          color="orange"
        />
        <MetricCard
          title="Niveau"
          value={video.level || "Non spécifié"}
          icon={School}
          color="blue"
        />
        <MetricCard
          title="Matière"
          value={video.subject || "Non spécifiée"}
          icon={Play}
          color="purple"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Video Preview */}
          {thumbnailUrl && (
            <Card className="ops-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Aperçu de la Vidéo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  {video.thumbnailFile?.publicUrl ? (
                    <SupabaseImage
                      src={video.thumbnailFile.publicUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src={thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer" onClick={handleWatch}>
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-8 w-8 text-ops-primary ml-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classification */}
          <Card className="ops-card border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-ops-primary">
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Catégorie</p>
                  <p className="text-base text-ops-primary mt-1">{video.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Matière</p>
                  <p className="text-base text-ops-primary mt-1">{video.subject || "Non spécifiée"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">École/Filière</p>
                  <p className="text-base text-ops-primary mt-1 flex items-center gap-2">
                    <School className="h-4 w-4" />
                    {video.school}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Niveau</p>
                  <p className="text-base text-ops-primary mt-1">{video.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <Card className="ops-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Étiquettes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-brand-700 border border-brand-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video Information */}
          <Card className="ops-card border border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Informations de la Vidéo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-ops-tertiary">URL YouTube</p>
                <a 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-brand-500 hover:underline mt-1 break-all block"
                >
                  {video.url}
                </a>
              </div>
              {video.youtubeId && (
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">ID YouTube</p>
                  <p className="text-sm text-ops-primary mt-1">{video.youtubeId}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-ops-tertiary">Durée</p>
                <p className="text-sm text-ops-primary mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDuration(video.duration)}
                </p>
              </div>
              <div className="pt-3">
                <Button onClick={handleWatch} className="ops-btn-primary w-full h-9 gap-2">
                  <Play className="h-4 w-4" />
                  Regarder sur YouTube
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Publication Information */}
          <Card className="ops-card border border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Informations de Publication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-ops-tertiary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ajouté le
                </p>
                <p className="text-sm text-ops-primary mt-1">
                  {format(new Date(video.createdAt), "d MMMM yyyy 'à' HH:mm")}
                </p>
              </div>
              {video.updatedAt && video.updatedAt !== video.createdAt && (
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Dernière modification</p>
                  <p className="text-sm text-ops-primary mt-1">
                    {format(new Date(video.updatedAt), "d MMMM yyyy 'à' HH:mm")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
