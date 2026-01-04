"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooks } from "@/lib/hooks/use-books";
import { BookWithRelations } from "@/lib/types/prisma";
import type { BookFilters, BookUIFilters } from "@/lib/validations/book.validation";
import { bookUIFiltersSchema } from "@/lib/validations/book.validation";
import { BookStatus } from "@prisma/client";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { toast } from "sonner";
import {
  StudentPageHeader,
  StudentEmptyState,
  StudentMediaCard,
} from "@/components/student";

const DEFAULT_FILTERS = bookUIFiltersSchema.parse({});
const ALL_CATEGORIES = "Toutes";
const ALL_LEVELS = "Tous";

export default function StudentBooksPage() {
  const router = useRouter();
  const [uiFilters, setUIFilters] = useState<BookUIFilters>(DEFAULT_FILTERS);

  // Convert UI filters to API filters
  const apiFilters: Partial<BookFilters> = useMemo(
    () => ({
      search: uiFilters.search || undefined,
      category:
        uiFilters.category && uiFilters.category !== ALL_CATEGORIES
          ? uiFilters.category
          : undefined,
      level:
        uiFilters.level && uiFilters.level !== ALL_LEVELS
          ? uiFilters.level
          : undefined,
      status: BookStatus.ACTIVE,
      isPublic: true,
      page: 1,
      limit: 50,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    }),
    [uiFilters]
  );

  const { data: booksData, isLoading } = useBooks(apiFilters);

  const books = useMemo(
    () => (booksData?.data?.books as BookWithRelations[]) || [],
    [booksData]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach((book) => book.category && cats.add(book.category));
    return [ALL_CATEGORIES, ...Array.from(cats)];
  }, [books]);

  const levels = useMemo(() => {
    const lvls = new Set<string>();
    books.forEach((book) => book.level && lvls.add(book.level));
    return [ALL_LEVELS, ...Array.from(lvls)];
  }, [books]);

  const handleDownload = (
    e: React.MouseEvent,
    fileUrl: string | null,
    title: string
  ) => {
    e.stopPropagation();
    if (!fileUrl) {
      toast.error("Fichier non disponible");
      return;
    }
    window.open(fileUrl, "_blank");
    toast.success(`Téléchargement de "${title}"`);
  };

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
        count={books.length}
        countLabel="livres"
        countLabelSingular="livre"
      />

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={uiFilters.search}
            onChange={(value) =>
              setUIFilters((prev) => ({ ...prev, search: value }))
            }
            placeholder="Rechercher un livre..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={uiFilters.category || ALL_CATEGORIES}
            onChange={(value) =>
              setUIFilters((prev) => ({ ...prev, category: value }))
            }
            options={categories}
            placeholder="Catégorie"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={uiFilters.level || ALL_LEVELS}
            onChange={(value) =>
              setUIFilters((prev) => ({ ...prev, level: value }))
            }
            options={levels}
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
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-700 shadow-sm border border-white/50">
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
                { icon: Download, value: book.downloads },
              ]}
              rating={book.rating}
              actions={
                <>
                  <Button
                    onClick={(e) => handleDownload(e, book.fileUrl, book.title)}
                    className="flex-1 bg-linear-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-600))] hover:from-[rgb(var(--brand-600))] hover:to-[rgb(var(--brand-700))] text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!book.fileUrl}
                  >
                    <Download size={15} className="mr-2" />
                    Télécharger
                  </Button>
                  <button
                    onClick={(e) => handleRead(e, book.fileUrl)}
                    disabled={!book.fileUrl}
                    className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[rgb(var(--brand-400))] dark:hover:border-[rgb(var(--brand-600))] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    title="Lire"
                  >
                    <FileText
                      size={18}
                      className="text-gray-600 dark:text-gray-400 group-hover/btn:text-[rgb(var(--brand-600))] dark:group-hover/btn:text-[rgb(var(--brand-400))] transition-colors"
                    />
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
