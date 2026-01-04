"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

import { ADMIN_ROUTES } from "@/lib/routes";
import { API_ROUTES } from "@/lib/constants";
import { VideoStatus } from "@prisma/client";
import { 
  updateVideoSchema, 
  type UpdateVideoInput,
  type VideoWithRelations 
} from "@/lib/validations/video.validation";
import { extractYouTubeId, getYouTubeThumbnailUrl } from "@/lib/validations/video.validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const videoId = params.videoId as string;

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [autoThumbnail, setAutoThumbnail] = useState<string | null>(null);

  // Fetch video data
  const { data: video, isLoading: videoLoading } = useQuery<VideoWithRelations>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.VIDEO(videoId));
      if (!response.ok) throw new Error("Failed to fetch video");
      return response.json();
    },
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["videos", "filter-options"],
    queryFn: async () => {
      const response = await fetch(API_ROUTES.VIDEOS_FILTERS);
      if (!response.ok) throw new Error("Failed to fetch filter options");
      return response.json();
    },
  });

  const schools = filterOptions?.schools || [];
  const levels = filterOptions?.levels || [];
  const categories = filterOptions?.categories || [];
  const subjects = filterOptions?.subjects || [];

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
    if (video) {
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
      } else if (video.youtubeId) {
        const ytThumbnail = getYouTubeThumbnailUrl(video.youtubeId);
        setAutoThumbnail(ytThumbnail);
      }
    }
  }, [video, reset]);

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

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateVideoInput) => {
      const response = await fetch(API_ROUTES.VIDEO(videoId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update video");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      toast.success("Vidéo mise à jour avec succès");
      router.push(ADMIN_ROUTES.VIDEO(videoId));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Miniature supprimée");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

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

  const removeThumbnail = async () => {
    if (video?.thumbnailFileId) {
      await deleteFileMutation.mutateAsync(video.thumbnailFileId);
    }
    setThumbnailPreview(null);
    setThumbnailFile(null);
  };

  const onSubmit = async (data: UpdateVideoInput) => {
    try {
      let thumbnailFileId = video?.thumbnailFileId;

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        // Delete old thumbnail first if exists
        if (thumbnailFileId) {
          await deleteFileMutation.mutateAsync(thumbnailFileId);
        }

        // Upload new thumbnail
        const formData = new FormData();
        formData.append("file", thumbnailFile);
        formData.append("type", "THUMBNAIL");

        const uploadResponse = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload thumbnail");
        }

        const uploadData = await uploadResponse.json();
        thumbnailFileId = uploadData.id;
      }

      // Update video with new thumbnail ID
      await updateMutation.mutateAsync({
        ...data,
        thumbnailFileId,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  if (videoLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-ops-tertiary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-ops-secondary">Vidéo introuvable</p>
        <Button asChild variant="outline" className="ops-btn-secondary">
          <a href={ADMIN_ROUTES.VIDEOS}>Retour aux vidéos</a>
        </Button>
      </div>
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
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
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
                    value={watch("school")}
                    onValueChange={(value) => setValue("school", value)}
                  >
                    <SelectTrigger id="school" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner une filière" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {schools.length > 0 ? (
                        schools.map((school: string) => (
                          <SelectItem key={school} value={school}>
                            {school}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Sciences Mathématiques">Sciences Mathématiques</SelectItem>
                          <SelectItem value="Sciences Physiques">Sciences Physiques</SelectItem>
                          <SelectItem value="Sciences de la Vie et de la Terre">Sciences de la Vie et de la Terre</SelectItem>
                          <SelectItem value="Sciences Économiques">Sciences Économiques</SelectItem>
                          <SelectItem value="Sciences Humaines">Sciences Humaines</SelectItem>
                          <SelectItem value="Toutes Filières">Toutes Filières</SelectItem>
                        </>
                      )}
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
                    value={watch("level")}
                    onValueChange={(value) => setValue("level", value)}
                  >
                    <SelectTrigger id="level" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {levels.length > 0 ? (
                        levels.map((level: string) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Terminale">Terminale</SelectItem>
                          <SelectItem value="Première">Première</SelectItem>
                          <SelectItem value="Seconde">Seconde</SelectItem>
                        </>
                      )}
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
                    value={watch("category")}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger id="category" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {categories.length > 0 ? (
                        categories.map((category: string) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                          <SelectItem value="Physique">Physique</SelectItem>
                          <SelectItem value="Chimie">Chimie</SelectItem>
                          <SelectItem value="SVT">SVT</SelectItem>
                          <SelectItem value="Philosophie">Philosophie</SelectItem>
                          <SelectItem value="Français">Français</SelectItem>
                          <SelectItem value="Arabe">Arabe</SelectItem>
                          <SelectItem value="Anglais">Anglais</SelectItem>
                        </>
                      )}
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
                    value={watch("subject")}
                    onValueChange={(value) => setValue("subject", value)}
                  >
                    <SelectTrigger id="subject" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {subjects.length > 0 ? (
                        subjects.map((subject: string) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                          <SelectItem value="Physique">Physique</SelectItem>
                          <SelectItem value="Chimie">Chimie</SelectItem>
                          <SelectItem value="SVT">SVT</SelectItem>
                          <SelectItem value="Philosophie">Philosophie</SelectItem>
                          <SelectItem value="Français">Français</SelectItem>
                          <SelectItem value="Arabe">Arabe</SelectItem>
                          <SelectItem value="Anglais">Anglais</SelectItem>
                        </>
                      )}
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
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-ops">
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
                        className="flex items-center justify-center w-full h-10 border border-ops rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                      <div className="relative w-full h-64 rounded-lg overflow-hidden border border-ops">
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
                        className="flex items-center justify-center w-full h-10 border border-ops rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-ops rounded-lg cursor-pointer hover:border-[rgb(var(--brand-500))] transition-colors"
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
              onStatusChange={(value) => setValue("status", value as VideoStatus)}
              statusOptions={VIDEO_STATUS_OPTIONS}
              isPublic={watchedIsPublic}
              onIsPublicChange={(value) => setValue("isPublic", value)}
            />

            {/* Tags */}
            <AdminTagsInput
              tags={watchedTags}
              onChange={(tags) => setValue("tags", tags)}
              placeholder="ex: cours, exercices, bac"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
