"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Eye, FileText, BookOpen, User, School, Calendar } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useBook, useDeleteBook, useIncrementBookCounter } from "@/lib/hooks/use-books";
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
import { ErrorState } from "@/components/shared/error-state";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { format } from "date-fns";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { AdminDetailHeader } from "@/components/admin";

export default function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const router = useRouter();
  const { data: bookData, isLoading, error, isError } = useBook(bookId);
  const deleteMutation = useDeleteBook();
  const incrementCounter = useIncrementBookCounter(bookId);

  if (isLoading) {
    return <LoadingState message="Chargement du livre..." />;
  }

  if (isError || error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Livre non trouvé"}
        backHref={ADMIN_ROUTES.BOOKS}
        backLabel="Retour aux Livres"
      />
    );
  }

  const book = bookData?.data;

  if (!book) {
    return (
      <ErrorState
        message="Livre non trouvé"
        backHref={ADMIN_ROUTES.BOOKS}
        backLabel="Retour aux Livres"
      />
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(bookId);
      toast.success(MESSAGES.SUCCESS.BOOK_DELETED);
      router.push(ADMIN_ROUTES.BOOKS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      INACTIVE: "bg-linear-to-r from-gray-50 to-gray-100 text-gray-600 border-border",
      PROCESSING: "bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      PROCESSING: "En traitement",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${styles[status] || styles.ACTIVE}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminDetailHeader
        backLabel="Retour aux Livres"
        backHref={ADMIN_ROUTES.BOOKS}
        title={book.title}
        badges={
          <>
            {getStatusBadge(book.status)}
            {book.isPublic && <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] border border-[rgb(var(--brand-200))]">Public</span>}
          </>
        }
        subtitle={
          <>
            <User className="h-4 w-4" />
            {book.author}
          </>
        }
        description={book.description || undefined}
        actions={
          <>
            <Button asChild variant="outline" className="ops-btn-secondary h-9 gap-2">
              <Link href={ADMIN_ROUTES.BOOK_EDIT(bookId)}>
                <Edit className="h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="ops-btn-secondary h-9 gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le Livre</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &ldquo;{book.title}&rdquo; ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      {/* Metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Vues"
          value={book.views?.toLocaleString() || "0"}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Pages"
          value={book.totalPages?.toLocaleString() || "0"}
          icon={FileText}
          color="purple"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Book Preview */}
          {book.coverFile?.publicUrl && (
            <Card className="ops-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Aperçu de la Couverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <SupabaseImage
                    src={book.coverFile.publicUrl}
                    alt={book.title}
                    width={300}
                    height={400}
                    className="rounded-lg shadow-lg object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classification */}
          <Card className="ops-card border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-ops-primary">
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Catégorie</p>
                  <p className="text-base text-ops-primary mt-1">{book.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Matière</p>
                  <p className="text-base text-ops-primary mt-1">{book.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">École/Filière</p>
                  <p className="text-base text-ops-primary mt-1 flex items-center gap-2">
                    <School className="h-4 w-4" />
                    {book.school}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Niveau</p>
                  <p className="text-base text-ops-primary mt-1">{book.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Langue</p>
                  <p className="text-base text-ops-primary mt-1">
                    {book.language === "fr" ? "Français" : book.language === "ar" ? "Arabe" : book.language === "en" ? "Anglais" : book.language}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <Card className="ops-card border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Étiquettes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] border border-[rgb(var(--brand-200))]">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Information */}
          <Card className="ops-card border border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Informations du Fichier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-ops-tertiary">Nom du Fichier</p>
                <p className="text-sm text-ops-primary mt-1 break-all">{book.fileName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-ops-tertiary">Taille</p>
                <p className="text-sm text-ops-primary mt-1">{book.fileSize}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-ops-tertiary">Nombre de Pages</p>
                <p className="text-sm text-ops-primary mt-1 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {book.totalPages} pages
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upload Information */}
          <Card className="ops-card border border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Informations de Publication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-ops-tertiary">Téléchargé par</p>
                <p className="text-sm text-ops-primary mt-1">
                  {book.uploadedBy?.name || "Utilisateur inconnu"}
                </p>
                {book.uploadedBy?.email && (
                  <p className="text-xs text-ops-tertiary">{book.uploadedBy.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-ops-tertiary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ajouté le
                </p>
                <p className="text-sm text-ops-primary mt-1">
                  {format(new Date(book.createdAt), "d MMMM yyyy 'à' HH:mm")}
                </p>
              </div>
              {book.updatedAt && book.updatedAt !== book.createdAt && (
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Dernière modification</p>
                  <p className="text-sm text-ops-primary mt-1">
                    {format(new Date(book.updatedAt), "d MMMM yyyy 'à' HH:mm")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
