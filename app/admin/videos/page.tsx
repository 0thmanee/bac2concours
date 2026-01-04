"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, Plus, Eye, Star } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { DataTable, Column } from "@/components/ui/data-table";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { VideoStatus } from "@prisma/client";
import type {
  VideoWithRelations,
  VideoStats,
  VideoFilterOptions,
} from "@/lib/validations/video.validation";

export default function AdminVideosPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<VideoStatus | "">("");

  // Fetch videos
  const { data: videosData, isLoading } = useQuery({
    queryKey: [
      "admin-videos",
      searchQuery,
      selectedCategory,
      selectedSchool,
      selectedLevel,
      selectedStatus,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedSchool) params.append("school", selectedSchool);
      if (selectedLevel) params.append("level", selectedLevel);
      if (selectedStatus) params.append("status", selectedStatus);
      params.append("limit", "50");

      const res = await fetch(`/api/videos?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch videos");
      return res.json();
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["admin-videos-stats"],
    queryFn: async () => {
      const res = await fetch("/api/videos/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  // Fetch filter options
  const { data: filtersData } = useQuery({
    queryKey: ["admin-videos-filters"],
    queryFn: async () => {
      const res = await fetch("/api/videos/filter-options");
      if (!res.ok) throw new Error("Failed to fetch filter options");
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-videos-stats"] });
    },
  });

  const videos = useMemo(
    () => (videosData?.data?.videos as VideoWithRelations[]) || [],
    [videosData]
  );

  const stats = (statsData?.data as VideoStats) || {
    total: 0,
    active: 0,
    inactive: 0,
    totalViews: 0,
    averageRating: 0,
  };

  const filters = (filtersData?.data as VideoFilterOptions) || {
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

  const columns: Column<VideoWithRelations>[] = [
    {
      header: "Vidéo",
      cell: (video) => (
        <div className="flex items-start gap-3">
          {video.thumbnailFile?.publicUrl ? (
            <SupabaseImage
              src={video.thumbnailFile.publicUrl}
              alt={video.title}
              width={80}
              height={45}
              className="h-11 w-20 rounded object-cover shrink-0"
            />
          ) : (
            <div className="h-11 w-20 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <Video className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {video.title}
            </p>
            {video.duration && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
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
      header: "École",
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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Eye className="h-3 w-3" />
            <span>{video.views}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{video.rating.toFixed(1)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (video) => (
        <div>
          {getStatusBadge(video.status)}
          {!video.isPublic && (
            <Badge variant="secondary" className="ml-1 text-xs">
              Privé
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      cell: (video) => (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {format(new Date(video.createdAt), "dd/MM/yyyy")}
        </p>
      ),
    },
    {
      header: "Actions",
      cell: (video) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.VIDEO_EDIT(video.id)}>Modifier</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir sur YouTube
              </a>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <span className="text-red-600 dark:text-red-400">
                    Supprimer
                  </span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &quot;{video.title}&quot; ?
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(video.id, video.title)}
                    className="bg-red-600 hover:bg-red-700"
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
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Vidéos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez les vidéos éducatives de la plateforme
          </p>
        </div>
        <Button asChild>
          <Link href={ADMIN_ROUTES.VIDEO_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une vidéo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Vidéos"
          value={stats.total}
          icon={Video}
          color="blue"
        />
        <MetricCard
          title="Actives"
          value={stats.active}
          icon={Video}
          color="mint"
        />
        <MetricCard
          title="Inactives"
          value={stats.inactive}
          icon={Video}
          color="orange"
        />
        <MetricCard
          title="Total Vues"
          value={stats.totalViews}
          icon={Eye}
          color="cyan"
        />
        <MetricCard
          title="Note Moyenne"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Filters */}
      <FilterPanel>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par titre..."
        />
        <FilterSelect
          label="Catégorie"
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={filters.categories.map((cat) => ({
            label: cat,
            value: cat,
          }))}
        />
        <FilterSelect
          label="École"
          value={selectedSchool}
          onChange={setSelectedSchool}
          options={filters.schools.map((school) => ({
            label: school,
            value: school,
          }))}
        />
        <FilterSelect
          label="Niveau"
          value={selectedLevel}
          onChange={setSelectedLevel}
          options={filters.levels.map((level) => ({
            label: level,
            value: level,
          }))}
        />
        <FilterSelect
          label="Statut"
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val as VideoStatus | "")}
          options={[
            { label: "Actif", value: "ACTIVE" },
            { label: "Inactif", value: "INACTIVE" },
            { label: "En traitement", value: "PROCESSING" },
          ]}
        />
      </FilterPanel>

      {/* Table */}
      <DataTable<VideoWithRelations>
        columns={columns}
        data={videos}
        keyExtractor={(video) => video.id}
      />
    </div>
  );
}
