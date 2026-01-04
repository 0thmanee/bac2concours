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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { VideoStatus, FileType } from "@prisma/client";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVideoSchema,
  type CreateVideoInput,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
} from "@/lib/validations/video.validation";
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
  const queryClient = useQueryClient();
  const uploadFileMutation = useUploadFile();
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Fetch filter options
  const { data: filtersData } = useQuery({
    queryKey: ["admin-videos-filters"],
    queryFn: async () => {
      const res = await fetch("/api/videos/filter-options");
      if (!res.ok) throw new Error("Failed to fetch filter options");
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(createVideoSchema),
    defaultValues: {
      status: VideoStatus.ACTIVE,
      isPublic: true,
      tags: [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = form;

  const watchedTags = (watch("tags") as string[]) || [];
  const watchedUrl = watch("url");
  const watchedStatus = watch("status") || VideoStatus.ACTIVE;
  const watchedIsPublic = watch("isPublic") ?? true;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateVideoInput) => {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create video");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast.success("Vidéo créée avec succès");
      router.push(ADMIN_ROUTES.VIDEOS);
    },
  });

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
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
      );
    }
  };

  const categories = filtersData?.data?.categories || [];
  const schools = filtersData?.data?.schools || [];
  const levels = filtersData?.data?.levels || [];
  const subjects = filtersData?.data?.subjects || [];

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
                  <p className="text-xs text-green-600">
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
                  {...register("duration", { valueAsNumber: true })}
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
                  <Select onValueChange={(value) => setValue("school", value)}>
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
                          <SelectItem value="Toutes Filières">Toutes Filières</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.school && (
                    <p className="text-xs text-destructive">
                      {errors.school.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Niveau <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("level", value)}>
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
                          <SelectItem value="Tous Niveaux">Tous Niveaux</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-xs text-destructive">
                      {errors.level.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Catégorie <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
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
                          <SelectItem value="Français">Français</SelectItem>
                          <SelectItem value="Anglais">Anglais</SelectItem>
                          <SelectItem value="Philosophie">Philosophie</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Matière <span className="text-destructive">*</span>
                  </Label>
                  <Select onValueChange={(value) => setValue("subject", value)}>
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
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-xs text-destructive">
                      {errors.subject.message}
                    </p>
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
                  {/* Auto-detected YouTube thumbnail */}
                  {autoThumbnail && !thumbnailPreview && (
                    <div className="space-y-2">
                      <p className="text-xs text-ops-tertiary">
                        Miniature YouTube détectée:
                      </p>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-ops">
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
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-ops">
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
                  ) : !autoThumbnail && (
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-ops rounded-lg cursor-pointer hover:border-[rgb(var(--brand-500))] transition-colors"
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
                      className="flex items-center justify-center w-full h-10 border border-ops rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
              helpText="Utilisez des étiquettes pertinentes pour améliorer la recherche"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
