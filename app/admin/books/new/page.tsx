"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Upload } from "lucide-react";
import { useCreateBook } from "@/lib/hooks/use-books";
import { useDropdownOptions } from "@/lib/hooks/use-settings-resources";
import { useSchoolsForDropdown } from "@/lib/hooks/use-schools";
import { useUploadFile } from "@/lib/hooks/use-files";
import { createBookSchema, type CreateBookInput } from "@/lib/validations/book.validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
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

export default function NewBookPage() {
  const router = useRouter();
  const createMutation = useCreateBook();
  const uploadFileMutation = useUploadFile();
  const { data: dropdownData, isLoading: isLoadingDropdowns } = useDropdownOptions();
  const { data: schoolsData, isLoading: isLoadingSchools } = useSchoolsForDropdown();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      language: "fr",
      status: BookStatus.ACTIVE,
      isPublic: true,
      tags: [],
      totalPages: 0,
    },
  });

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
    setValue("coverFileId", undefined);
  };

  const onSubmit = async (data: CreateBookInput) => {
    try {
      // Clean NaN values
      if (Number.isNaN(data.totalPages)) {
        data.totalPages = 0;
      }

      // Upload cover if provided
      if (coverFile) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: coverFile,
          type: FileType.IMAGE,
          folder: "book-covers",
        });
        data.coverFileId = uploadResult.data.id;
      }

      await createMutation.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.BOOK_CREATED || "Livre créé avec succès");
      router.push(ADMIN_ROUTES.BOOKS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const categories = dropdownData?.data?.categories || [];
  const levels = dropdownData?.data?.levels || [];
  const matieres = dropdownData?.data?.matieres || [];
  const schools = schoolsData?.data?.schools?.map(s => s.name) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour aux Livres"
        backHref={ADMIN_ROUTES.BOOKS}
        title="Ajouter un Nouveau Livre"
        description="Ajoutez un nouveau livre à la bibliothèque"
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
                  <p className="text-xs text-destructive">{errors.title.message}</p>
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
                  <p className="text-xs text-destructive">{errors.author.message}</p>
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
                  <p className="text-xs text-destructive">{errors.description.message}</p>
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
                  <Select onValueChange={(value) => setValue("school", value, { shouldValidate: true })} disabled={isLoadingSchools}>
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
                    <p className="text-xs text-destructive">{errors.school.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Niveau
                  </Label>
                  <Select onValueChange={(value) => setValue("level", value, { shouldValidate: true })} disabled={isLoadingDropdowns}>
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
                    <p className="text-xs text-destructive">{errors.level.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Catégorie
                  </Label>
                  <Select onValueChange={(value) => setValue("category", value, { shouldValidate: true })} disabled={isLoadingDropdowns}>
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
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Matière
                  </Label>
                  <Select onValueChange={(value) => setValue("subject", value, { shouldValidate: true })} disabled={isLoadingDropdowns}>
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
                    <p className="text-xs text-destructive">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">
                  Langue
                </Label>
                <Select
                  defaultValue="fr"
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
                  <p className="text-xs text-destructive">{errors.language.message}</p>
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
                        >
                          <X className="h-4 w-4" />
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
                      htmlFor="cover"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-ops rounded-lg cursor-pointer hover:border-[rgb(var(--brand-500))] transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-ops-tertiary mb-3" />
                        <p className="text-sm text-ops-secondary mb-1">Cliquez pour télécharger</p>
                        <p className="text-xs text-ops-tertiary">PNG, JPG, WEBP (max. 5MB)</p>
                      </div>
                      <input
                        id="cover"
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
                  Lien Google Drive du PDF <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fileUrl"
                  {...register("fileUrl")}
                  placeholder="https://drive.google.com/file/d/..."
                  className="ops-input h-9"
                />
                {errors.fileUrl && (
                  <p className="text-xs text-destructive">{errors.fileUrl.message}</p>
                )}
                <p className="text-xs text-ops-tertiary">
                  Assurez-vous que le lien est public et accessible à tous
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fileName" className="text-sm font-medium">
                    Nom du Fichier <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                  </Label>
                  <Input
                    id="fileName"
                    {...register("fileName")}
                    placeholder="livre-maths.pdf"
                    className="ops-input h-9"
                  />
                  {errors.fileName && (
                    <p className="text-xs text-destructive">{errors.fileName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileSize" className="text-sm font-medium">
                    Taille du Fichier <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                  </Label>
                  <Input
                    id="fileSize"
                    {...register("fileSize")}
                    placeholder="25.4 MB"
                    className="ops-input h-9"
                  />
                  {errors.fileSize && (
                    <p className="text-xs text-destructive">{errors.fileSize.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPages" className="text-sm font-medium">
                  Nombre de Pages <span className="text-xs text-ops-tertiary">(Optionnel)</span>
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
                  <p className="text-xs text-destructive">{errors.totalPages.message}</p>
                )}
              </div>
            </AdminFormCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <AdminFormActions
              submitLabel="Créer le Livre"
              loadingLabel="Création..."
              cancelHref={ADMIN_ROUTES.BOOKS}
              isSubmitting={isSubmitting}
              isPending={createMutation.isPending}
            />

            {/* Status & Visibility */}
            <AdminStatusVisibility
              status={watchedStatus}
              onStatusChange={(value) => setValue("status", value as BookStatus, { shouldValidate: true })}
              statusOptions={BOOK_STATUS_OPTIONS}
              isPublic={watchedIsPublic}
              onIsPublicChange={(value) => setValue("isPublic", value, { shouldValidate: true })}
            />

            {/* Tags */}
            <AdminTagsInput
              tags={watchedTags}
              onChange={(tags) => setValue("tags", tags, { shouldValidate: true })}
              placeholder="ex: exercices, corrigés, bac"
              helpText="Utilisez des étiquettes pertinentes pour améliorer la recherche"
            />

            {/* Help */}
            <Card className="ops-card border border-ops ops-status-info">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Besoin d&apos;aide ?</p>
                    <p className="text-xs">
                      Assurez-vous que les URLs des fichiers sont accessibles et que toutes les
                      informations requises sont correctes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
