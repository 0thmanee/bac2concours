"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, Plus, Eye, Star } from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminEmptyState,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
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
import { Badge } from "@/components/ui/badge";
import { SupabaseImage } from "@/components/ui/supabase-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { MESSAGES, ADMIN_ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import {
  useVideos,
  useVideoStats,
  useVideoFilterOptions,
  useDeleteVideo,
} from "@/lib/hooks/use-videos";
import type { VideoStatus } from "@prisma/client";
import type { VideoWithRelations } from "@/lib/validations/video.validation";

export default function AdminVideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<VideoStatus | "">("");

  // Use centralized hooks
  const { data: videosData, isLoading } = useVideos({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    school: selectedSchool || undefined,
    level: selectedLevel || undefined,
    status: selectedStatus || undefined,
    page: 1,
    limit: 50,
  });

  const { data: statsData } = useVideoStats();
  const { data: filtersData } = useVideoFilterOptions();
  const deleteMutation = useDeleteVideo();

  const videos = useMemo(
    () => (videosData?.data?.videos as VideoWithRelations[]) || [],
    [videosData]
  );

  const stats = statsData?.data || {
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
    averageRating: 0,
  };

  const filters = filtersData?.data || {
    categories: [],
    schools: [],
    levels: [],
    subjects: [],
  };

  const handleDelete = useCallback(
    async (videoId: string, videoTitle: string) => {
      try {
        await deleteMutation.mutateAsync(videoId);
        toast.success(`"${videoTitle}" a été supprimée avec succès`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
        );
      }
    },
    [deleteMutation]
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      PROCESSING: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "Total Vidéos",
      value: stats.total,
      icon: Video,
      color: "blue",
      subtitle: `${stats.active} actives`,
    },
    {
      title: "Inactives",
      value: stats.inactive,
      icon: Video,
      color: "orange",
      subtitle: "Total",
    },
    {
      title: "Total Vues",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "mint",
      subtitle: "Total",
    },
    {
      title: "Note Moyenne",
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: "purple",
      subtitle: "Sur 5.0",
    },
  ];

  // Filters configuration
  const filtersConfig: FilterConfig[] = [
    {
      value: selectedCategory || "all",
      onChange: setSelectedCategory,
      options: [
        { value: "all", label: "Toutes catégories" },
        ...filters.categories.map((cat) => ({ value: cat, label: cat })),
      ],
    },
    {
      value: selectedSchool || "all",
      onChange: setSelectedSchool,
      options: [
        { value: "all", label: "Toutes écoles" },
        ...filters.schools.map((school) => ({ value: school, label: school })),
      ],
    },
    {
      value: selectedLevel || "all",
      onChange: setSelectedLevel,
      options: [
        { value: "all", label: "Tous niveaux" },
        ...filters.levels.map((level) => ({ value: level, label: level })),
      ],
    },
    {
      value: selectedStatus || "all",
      onChange: (val) => setSelectedStatus(val as VideoStatus | ""),
      options: [
        { value: "all", label: "Tous statuts" },
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "PROCESSING", label: "En traitement" },
      ],
    },
  ];

  const columns: Column<VideoWithRelations>[] = [
    {
      header: "Vidéo",
      cell: (video) => (
        <div className="flex items-start gap-3">
          {video.thumbnailFile?.publicUrl ? (
            <SupabaseImage
              src={video.thumbnailFile.publicUrl}
              alt={video.title}
              width={36}
              height={48}
              className="h-12 w-9 rounded object-cover shrink-0"
            />
          ) : (
            <div className="h-12 w-9 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <Video className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {video.title}
            </p>
            {video.duration && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDuration(video.duration)}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Catégorie",
      cell: (video) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {video.category}
          </p>
          {video.subject && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {video.subject}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "École/Niveau",
      cell: (video) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">
            {video.school}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {video.level}
          </p>
        </div>
      ),
    },
    {
      header: "Statistiques",
      cell: (video) => (
        <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {video.views}
          </span>
          {video.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              {video.rating.toFixed(1)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (video) => (
        <div className="flex items-center gap-1 flex-wrap">
          {getStatusBadge(video.status)}
          {video.isPublic && (
            <Badge variant="outline" className="text-xs">
              Publique
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Ajouté le",
      cell: (video) => (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(video.createdAt), "MMM d, yyyy")}
        </p>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (video) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                href={ADMIN_ROUTES.VIDEO_EDIT(video.id)}
                className="cursor-pointer"
              >
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                Voir sur YouTube
              </a>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  Supprimer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la vidéo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &ldquo;{video.title}
                    &rdquo; ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(video.id, video.title)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Chargement des vidéos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Vidéos"
        description="Gérer les vidéos éducatives de la plateforme"
        actionLabel="Ajouter une vidéo"
        actionHref={ADMIN_ROUTES.VIDEO_NEW}
        actionIcon={Plus}
      />

      {/* Metric Cards */}
      <AdminStatsGrid stats={statsConfig} columns={4} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher des vidéos..."
        filters={filtersConfig}
        resultsCount={videos.length}
        resultsLabel="résultat"
      />

      {/* Videos Table */}
      <DataTable
        data={videos}
        columns={columns}
        keyExtractor={(video) => video.id}
        isLoading={isLoading}
        emptyState={
          <AdminEmptyState
            icon={Video}
            title="Aucune vidéo trouvée"
            description="Ajoutez votre première vidéo pour commencer"
          />
        }
      />
    </div>
  );
}
