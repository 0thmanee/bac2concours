"use client";

import { useState, useMemo } from "react";
import { Download, Eye, BookOpen, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useBooks } from "@/lib/hooks/use-books";
import { BookWithRelations } from "@/lib/types/prisma";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel, FilterGrid } from "@/components/ui/filter-panel";
import { toast } from "sonner";

export default function FounderBooksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedLevel, setSelectedLevel] = useState("Tous");

  const { data: booksData, isLoading } = useBooks({
    search: searchQuery || undefined,
    category: selectedCategory !== "Toutes" ? selectedCategory : undefined,
    level: selectedLevel !== "Tous" ? selectedLevel : undefined,
    status: "ACTIVE",
    isPublic: true,
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const books = useMemo(
    () => (booksData?.data?.books as BookWithRelations[]) || [],
    [booksData]
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    books.forEach(book => book.category && cats.add(book.category));
    return ["Toutes", ...Array.from(cats)];
  }, [books]);

  const levels = useMemo(() => {
    const lvls = new Set<string>();
    books.forEach(book => book.level && lvls.add(book.level));
    return ["Tous", ...Array.from(lvls)];
  }, [books]);

  const handleDownload = (fileUrl: string, title: string) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Bibliothèque de Livres
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {books.length} livre{books.length !== 1 ? 's' : ''} disponible{books.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un livre..."
            containerClassName="flex-1 min-w-[250px]"
          />

          <FilterSelect
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories}
            placeholder="Catégorie"
            className="w-full sm:w-[180px]"
          />

          <FilterSelect
            value={selectedLevel}
            onChange={setSelectedLevel}
            options={levels}
            placeholder="Niveau"
            className="w-full sm:w-[180px]"
          />
        </div>
      </FilterPanel>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun livre trouvé
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Essayez de modifier vos critères de recherche ou vos filtres.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 h-full flex flex-col hover:border-brand-300 dark:hover:border-brand-700 transition-all">
              <div className="relative flex-1 flex flex-col">
                {/* Book Thumbnail */}
                <div className="aspect-3/4 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-800/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl || ""}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <BookOpen className="w-16 h-16 text-brand-500 dark:text-brand-400" />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
                      {book.totalPages ? `${book.totalPages}p` : 'PDF'}
                    </span>
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <div>
                      <div className="line-clamp-2 mb-1 font-medium text-gray-800 text-base dark:text-white/90">
                        {book.title}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        par {book.author}
                      </p>
                    </div>

                    {book.description && (
                      <div className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                        {book.description}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {book.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
                            {book.category}
                          </span>
                        )}
                        {book.level && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                            {book.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {book.views} vues
                        </span>
                        <span className="flex items-center gap-1">
                          <Download size={12} />
                          {book.downloads} téléchargements
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating and Actions */}
                  <div className="space-y-3 mt-auto">
                    {/* Rating */}
                    {book.rating && book.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {renderStars(book.rating)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {book.rating.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(book.fileUrl, book.title)}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Download size={14} className="mr-1.5" />
                        Télécharger
                      </Button>
                      <button
                        onClick={() => window.open(book.fileUrl, "_blank")}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title="Lire"
                      >
                        <FileText size={16} className="text-gray-600 dark:text-gray-400" />
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
