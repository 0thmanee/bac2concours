"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import { useBook, useUpdateBook } from "@/lib/hooks/use-books";
import { useDropdownOptions } from "@/lib/hooks/use-settings-resources";
import { useSchoolsForDropdown } from "@/lib/hooks/use-schools";
import { useUploadFile, useDeleteFile } from "@/lib/hooks/use-files";
import { updateBookSchema, type UpdateBookInput } from "@/lib/validations/book.validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils";
import { BookStatus, FileType } from "@prisma/client";
import { SupabaseImage } from "@/components/ui/supabase-image";
import {
  AdminFormHeader,
  AdminFormCard,
  AdminFormActions,
  AdminStatusVisibility,
  AdminTagsInput,
} from "@/components/admin";

const BOOK_STATUS_OPTIONS = [
  { value: BookStatus.ACTIVE, label: "Actif" },
  { value: BookStatus.INACTIVE, label: "Inactif" },
  { value: BookStatus.PROCESSING, label: "En traitement" },
];

export default function EditBookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const router = useRouter();
  const { data: bookData, isLoading } = useBook(bookId);
  const updateMutation = useUpdateBook(bookId);
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const { data: dropdownData, isLoading: isLoadingDropdowns } = useDropdownOptions();
  const { data: schoolsData, isLoading: isLoadingSchools } = useSchoolsForDropdown();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverId, setExistingCoverId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(updateBookSchema),
  });

  // Populate form when book data loads
  const book = bookData?.data;

  useEffect(() => {
    if (book && !isLoading) {
      reset({
        title: book.title || "",
        author: book.author || "",
        school: book.school || "",
        category: book.category || "",
        subject: book.subject || "",
        level: book.level || "",
        description: book.description || "",
        coverFileId: book.coverFileId || null,
        fileUrl: book.fileUrl || "",
        fileName: book.fileName || "",
        fileSize: book.fileSize || "",
        totalPages: book.totalPages || 0,
        language: book.language || "fr",
        tags: book.tags || [],
        status: book.status || BookStatus.ACTIVE,
        isPublic: book.isPublic ?? true,
      });
      
      // Set existing cover preview if available
      if (book.coverFile?.publicUrl) {
        setCoverPreview(book.coverFile.publicUrl);
        setExistingCoverId(book.coverFileId || null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, isLoading]);

  const watchedTags = (watch("tags") as string[]) || [];
  const watchedStatus = watch("status") || BookStatus.ACTIVE;
  const watchedIsPublic = watch("isPublic") ?? true;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverId(null);
    setValue("coverFileId", null);
  };

  const onSubmit = async (data: UpdateBookInput) => {
    try {
      // Clean NaN values
      if (Number.isNaN(data.totalPages)) {
        data.totalPages = undefined;
      }

      // Handle cover changes
      if (coverFile) {
        // New file uploaded - delete old one if exists
        if (book?.coverFileId) {
          try {
            await deleteFileMutation.mutateAsync(book.coverFileId);
          } catch (error) {
            console.error("Error deleting old cover:", error);
          }
        }

        // Upload new cover
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: coverFile,
          type: FileType.IMAGE,
          folder: "book-covers",
        });
        data.coverFileId = uploadResult.data.id;
      } else if (!existingCoverId && book?.coverFileId) {
        // Cover was removed (existingCoverId is null but book had one)
        try {
          await deleteFileMutation.mutateAsync(book.coverFileId);
        } catch (error) {
          console.error("Error deleting removed cover:", error);
        }
        data.coverFileId = null;
      }

      await updateMutation.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.BOOK_UPDATED);
      router.push(ADMIN_ROUTES.BOOK(bookId));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement du livre..." />;
  }

  if (!book) {
    return (
      <ErrorState
        message="Livre non trouvé"
        backHref={ADMIN_ROUTES.BOOKS}
        backLabel="Retour aux Livres"
      />
    );
  }

  const categories = dropdownData?.data?.categories || [];
  const levels = dropdownData?.data?.levels || [];
  const matieres = dropdownData?.data?.matieres || [];
  const schools = schoolsData?.data?.schools?.map(s => s.name) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour au Livre"
        backHref={ADMIN_ROUTES.BOOK(bookId)}
        title="Modifier le Livre"
        description="Mettre à jour les informations du livre"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <AdminFormCard
              title="Informations de Base"
              description="Détails essentiels du livre"
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Titre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="ex: Mathématiques - Analyse et Algèbre"
                  className="ops-input h-9"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author" className="text-sm font-medium">
                  Auteur <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="author"
                  {...register("author")}
                  placeholder="ex: Mohammed Alami & Fatima Zahra Bennani"
                  className="ops-input h-9"
                />
                {errors.author && (
                  <p className="text-xs text-destructive">{errors.author.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Description complète du livre et de son contenu"
                  rows={4}
                  className="ops-input resize-none"
                />
                <p className="text-xs text-ops-tertiary">
                  Fournir un aperçu du contenu du livre
                </p>
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message as string}</p>
                )}
              </div>
            </AdminFormCard>

            {/* Classification */}
            <AdminFormCard
              title="Classification"
              description="Catégorisation et niveau académique"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium">
                    École/Filière
                  </Label>
                  <Select
                    defaultValue={book.school}
                    onValueChange={(value) => setValue("school", value, { shouldValidate: true })}
                    disabled={isLoadingSchools}
                  >
                    <SelectTrigger id="school" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingSchools ? "Chargement..." : "Sélectionner une filière"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.school && (
                    <p className="text-xs text-destructive">{errors.school.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Niveau
                  </Label>
                  <Select
                    defaultValue={book.level}
                    onValueChange={(value) => setValue("level", value, { shouldValidate: true })}
                    disabled={isLoadingDropdowns}
                  >
                    <SelectTrigger id="level" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingDropdowns ? "Chargement..." : "Sélectionner un niveau"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {levels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-xs text-destructive">{errors.level.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Catégorie
                  </Label>
                  <Select
                    defaultValue={book.category}
                    onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
                    disabled={isLoadingDropdowns}
                  >
                    <SelectTrigger id="category" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingDropdowns ? "Chargement..." : "Sélectionner une catégorie"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Matière
                  </Label>
                  <Select
                    defaultValue={book.subject}
                    onValueChange={(value) => setValue("subject", value, { shouldValidate: true })}
                    disabled={isLoadingDropdowns}
                  >
                    <SelectTrigger id="subject" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingDropdowns ? "Chargement..." : "Sélectionner une matière"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {matieres.map((matiere) => (
                        <SelectItem key={matiere.value} value={matiere.value}>
                          {matiere.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-xs text-destructive">{errors.subject.message as string}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">
                  Langue
                </Label>
                <Select
                  defaultValue={book.language}
                  onValueChange={(value) => setValue("language", value, { shouldValidate: true })}
                >
                  <SelectTrigger id="language" className="ops-input h-9">
                    <SelectValue placeholder="Sélectionner une langue" />
                  </SelectTrigger>
                  <SelectContent className="ops-card">
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="ar">Arabe</SelectItem>
                    <SelectItem value="en">Anglais</SelectItem>
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-xs text-destructive">{errors.language.message as string}</p>
                )}
              </div>
            </AdminFormCard>

            {/* File Information */}
            <AdminFormCard
              title="Informations du Fichier"
              description="Détails du fichier PDF et de la couverture"
            >
              <div className="space-y-2">
                <Label htmlFor="cover" className="text-sm font-medium">
                  Image de Couverture <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <div className="space-y-2">
                  {coverPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-ops">
                        <SupabaseImage
                          src={coverPreview}
                          alt="Aperçu de la couverture"
                          fill
                          className="object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeCover}
                          disabled={deleteFileMutation.isPending}
                        >
                          {deleteFileMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <label
                        htmlFor="cover"
                        className="flex items-center justify-center w-full h-10 border border-ops rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <Upload className="h-4 w-4 text-ops-secondary mr-2" />
                        <span className="text-sm text-ops-secondary">Changer l&apos;image</span>
                        <input
                          id="cover"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleCoverChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="cover-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-ops rounded-lg cursor-pointer hover:border-[rgb(var(--brand-500))] transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-ops-tertiary mb-3" />
                        <p className="text-sm text-ops-secondary mb-1">Cliquez pour télécharger</p>
                        <p className="text-xs text-ops-tertiary">PNG, JPG, WEBP (max. 5MB)</p>
                      </div>
                      <input
                        id="cover-upload"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleCoverChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl" className="text-sm font-medium">
                  URL du Fichier PDF
                </Label>
                <Input
                  id="fileUrl"
                  {...register("fileUrl")}
                  placeholder="https://example.com/books/file.pdf"
                  className="ops-input h-9"
                />
                {errors.fileUrl && (
                  <p className="text-xs text-destructive">{errors.fileUrl.message as string}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fileName" className="text-sm font-medium">
                    Nom du Fichier
                  </Label>
                  <Input
                    id="fileName"
                    {...register("fileName")}
                    placeholder="livre-maths.pdf"
                    className="ops-input h-9"
                  />
                  {errors.fileName && (
                    <p className="text-xs text-destructive">{errors.fileName.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileSize" className="text-sm font-medium">
                    Taille du Fichier
                  </Label>
                  <Input
                    id="fileSize"
                    {...register("fileSize")}
                    placeholder="25.4 MB"
                    className="ops-input h-9"
                  />
                  {errors.fileSize && (
                    <p className="text-xs text-destructive">{errors.fileSize.message as string}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPages" className="text-sm font-medium">
                  Nombre de Pages
                </Label>
                <Input
                  id="totalPages"
                  type="number"
                  min="1"
                  {...register("totalPages", { valueAsNumber: true })}
                  placeholder="456"
                  className="ops-input h-9"
                />
                {errors.totalPages && (
                  <p className="text-xs text-destructive">{errors.totalPages.message as string}</p>
                )}
              </div>
            </AdminFormCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <AdminFormActions
              submitLabel="Mettre à jour"
              loadingLabel="Mise à jour..."
              cancelHref={ADMIN_ROUTES.BOOK(bookId)}
              isSubmitting={isSubmitting}
              isPending={updateMutation.isPending}
            />

            {/* Status & Visibility */}
            <AdminStatusVisibility
              status={watchedStatus}
              onStatusChange={(value) => setValue("status", value as BookStatus, { shouldValidate: true })}
              statusOptions={BOOK_STATUS_OPTIONS}
              isPublic={watchedIsPublic}
              onIsPublicChange={(value) => setValue("isPublic", value)}
            />

            {/* Tags */}
            <AdminTagsInput
              tags={watchedTags}
              onChange={(tags) => setValue("tags", tags)}
              placeholder="ex: exercices, corrigés, bac"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
