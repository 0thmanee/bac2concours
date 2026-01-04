"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, BookOpen, Star, FileText } from "lucide-react";
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
import { SupabaseImage } from "@/components/ui/supabase-image";
import { toast } from "sonner";

const DEFAULT_FILTERS = bookUIFiltersSchema.parse({});

const ALL_CATEGORIES = "Toutes";
const ALL_LEVELS = "Tous";

export default function FounderBooksPage() {
  const router = useRouter();
  const [uiFilters, setUIFilters] = useState<BookUIFilters>(DEFAULT_FILTERS);

  // Convert UI filters to API filters
  const apiFilters: Partial<BookFilters> = useMemo(() => ({
    search: uiFilters.search || undefined,
    category: uiFilters.category && uiFilters.category !== ALL_CATEGORIES ? uiFilters.category : undefined,
    level: uiFilters.level && uiFilters.level !== ALL_LEVELS ? uiFilters.level : undefined,
    status: BookStatus.ACTIVE,
    isPublic: true,
    page: 1,
    limit: 50,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  }), [uiFilters]);

  const { data: booksData, isLoading } = useBooks(apiFilters);

  const books = useMemo(
    () => (booksData?.data?.books as BookWithRelations[]) || [],
    [booksData]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach(book => book.category && cats.add(book.category));
    return [ALL_CATEGORIES, ...Array.from(cats)];
  }, [books]);

  const levels = useMemo(() => {
    const lvls = new Set<string>();
    books.forEach(book => book.level && lvls.add(book.level));
    return [ALL_LEVELS, ...Array.from(lvls)];
  }, [books]);

  const handleDownload = (fileUrl: string | null, title: string) => {
    if (!fileUrl) {
      toast.error("Fichier non disponible");
      return;
    }
    window.open(fileUrl, "_blank");
    toast.success(`Téléchargement de "${title}"`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          size={12}
          className={i < fullStars ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return <LoadingState message="Chargement de la bibliothèque..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-[rgb(var(--brand-600))] to-[rgb(var(--brand-700))] bg-clip-text text-transparent mb-2">
            Bibliothèque de Livres
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {books.length} livre{books.length !== 1 ? 's' : ''} disponible{books.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={uiFilters.search}
            onChange={(value) => setUIFilters(prev => ({ ...prev, search: value }))}
            placeholder="Rechercher un livre..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={uiFilters.category || ALL_CATEGORIES}
            onChange={(value) => setUIFilters(prev => ({ ...prev, category: value }))}
            options={categories}
            placeholder="Catégorie"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={uiFilters.level || ALL_LEVELS}
            onChange={(value) => setUIFilters(prev => ({ ...prev, level: value }))}
            options={levels}
            placeholder="Niveau"
            className="w-full sm:w-45"
          />
        </div>
      </FilterPanel>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="ops-card border border-ops text-center py-16 sm:py-20">
          <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aucun livre trouvé
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {books.map((book) => (
            <div 
              key={book.id} 
              onClick={() => router.push(`/founder/books/${book.id}`)}
              className="ops-card border border-ops group h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-[rgb(var(--brand-400))] dark:hover:border-[rgb(var(--brand-600))] cursor-pointer"
            >
              <div className="relative flex-1 flex flex-col p-4 sm:p-5">
                {/* Book Thumbnail */}
                <div className="aspect-3/4 bg-linear-to-br from-[rgb(var(--brand-50))] via-[rgb(var(--brand-100))] to-[rgb(var(--brand-200))] dark:from-[rgb(var(--brand-950))]/40 dark:via-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden shadow-inner group-hover:shadow-md transition-shadow duration-300">
                  {book.coverFile?.publicUrl ? (
                    <>
                      <SupabaseImage
                        src={book.coverFile.publicUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-[rgb(var(--brand-500))]/10 blur-3xl" />
                      <BookOpen className="relative w-16 h-16 sm:w-20 sm:h-20 text-[rgb(var(--brand-500))] dark:text-[rgb(var(--brand-400))]" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-700 shadow-sm border border-white/50">
                      {book.totalPages ? `${book.totalPages}p` : 'PDF'}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="line-clamp-2 mb-1.5 font-semibold text-gray-900 text-base sm:text-lg dark:text-white group-hover:text-[rgb(var(--brand-600))] dark:group-hover:text-[rgb(var(--brand-400))] transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        par <span className="font-medium">{book.author}</span>
                      </p>
                    </div>

                    {book.description && (
                      <p className="line-clamp-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {book.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {book.category && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]">
                            {book.category}
                          </span>
                        )}
                        {book.level && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-50 to-purple-100 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                            {book.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                        <span className="flex items-center gap-1.5">
                          <Eye size={13} className="text-gray-400" />
                          <span className="font-medium">{book.views}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Download size={13} className="text-gray-400" />
                          <span className="font-medium">{book.downloads}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating and Actions */}
                  <div className="space-y-3 mt-auto pt-3">
                    {/* Rating */}
                    {book.rating && book.rating > 0 && (
                      <div className="flex items-center gap-2 pb-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars(book.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {book.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(book.fileUrl, book.title);
                        }}
                        className="flex-1 bg-linear-to-r from-[rgb(var(--brand-500))] to-[rgb(var(--brand-600))] hover:from-[rgb(var(--brand-600))] hover:to-[rgb(var(--brand-700))] text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!book.fileUrl}
                      >
                        <Download size={15} className="mr-2" />
                        Télécharger
                      </Button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (book.fileUrl) {
                            window.open(book.fileUrl, "_blank");
                          }
                        }}
                        disabled={!book.fileUrl}
                        className="p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-[rgb(var(--brand-400))] dark:hover:border-[rgb(var(--brand-600))] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        title="Lire"
                      >
                        <FileText size={18} className="text-gray-600 dark:text-gray-400 group-hover/btn:text-[rgb(var(--brand-600))] dark:group-hover/btn:text-[rgb(var(--brand-400))] transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
