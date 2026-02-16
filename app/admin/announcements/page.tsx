"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus, MoreHorizontal } from "lucide-react";
import { DataTable, Column, type PaginationConfig } from "@/components/ui/data-table";
import {
  AdminPageHeader,
  AdminFilterBar,
  AdminEmptyState,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingState } from "@/components/shared/loading-state";
import { MESSAGES, ADMIN_ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import {
  useAnnouncements,
  useDeleteAnnouncement,
  usePublishAnnouncement,
  type AnnouncementWithRelations,
} from "@/lib/hooks/use-announcements";

const TYPE_LABELS: Record<string, string> = {
  REGISTRATION: "Inscription",
  EVENT: "Événement",
  GENERAL: "Général",
};
const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
};

export default function AdminAnnouncementsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useAnnouncements({
    search: filters.search || undefined,
    status: (filters.status as "DRAFT" | "PUBLISHED") || undefined,
    type: (filters.type as "REGISTRATION" | "EVENT" | "GENERAL") || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const deleteMutation = useDeleteAnnouncement();

  const announcements = (data?.data?.announcements as AnnouncementWithRelations[]) || [];
  const paginationData = data?.data;
  const pagination: PaginationConfig | undefined = paginationData
    ? {
        currentPage: paginationData.page,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.total,
        pageSize: paginationData.limit,
        onPageChange: setCurrentPage,
      }
    : undefined;

  const updateFilter = useCallback(
    <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success(`"${title}" a été supprimée`);
      } catch {
        toast.error(MESSAGES.ERROR.GENERIC);
      }
    },
    [deleteMutation]
  );

  const columns: Column<AnnouncementWithRelations>[] = [
    {
      header: "Titre",
      cell: (a) => (
        <div>
          <p className="font-medium text-sm text-foreground">{a.title}</p>
          {a.school && (
            <p className="text-xs text-muted-foreground">
              {a.school.name}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Type",
      cell: (a) => (
        <span className="text-sm text-muted-foreground">
          {TYPE_LABELS[a.type] ?? a.type}
        </span>
      ),
    },
    {
      header: "Statut",
      cell: (a) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${
            a.status === "PUBLISHED"
              ? "bg-success-light text-success-dark border-success-light"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {STATUS_LABELS[a.status] ?? a.status}
        </span>
      ),
    },
    {
      header: "Date",
      cell: (a) => (
        <p className="text-sm text-muted-foreground">
          {a.publishedAt
            ? format(new Date(a.publishedAt), "dd MMM yyyy")
            : format(new Date(a.createdAt), "dd MMM yyyy")}
        </p>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (a) => (
        <AnnouncementActions
          announcement={a}
          onDelete={() => handleDelete(a.id, a.title)}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Chargement des annonces..." />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Annonces"
        description="Créer et publier des annonces (ex: ouverture des inscriptions). La publication envoie une notification à tous les utilisateurs."
        actionLabel="Nouvelle annonce"
        actionHref={ADMIN_ROUTES.ANNOUNCEMENT_NEW}
        actionIcon={Plus}
      />

      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Rechercher des annonces..."
        filters={[
          {
            value: filters.status || "all",
            onChange: (v) => updateFilter("status", v === "all" ? "" : v),
            options: [
              { value: "all", label: "Tous statuts" },
              { value: "DRAFT", label: "Brouillon" },
              { value: "PUBLISHED", label: "Publié" },
            ],
          },
          {
            value: filters.type || "all",
            onChange: (v) => updateFilter("type", v === "all" ? "" : v),
            options: [
              { value: "all", label: "Tous types" },
              { value: "REGISTRATION", label: "Inscription" },
              { value: "EVENT", label: "Événement" },
              { value: "GENERAL", label: "Général" },
            ],
          },
        ]}
        resultsCount={paginationData?.total ?? announcements.length}
        resultsLabel="annonce"
      />

      <DataTable
        data={announcements}
        columns={columns}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        pagination={pagination}
        emptyState={
          <AdminEmptyState
            icon={Megaphone}
            title="Aucune annonce"
            description="Créez une annonce pour notifier tous les utilisateurs"
          />
        }
      />
    </div>
  );
}

function AnnouncementActions({
  announcement,
  onDelete,
}: {
  announcement: AnnouncementWithRelations;
  onDelete: () => void;
}) {
  const publishMutation = usePublishAnnouncement(announcement.id);

  const handlePublish = () => {
    publishMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Annonce publiée. Tous les utilisateurs ont été notifiés.");
      },
      onError: () => {
        toast.error("Échec de la publication");
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="ops-card">
        <DropdownMenuItem asChild className="text-sm">
          <Link href={ADMIN_ROUTES.ANNOUNCEMENT_EDIT(announcement.id)}>
            Modifier
          </Link>
        </DropdownMenuItem>
        {announcement.status === "DRAFT" && (
          <DropdownMenuItem
            className="text-sm cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              handlePublish();
            }}
            disabled={publishMutation.isPending}
          >
            Publier (notifier tous)
          </DropdownMenuItem>
        )}
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
              <AlertDialogTitle>Supprimer l&apos;annonce</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer &ldquo;{announcement.title}
                &rdquo; ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
