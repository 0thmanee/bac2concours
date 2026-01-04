"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Download, Eye, Star } from "lucide-react";
import { DataTable, Column, type PaginationConfig } from "@/components/ui/data-table";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminEmptyState,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
import { useBooks, useDeleteBook, useBookStats, useBookFilters } from "@/lib/hooks/use-books";
import { BookWithRelations } from "@/lib/types/prisma";
import type { BookUIFilters, BookStatusType } from "@/lib/validations/book.validation";
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
import { toApiParam } from "@/lib/utils/filter.utils";

// Extended UI filters for books (includes additional admin filters)
interface BookAdminFilters extends BookUIFilters {
  school: string;
  status: string;
}

// Default filter values
const DEFAULT_FILTERS: BookAdminFilters = {
  search: "",
  category: "",
  level: "",
  school: "",
  status: "",
};

export default function AdminBooksPage() {
  // Filter state using proper types
  const [filters, setFilters] = useState<BookAdminFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API calls with proper params
  const { data: booksData, isLoading } = useBooks({
    search: toApiParam(filters.search),
    category: toApiParam(filters.category),
    school: toApiParam(filters.school),
    level: toApiParam(filters.level),
    status: toApiParam(filters.status) as BookStatusType | undefined,
    page: currentPage,
    limit: pageSize,
  });

  const { data: statsData } = useBookStats();
  const { data: filtersData } = useBookFilters();
  const deleteMutation = useDeleteBook();

  // Extract data from response
  const books = booksData?.data?.books || [];
  const paginationData = booksData?.data;
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
  const updateFilter = useCallback(<K extends keyof BookAdminFilters>(key: K, value: BookAdminFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const stats = statsData?.data || {
    totalBooks: 0,
    activeBooks: 0,
    totalDownloads: 0,
    totalViews: 0,
    averageRating: 0,
    booksByCategory: {},
    booksByLevel: {},
  };

  const handleDelete = useCallback(
    async (bookId: string, bookTitle: string) => {
      try {
        await deleteMutation.mutateAsync(bookId);
        toast.success(`"${bookTitle}" has been deleted successfully`);
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
      ACTIVE: "bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      INACTIVE: "bg-linear-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200",
      PROCESSING: "bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
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
      title: "Total Livres",
      value: stats.totalBooks,
      icon: BookOpen,
      color: "blue",
      subtitle: `${stats.activeBooks} actifs`,
    },
    {
      title: "Téléchargements",
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: "orange",
      subtitle: "Total",
    },
    {
      title: "Vues",
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

  const columns: Column<BookWithRelations>[] = [
    {
      header: "Livre",
      cell: (book) => (
        <div className="flex items-start gap-3">
          {book.coverFile?.publicUrl && (
            <SupabaseImage
              src={book.coverFile.publicUrl}
              alt={book.title}
              width={36}
              height={48}
              className="h-12 w-9 rounded object-cover shrink-0"
            />
          )}
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {book.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {book.author}
            </p>
            {book.totalPages && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {book.totalPages} p.
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Catégorie",
      cell: (book) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">{book.category}</p>
          {book.subject && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{book.subject}</p>
          )}
        </div>
      ),
    },
    {
      header: "École/Niveau",
      cell: (book) => (
        <div>
          <p className="text-sm text-gray-900 dark:text-white">{book.school}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{book.level}</p>
        </div>
      ),
    },
    {
      header: "Statistiques",
      cell: (book) => (
        <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {book.downloads}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {book.views}
          </span>
          {book.rating && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              {book.rating.toFixed(1)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (book) => (
        <div className="flex items-center gap-1 flex-wrap">
          {getStatusBadge(book.status)}
          {book.isPublic && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] border border-[rgb(var(--brand-200))]">Publique</span>
          )}
        </div>
      ),
    },
    {
      header: "Ajouté le",
      cell: (book) => (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(book.createdAt), "MMM d, yyyy")}
        </p>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (book) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ops-card">
            <DropdownMenuItem asChild className="text-sm">
              <Link href={ADMIN_ROUTES.BOOK(book.id)} className="cursor-pointer">
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-sm">
              <Link href={ADMIN_ROUTES.BOOK_EDIT(book.id)} className="cursor-pointer">
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-sm">
              <a href={book.fileUrl || undefined} download target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                Télécharger
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
                  <AlertDialogTitle>Supprimer le livre</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &ldquo;{book.title}&rdquo; ? Cette action
                    est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(book.id, book.title)}
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
    return <LoadingState message="Chargement des livres..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Livres"
        description="Gérer les ressources pédagogiques et les livres"
        actionLabel="Ajouter un livre"
        actionHref={ADMIN_ROUTES.BOOK_NEW}
        actionIcon={Plus}
      />

      {/* Metric Cards */}
      <AdminStatsGrid stats={statsConfig} columns={4} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Rechercher des livres..."
        filters={filtersConfig}
        resultsCount={paginationData?.total || books.length}
        resultsLabel="résultat"
      />

      {/* Books Table */}
      <DataTable
        data={books}
        columns={columns}
        keyExtractor={(book) => book.id}
        isLoading={isLoading}
        pagination={pagination}
        emptyState={
          <AdminEmptyState
            icon={BookOpen}
            title="Aucun livre trouvé"
            description="Ajoutez votre premier livre pour commencer"
          />
        }
      />
    </div>
  );
}
