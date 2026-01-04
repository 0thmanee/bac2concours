"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Download, Eye, Star } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { DataTable, Column } from "@/components/ui/data-table";
import { useBooks, useDeleteBook, useBookStats, useBookFilters } from "@/lib/hooks/use-books";
import { BookWithRelations } from "@/lib/types/prisma";
import type { BookStatusType } from "@/lib/validations/book.validation";
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

export default function AdminBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BookStatusType | "">("");

  const { data: booksData, isLoading } = useBooks({
    search: searchQuery || undefined,
    category: selectedCategory || undefined,
    school: selectedSchool || undefined,
    level: selectedLevel || undefined,
    status: selectedStatus || undefined,
    page: 1,
    limit: 50,
  });

  const { data: statsData } = useBookStats();
  const { data: filtersData } = useBookFilters();
  const deleteMutation = useDeleteBook();

  const books = useMemo(
    () => (booksData?.data?.books as BookWithRelations[]) || [],
    [booksData]
  );

  const stats = statsData?.data || {
    totalBooks: 0,
    activeBooks: 0,
    totalDownloads: 0,
    totalViews: 0,
    averageRating: 0,
    booksByCategory: {},
    booksByLevel: {},
  };

  const filters = filtersData?.data || {
    categories: [],
    schools: [],
    levels: [],
    subjects: [],
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
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      PROCESSING: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

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
              className="h-12 w-9 rounded object-cover flex-shrink-0"
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
            <Badge variant="outline" className="text-xs">Publique</Badge>
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
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.BOOK(book.id)} className="cursor-pointer">
                Voir détails
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.BOOK_EDIT(book.id)} className="cursor-pointer">
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={book.fileUrl || undefined} download target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                Télécharger
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
    return <LoadingState message="Loading books..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">
            Livres
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Gérer les ressources pédagogiques et les livres
          </p>
        </div>
        <Button asChild className="ops-btn-primary h-9 gap-2">
          <Link href={ADMIN_ROUTES.BOOK_NEW}>
            <Plus className="h-4 w-4" />
            Ajouter un livre
          </Link>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Livres"
          value={stats.totalBooks}
          icon={BookOpen}
          color="blue"
          subtitle={`${stats.activeBooks} actifs`}
        />
        <MetricCard
          title="Téléchargements"
          value={stats.totalDownloads.toLocaleString()}
          icon={Download}
          color="orange"
          subtitle="Total"
        />
        <MetricCard
          title="Vues"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          color="mint"
          subtitle="Total"
        />
        <MetricCard
          title="Note Moyenne"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="purple"
          subtitle="Sur 5.0"
        />
      </div>

      {/* Filters */}
      <FilterPanel className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher des livres..."
            containerClassName="flex-1 min-w-[250px]"
          />
          
          <FilterSelect
            value={selectedCategory}
            onChange={(value) => setSelectedCategory(value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Toutes catégories" },
              ...filters.categories.map(cat => ({ value: cat, label: cat }))
            ]}
            className="w-full lg:w-[180px]"
          />

          <FilterSelect
            value={selectedSchool}
            onChange={(value) => setSelectedSchool(value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Toutes écoles" },
              ...filters.schools.map(school => ({ value: school, label: school }))
            ]}
            className="w-full lg:w-[180px]"
          />

          <FilterSelect
            value={selectedLevel}
            onChange={(value) => setSelectedLevel(value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Tous niveaux" },
              ...filters.levels.map(level => ({ value: level, label: level }))
            ]}
            className="w-full lg:w-[180px]"
          />

          <FilterSelect
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value === "all" ? "" : value as BookStatusType)}
            options={[
              { value: "all", label: "Tous statuts" },
              { value: "ACTIVE", label: "Actif" },
              { value: "INACTIVE", label: "Inactif" },
              { value: "PROCESSING", label: "En traitement" }
            ]}
            className="w-full lg:w-[180px]"
          />
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {books.length} résultat{books.length > 1 ? 's' : ''} trouvé{books.length > 1 ? 's' : ''}
        </div>
      </FilterPanel>

      {/* Books Table */}
      <DataTable
        data={books}
        columns={columns}
        keyExtractor={(book) => book.id}
        isLoading={isLoading}
        emptyState={
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Aucun livre trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Ajoutez votre premier livre pour commencer
            </p>
          </div>
        }
      />
    </div>
  );
}
