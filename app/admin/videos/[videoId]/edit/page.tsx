"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";

import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils";
import { VideoStatus, FileType } from "@/lib/enums";
import { 
  updateVideoSchema, 
  type UpdateVideoInput,
} from "@/lib/validations/video.validation";
import { extractYouTubeId, getYouTubeThumbnailUrl } from "@/lib/validations/video.validation";
import { useVideo, useUpdateVideo } from "@/lib/hooks/use-videos";
import { useDropdownOptions } from "@/lib/hooks/use-settings-resources";
import { useSchoolsForDropdown } from "@/lib/hooks/use-schools";
import { useUploadFile, useDeleteFile } from "@/lib/hooks/use-files";
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

export default function EditVideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const router = useRouter();
  const { data: videoData, isLoading } = useVideo(videoId);
  const updateMutation = useUpdateVideo(videoId);
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const { data: dropdownData, isLoading: isLoadingDropdowns } = useDropdownOptions();
  const { data: schoolsData, isLoading: isLoadingSchools } = useSchoolsForDropdown();

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null);
  const [existingThumbnailId, setExistingThumbnailId] = useState<string | null>(null);

  const video = videoData?.data;

  const schools = schoolsData?.data?.schools?.map(s => s.name) || [];
  const levels = dropdownData?.data?.levels || [];
  const categories = dropdownData?.data?.categories || [];
  const matieres = dropdownData?.data?.matieres || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UpdateVideoInput>({
    resolver: zodResolver(updateVideoSchema),
  });

  const watchedUrl = watch("url");
  const watchedTags = watch("tags") || [];
  const watchedStatus = watch("status") || VideoStatus.ACTIVE;
  const watchedIsPublic = watch("isPublic") ?? true;

  // Initialize form with video data
  useEffect(() => {
    if (video && !isLoading) {
      reset({
        title: video.title,
        description: video.description || "",
        url: video.url,
        duration: video.duration ?? undefined,
        school: video.school,
        level: video.level,
        category: video.category,
        subject: video.subject || "",
        tags: video.tags,
        status: video.status as VideoStatus,
        isPublic: video.isPublic,
      });

      // Set thumbnail preview
      if (video.thumbnailFile?.publicUrl) {
        setThumbnailPreview(video.thumbnailFile.publicUrl);
        setExistingThumbnailId(video.thumbnailFileId || null);
      } else if (video.youtubeId) {
        const ytThumbnail = getYouTubeThumbnailUrl(video.youtubeId);
        setAutoThumbnail(ytThumbnail);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id, isLoading]);

  // Auto-detect YouTube thumbnail when URL changes
  useEffect(() => {
    if (watchedUrl) {
      const youtubeId = extractYouTubeId(watchedUrl);
      if (youtubeId) {
        const ytThumbnail = getYouTubeThumbnailUrl(youtubeId);
        setAutoThumbnail(ytThumbnail);
      } else {
        setAutoThumbnail(null);
      }
    } else {
      setAutoThumbnail(null);
    }
  }, [watchedUrl]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La taille de l'image ne doit pas dépasser 5MB");
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setExistingThumbnailId(null);
  };

  const onSubmit = async (data: UpdateVideoInput) => {
    try {
      // Clean NaN values
      if (Number.isNaN(data.duration)) {
        data.duration = undefined;
      }

      // Handle thumbnail changes
      if (thumbnailFile) {
        // New file uploaded - delete old one if exists
        if (video?.thumbnailFileId) {
          try {
            await deleteFileMutation.mutateAsync(video.thumbnailFileId);
          } catch {
            // Continue even if delete fails
          }
        }

        // Upload new thumbnail
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: thumbnailFile,
          type: FileType.IMAGE,
          folder: "video-thumbnails",
        });
        data.thumbnailFileId = uploadResult.data.id;
      } else if (!existingThumbnailId && video?.thumbnailFileId) {
        // Thumbnail was removed (existingThumbnailId is null but video had one)
        try {
          await deleteFileMutation.mutateAsync(video.thumbnailFileId);
        } catch {
          // Continue even if delete fails
        }
        data.thumbnailFileId = null;
      }

      await updateMutation.mutateAsync(data);
      toast.success("Vidéo mise à jour avec succès");
      router.push(ADMIN_ROUTES.VIDEOS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement de la vidéo..." />;
  }

  if (!video) {
    return (
      <ErrorState
        message="Vidéo non trouvée"
        backHref={ADMIN_ROUTES.VIDEOS}
        backLabel="Retour aux Vidéos"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour à la Vidéo"
        backHref={ADMIN_ROUTES.VIDEO(videoId)}
        title="Modifier la Vidéo"
        description="Mettez à jour les informations de la vidéo"
      />

      {/* Form */}
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
                  placeholder="ex: Cours de Mathématiques - Les Dérivées"
                  className="ops-input h-9"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message as string}</p>
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
                  <p className="text-xs text-destructive">{errors.url.message as string}</p>
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
                  <p className="text-xs text-destructive">{errors.description.message as string}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Durée <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Input
                  id="duration"
                  {...register("duration")}
                  placeholder="ex: 15:30"
                  className="ops-input h-9"
                />
                <p className="text-xs text-ops-tertiary">
                  Format: MM:SS ou HH:MM:SS
                </p>
                {errors.duration && (
                  <p className="text-xs text-destructive">{errors.duration.message as string}</p>
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
                    value={watch("school") || ""}
                    onValueChange={(value) => setValue("school", value, { shouldValidate: true })}
                    disabled={isLoadingSchools}
                  >
                    <SelectTrigger id="school" className="ops-input h-9">
                      <SelectValue placeholder={isLoadingSchools ? "Chargement..." : "Sélectionner une filière"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {schools.map((school: string) => (
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
                    value={watch("level") || ""}
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
                    value={watch("category") || ""}
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
                    value={watch("subject") || ""}
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
                  {thumbnailPreview ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
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
                  ) : autoThumbnail ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-border">
                        <Image
                          src={autoThumbnail}
                          alt="Miniature YouTube auto-détectée"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs text-ops-tertiary">
                        Miniature YouTube auto-détectée. Vous pouvez télécharger une image personnalisée ci-dessous.
                      </p>
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex items-center justify-center w-full h-10 border border-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <Upload className="h-4 w-4 text-ops-secondary mr-2" />
                        <span className="text-sm text-ops-secondary">Télécharger une miniature personnalisée</span>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <label
                      htmlFor="thumbnail-upload-empty"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-brand-500 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-10 w-10 text-ops-tertiary mb-3" />
                        <p className="text-sm text-ops-secondary mb-1">Cliquez pour télécharger</p>
                        <p className="text-xs text-ops-tertiary">PNG, JPG, WEBP (max. 5MB)</p>
                      </div>
                      <input
                        id="thumbnail-upload-empty"
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
              submitLabel="Mettre à jour"
              loadingLabel="Mise à jour..."
              cancelHref={ADMIN_ROUTES.VIDEO(videoId)}
              isSubmitting={isSubmitting}
              isPending={updateMutation.isPending}
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
            />
          </div>
        </div>
      </form>
    </div>
  );
}
