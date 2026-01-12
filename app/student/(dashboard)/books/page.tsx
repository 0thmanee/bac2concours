"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooks, useBookFilters } from "@/lib/hooks/use-books";
import { BookWithRelations } from "@/lib/types/prisma";
import type { BookUIFilters } from "@/lib/validations/book.validation";
import { BookStatus } from "@/lib/enums";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { TablePagination } from "@/components/ui/data-table";
import { toast } from "sonner";
import { toApiParam } from "@/lib/utils/filter.utils";
import {
  StudentPageHeader,
  StudentEmptyState,
  StudentMediaCard,
} from "@/components/student";

// Default filter values
const DEFAULT_FILTERS: BookUIFilters = {
  search: "",
  category: "",
  level: "",
};

export default function StudentBooksPage() {
  const router = useRouter();
  
  // Filter state using proper types
  const [filters, setFilters] = useState<BookUIFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // API calls with proper params
  const { data: booksData, isLoading } = useBooks({
    search: toApiParam(filters.search),
    category: toApiParam(filters.category),
    level: toApiParam(filters.level),
    status: BookStatus.ACTIVE,
    isPublic: true,
    page: currentPage,
    limit: pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { data: filtersData } = useBookFilters();

  // Extract data from response
  const books = (booksData?.data?.books as BookWithRelations[]) || [];
  const paginationData = booksData?.data;
  const filterOptions = filtersData?.data || {
    categories: [],
    schools: [],
    levels: [],
    subjects: [],
  };

  // Filter change handler - resets pagination
  const updateFilter = useCallback(<K extends keyof BookUIFilters>(key: K, value: BookUIFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleRead = (e: React.MouseEvent, fileUrl: string | null) => {
    e.stopPropagation();
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement de la bibliothèque..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <StudentPageHeader
        title="Bibliothèque de Livres"
        count={paginationData?.total || books.length}
        countLabel="livres"
        countLabelSingular="livre"
      />

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            placeholder="Rechercher un livre..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={filters.category || "all"}
            onChange={(value) => updateFilter("category", value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Toutes catégories" },
              ...filterOptions.categories.map((cat) => ({ value: cat, label: cat })),
            ]}
            placeholder="Catégorie"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={filters.level || "all"}
            onChange={(value) => updateFilter("level", value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Tous niveaux" },
              ...filterOptions.levels.map((level) => ({ value: level, label: level })),
            ]}
            placeholder="Niveau"
            className="w-full sm:w-45"
          />
        </div>
      </FilterPanel>

      {/* Books Grid */}
      {books.length === 0 ? (
        <StudentEmptyState
          icon={BookOpen}
          title="Aucun livre trouvé"
          description="Essayez de modifier vos critères de recherche ou vos filtres."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {books.map((book) => (
            <StudentMediaCard
              key={book.id}
              onClick={() => router.push(`/student/books/${book.id}`)}
              thumbnailUrl={book.coverFile?.publicUrl}
              thumbnailAlt={book.title}
              thumbnailAspect="book"
              fallbackIcon={BookOpen}
              badge={
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-background backdrop-blur-sm text-foreground shadow-sm border border-white/50">
                  {book.totalPages ? `${book.totalPages}p` : "PDF"}
                </span>
              }
              title={book.title}
              subtitle={
                <>
                  par <span className="font-medium">{book.author}</span>
                </>
              }
              description={book.description}
              category={book.category}
              level={book.level}
              metrics={[
                { icon: Eye, value: book.views },
              ]}

              actions={
                <>
                  <Button
                    onClick={(e) => handleRead(e, book.fileUrl)}
                    disabled={!book.fileUrl}
                    className="flex-1 bg-linear-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-600))] hover:from-[rgb(var(--brand-600))] hover:to-[rgb(var(--brand-700))] text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText size={15} className="mr-2" />
                    Lire
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationData && paginationData.totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          totalItems={paginationData.total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
