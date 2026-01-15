"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils";
import { VideoStatus, FileType } from "@/lib/enums";
import { SupabaseImage } from "@/components/ui/supabase-image";
import {
  createVideoSchema,
  type CreateVideoInput,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
} from "@/lib/validations/video.validation";
import { useCreateVideo } from "@/lib/hooks/use-videos";
import { useUploadFile } from "@/lib/hooks/use-files";
import {
  AdminFormHeader,
  AdminFormCard,
  AdminFormActions,
  AdminStatusVisibility,
  AdminTagsInput,
} from "@/components/admin";

const VIDEO_STATUS_OPTIONS = [
  { value: VideoStatus.ACTIVE, label: "Actif" },
  { value: VideoStatus.INACTIVE, label: "Inactif" },
  { value: VideoStatus.PROCESSING, label: "En traitement" },
];

export default function NewVideoPage() {
  const router = useRouter();
  const createMutation = useCreateVideo();
  const uploadFileMutation = useUploadFile();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createVideoSchema),
    defaultValues: {
      status: VideoStatus.ACTIVE,
      isPublic: true,
      tags: [],
      subjects: [],
    },
  });

  const watchedTags = (watch("tags") as string[]) || [];
  const watchedSubjects = (watch("subjects") as string[]) || [];
  const watchedUrl = watch("url");
  const watchedStatus = watch("status") || VideoStatus.ACTIVE;
  const watchedIsPublic = watch("isPublic") ?? true;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setValue("thumbnailFileId", undefined);
  };

  const onSubmit = async (data: CreateVideoInput) => {
    try {
      // Clean NaN values
      if (Number.isNaN(data.duration)) {
        data.duration = undefined;
      }

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: thumbnailFile,
          type: FileType.IMAGE,
          folder: "video-thumbnails",
        });
        data.thumbnailFileId = uploadResult.data.id;
      }

      await createMutation.mutateAsync(data);
      toast.success("Vidéo créée avec succès");
      router.push(ADMIN_ROUTES.VIDEOS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Auto-detect YouTube thumbnail
  const youtubeId = watchedUrl ? extractYouTubeId(watchedUrl) : null;
  const autoThumbnail = youtubeId ? getYouTubeThumbnailUrl(youtubeId, "hq") : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour aux Vidéos"
        backHref={ADMIN_ROUTES.VIDEOS}
        title="Ajouter une Nouvelle Vidéo"
        description="Ajoutez une nouvelle vidéo YouTube à la bibliothèque"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <AdminFormCard
              title="Informations de Base"
              description="Détails essentiels de la vidéo"
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Titre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="ex: Cours complet de Mathématiques - Analyse"
                  className="ops-input h-9"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">
                  URL YouTube <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  {...register("url")}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="ops-input h-9"
                />
                {errors.url && (
                  <p className="text-xs text-destructive">
                    {errors.url.message}
                  </p>
                )}
                {youtubeId && (
                  <p className="text-xs text-success">
                    ✓ Vidéo YouTube détectée: {youtubeId}
                  </p>
                )}
                <p className="text-xs text-ops-tertiary">
                  Format: youtube.com/watch?v=... ou youtu.be/...
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Description complète de la vidéo"
                  rows={4}
                  className="ops-input resize-none"
                />
                <p className="text-xs text-ops-tertiary">
                  Fournir un aperçu du contenu de la vidéo
                </p>
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Durée (secondes) <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  {...register("duration", {
                    setValueAs: (v) => v === "" || v === null ? undefined : parseInt(v, 10)
                  })}
                  placeholder="ex: 1800 pour 30 minutes"
                  className="ops-input h-9"
                />
                {errors.duration && (
                  <p className="text-xs text-destructive">
                    {errors.duration.message}
                  </p>
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
                    École/Filière <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="school"
                    {...register("school")}
                    placeholder="ex: Sciences Mathématiques A"
                    className="ops-input h-9"
                  />
                  {errors.school && (
                    <p className="text-xs text-destructive">{errors.school.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Niveau <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="level"
                    {...register("level")}
                    placeholder="ex: Terminale"
                    className="ops-input h-9"
                  />
                  {errors.level && (
                    <p className="text-xs text-destructive">{errors.level.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Catégorie <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="category"
                    {...register("category")}
                    placeholder="ex: Cours"
                    className="ops-input h-9"
                  />
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <AdminTagsInput
                tags={watchedSubjects}
                onChange={(tags: string[]) => setValue("subjects", tags, { shouldValidate: true })}
                cardTitle="Matières"
                cardDescription="Ajoutez une ou plusieurs matières couvertes par cette vidéo"
                placeholder="Ajouter une matière (ex: Mathématiques, Physique)"
                withCard={false}
              />
              {errors.subjects && (
                <p className="text-xs text-destructive">{errors.subjects.message as string}</p>
              )}
            </AdminFormCard>

            {/* Thumbnail */}
            <AdminFormCard
              title="Miniature"
              description="Image de prévisualisation de la vidéo"
            >
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-sm font-medium">
                  Image de Miniature <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <div className="space-y-2">
                  {/* Auto-detected YouTube thumbnail */}
                  {autoThumbnail && !thumbnailPreview && (
                    <div className="space-y-2">
                      <p className="text-xs text-ops-tertiary">
                        Miniature YouTube détectée:
                      </p>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                        <Image
                          src={autoThumbnail}
                          alt="YouTube thumbnail"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-ops-tertiary">
                        Vous pouvez télécharger une miniature personnalisée ci-dessous
                      </p>
                    </div>
                  )}

                  {/* Custom thumbnail preview */}
                  {thumbnailPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                        <SupabaseImage
                          src={thumbnailPreview}
                          alt="Aperçu de la miniature"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeThumbnail}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <label
                        htmlFor="thumbnail"
                        className="flex items-center justify-center w-full h-10 border border-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <Upload className="h-4 w-4 text-ops-secondary mr-2" />
                        <span className="text-sm text-ops-secondary">Changer l&apos;image</span>
                        <input
                          id="thumbnail"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                    </div>
                  ) : !autoThumbnail && (
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-brand-500 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-ops-tertiary mb-3" />
                        <p className="text-sm text-ops-secondary mb-1">Cliquez pour télécharger</p>
                        <p className="text-xs text-ops-tertiary">PNG, JPG, WEBP (max. 5MB)</p>
                      </div>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  )}

                  {/* Upload button when auto thumbnail is shown */}
                  {autoThumbnail && !thumbnailPreview && (
                    <label
                      htmlFor="thumbnail-custom"
                      className="flex items-center justify-center w-full h-10 border border-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Upload className="h-4 w-4 text-ops-secondary mr-2" />
                      <span className="text-sm text-ops-secondary">Télécharger une miniature personnalisée</span>
                      <input
                        id="thumbnail-custom"
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </AdminFormCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <AdminFormActions
              submitLabel="Créer la Vidéo"
              loadingLabel="Création..."
              cancelHref={ADMIN_ROUTES.VIDEOS}
              isSubmitting={isSubmitting}
              isPending={createMutation.isPending}
            />

            {/* Status & Visibility */}
            <AdminStatusVisibility
              status={watchedStatus}
              onStatusChange={(value) => setValue("status", value as VideoStatus, { shouldValidate: true })}
              statusOptions={VIDEO_STATUS_OPTIONS}
              isPublic={watchedIsPublic}
              onIsPublicChange={(value) => setValue("isPublic", value, { shouldValidate: true })}
            />

            {/* Tags */}
            <AdminTagsInput
              tags={watchedTags}
              onChange={(tags) => setValue("tags", tags, { shouldValidate: true })}
              placeholder="ex: cours, exercices, bac"
              helpText="Utilisez des étiquettes pertinentes pour améliorer la recherche"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
