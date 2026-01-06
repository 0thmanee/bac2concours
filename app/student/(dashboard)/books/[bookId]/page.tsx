"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Star,
  Calendar,
  BookOpen,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { LoadingState } from "@/components/shared/loading-state";

import { STUDENT_ROUTES } from "@/lib/routes";
import { useBook, useRelatedBooks, useIncrementBookCounter } from "@/lib/hooks/use-books";
import type { BookWithRelations } from "@/lib/types/prisma";
import { toast } from "sonner";
import {
  StudentDetailHeader,
  StudentDetailCard,
  StudentDetailInfo,
  StudentRelatedItems,
} from "@/components/student";

export default function StudentBookDetailPage() {
  const params = useParams();
  const bookId = params.bookId as string;

  // Fetch book data
  const { data: bookData, isLoading } = useBook(bookId);
  const book = bookData?.data as BookWithRelations | undefined;

  // Fetch related books
  const { data: relatedData } = useRelatedBooks(bookId);
  const relatedBooks = (relatedData?.data as BookWithRelations[]) || [];

  // Track view mutation
  const incrementCounter = useIncrementBookCounter(bookId);

  // Track view on mount
  useEffect(() => {
    if (book) {
      incrementCounter.mutate("view");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  const handleRead = () => {
    if (book?.fileUrl) {
      window.open(book.fileUrl, "_blank");
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement du livre..." />;
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <BookOpen className="h-16 w-16 text-ops-tertiary" />
        <h2 className="text-2xl font-bold text-ops-primary">
          Livre introuvable
        </h2>
        <p className="text-ops-secondary">
          Ce livre n&apos;existe pas ou a été supprimé.
        </p>
        <Button asChild variant="outline" className="ops-btn-secondary">
          <Link href={STUDENT_ROUTES.BOOKS}>Retour aux livres</Link>
        </Button>
      </div>
    );
  }

  // Prepare header metrics
  const headerMetrics: { icon: typeof Calendar; value: React.ReactNode }[] = [
    {
      icon: Calendar,
      value: new Date(book.createdAt).toLocaleDateString("fr-FR"),
    },
    { icon: Eye, value: `${book.views || 0} vues` },
  ];

  // Prepare detail info items
  const detailItems = [
    { label: "Auteur", value: book.author },
    { label: "Catégorie", value: book.category, isBadge: true, badgeVariant: "brand" as const },
    { label: "Niveau", value: book.level, isBadge: true, badgeVariant: "outline" as const },
    { label: "École/Filière", value: book.school },
  ];

  if (book.subject) {
    detailItems.push({ label: "Matière", value: book.subject });
  }

  if (book.totalPages) {
    detailItems.push({ label: "Pages", value: `${book.totalPages} pages` });
  }

  if (book.fileSize) {
    detailItems.push({ label: "Taille", value: book.fileSize });
  }

  // Prepare related items for sidebar
  const relatedItemsData = relatedBooks.map((b) => ({
    id: b.id,
    title: b.title,
    thumbnailUrl: b.coverFile?.publicUrl,
    views: b.views,
    extraInfo: b.author,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <StudentDetailHeader
        backHref={STUDENT_ROUTES.BOOKS}
        title={book.title}
        metrics={headerMetrics}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Book Cover */}
          <Card className="ops-card border border-ops overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Cover Image */}
                <div className="relative w-48 h-64 mx-auto sm:mx-0 shrink-0 rounded-lg overflow-hidden shadow-lg">
                  {book.coverFile?.publicUrl ? (
                    <SupabaseImage
                      src={book.coverFile.publicUrl}
                      alt={book.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center">
                      <BookOpen className="h-20 w-20 text-brand-500/30" />
                    </div>
                  )}
                </div>

                {/* Book Quick Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-lg text-ops-secondary">
                      par <span className="font-semibold">{book.author}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
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
                    {book.totalPages && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {book.totalPages} pages
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleRead}
                      className="flex-1 ops-btn-primary"
                      disabled={!book.fileUrl}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Lire
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <StudentDetailCard title="Description">
            {book.description ? (
              <p className="text-ops-secondary whitespace-pre-wrap">
                {book.description}
              </p>
            ) : (
              <p className="text-ops-tertiary italic">
                Aucune description disponible
              </p>
            )}
          </StudentDetailCard>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <StudentDetailCard title="Étiquettes">
              <div className="flex flex-wrap gap-2">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-[rgb(var(--brand-400))] border border-[rgb(var(--brand-200))] dark:border-[rgb(var(--brand-800))]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </StudentDetailCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <StudentDetailInfo title="Détails" items={detailItems} />

          {/* Related Books */}
          <StudentRelatedItems
            title="Livres Similaires"
            description="Vous pourriez aussi aimer"
            items={relatedItemsData}
            getHref={(id) => STUDENT_ROUTES.BOOK(id)}
            fallbackIcon={BookOpen}
            maxItems={5}
            thumbnailAspect="book"
          />
        </div>
      </div>
    </div>
  );
}
