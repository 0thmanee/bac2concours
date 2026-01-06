"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, Plus, Eye } from "lucide-react";
import { DataTable, Column, type PaginationConfig } from "@/components/ui/data-table";
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
import type { VideoUIFilters, VideoStatusType, VideoWithRelations } from "@/lib/validations/video.validation";
import { toApiParam, formatDuration } from "@/lib/utils/filter.utils";

// Extended UI filters for videos (includes additional admin filters)
interface VideoAdminFilters extends VideoUIFilters {
  school: string;
  status: string;
}

// Default filter values
const DEFAULT_FILTERS: VideoAdminFilters = {
  search: "",
  category: "",
  level: "",
  school: "",
  status: "",
};

export default function AdminVideosPage() {
  // Filter state using proper types
  const [filters, setFilters] = useState<VideoAdminFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API calls with proper params
  const { data: videosData, isLoading } = useVideos({
    search: toApiParam(filters.search),
    category: toApiParam(filters.category),
    school: toApiParam(filters.school),
    level: toApiParam(filters.level),
    status: toApiParam(filters.status) as VideoStatusType | undefined,
    page: currentPage,
    limit: pageSize,
  });

  const { data: statsData } = useVideoStats();
  const { data: filtersData } = useVideoFilterOptions();
  const deleteMutation = useDeleteVideo();

  // Extract data from response
  const videos = (videosData?.data?.videos as VideoWithRelations[]) || [];
  const paginationData = videosData?.data;
  const filterOptions = filtersData?.data || {
    categories: [],
    schools: [],
    levels: [],
    subjects: [],
  };

  // Pagination config
  const pagination: PaginationConfig | undefined = paginationData
    ? {
        currentPage: paginationData.page,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.total,
        pageSize: paginationData.limit,
        onPageChange: setCurrentPage,
      }
    : undefined;

  // Filter change handler - resets pagination
  const updateFilter = useCallback(<K extends keyof VideoAdminFilters>(key: K, value: VideoAdminFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const stats = statsData?.data || {
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
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
    const styles: Record<string, string> = {
      ACTIVE: "bg-linear-to-r from-[rgb(var(--success-light))] to-[rgb(var(--success-light))] text-[rgb(var(--success-dark))] border-[rgb(var(--success-light))]",
      INACTIVE: "bg-linear-to-r from-[rgb(var(--neutral-100))] to-[rgb(var(--neutral-100))] text-[rgb(var(--neutral-600))] border-[rgb(var(--neutral-200))]",
      PROCESSING: "bg-linear-to-r from-[rgb(var(--warning-light))] to-[rgb(var(--warning-light))] text-[rgb(var(--warning-dark))] border-[rgb(var(--warning-light))]",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      PROCESSING: "En traitement",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[status] || styles.ACTIVE}`}>
        {labels[status] || status}
      </span>
    );
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

  ];

  // Filters configuration
  const filtersConfig: FilterConfig[] = [
    {
      value: filters.category || "all",
      onChange: (value) => updateFilter("category", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Toutes catégories" },
        ...filterOptions.categories.map((cat) => ({ value: cat, label: cat })),
      ],
    },
    {
      value: filters.school || "all",
      onChange: (value) => updateFilter("school", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Toutes écoles" },
        ...filterOptions.schools.map((school) => ({ value: school, label: school })),
      ],
    },
    {
      value: filters.level || "all",
      onChange: (value) => updateFilter("level", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Tous niveaux" },
        ...filterOptions.levels.map((level) => ({ value: level, label: level })),
      ],
    },
    {
      value: filters.status || "all",
      onChange: (value) => updateFilter("status", value === "all" ? "" : value),
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
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (video) => (
        <div className="flex items-center gap-1 flex-wrap">
          {getStatusBadge(video.status)}
          {video.isPublic && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] border border-[rgb(var(--brand-200))]">Publique</span>
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
          <DropdownMenuContent align="end" className="ops-card">
            <DropdownMenuItem asChild className="text-sm">
              <Link
                href={ADMIN_ROUTES.VIDEO_EDIT(video.id)}
                className="cursor-pointer"
              >
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-sm">
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
                  className="text-sm text-destructive cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  Supprimer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
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
      <AdminStatsGrid stats={statsConfig} columns={3} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Rechercher des vidéos..."
        filters={filtersConfig}
        resultsCount={paginationData?.total || videos.length}
        resultsLabel="résultat"
      />

      {/* Videos Table */}
      <DataTable
        data={videos}
        columns={columns}
        keyExtractor={(video) => video.id}
        isLoading={isLoading}
        pagination={pagination}
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
