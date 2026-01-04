"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, Plus, ArrowLeft, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function EditVideoPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const videoId = params.videoId as string;

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [newTag, setNewTag] = useState("");
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
      router.push(ADMIN_ROUTES.VIDEOS);
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

  const addTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !watchedTags.includes(trimmed)) {
      setValue("tags", [...watchedTags, trimmed]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
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
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-ops-tertiary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <VideoIcon className="h-12 w-12 text-ops-tertiary" />
        <p className="text-ops-secondary">Vidéo introuvable</p>
        <Button asChild variant="outline" className="ops-btn-secondary">
          <Link href={ADMIN_ROUTES.VIDEOS}>Retour aux vidéos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="ops-btn-ghost h-8 w-8 p-0"
        >
          <Link href={ADMIN_ROUTES.VIDEOS}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">Modifier la Vidéo</h1>
          <p className="text-sm text-ops-secondary">
            Mettez à jour les informations de la vidéo
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Informations de Base
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Détails essentiels de la vidéo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            {/* Classification */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Classification
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Catégorisation et niveau académique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
              </CardContent>
            </Card>

            {/* Thumbnail */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Miniature
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Image de prévisualisation de la vidéo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          <SupabaseImage
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
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Étiquettes
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Ajoutez des mots-clés pour faciliter la recherche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-tag" className="text-sm font-medium">
                    Ajouter une Étiquette
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="add-tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="ex: cours, exercices, bac"
                      className="ops-input h-9"
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      variant="outline"
                      size="sm"
                      className="ops-btn-secondary h-9"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {watchedTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Étiquettes Ajoutées</Label>
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="ops-btn-primary w-full h-9"
                >
                  {isSubmitting || updateMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || updateMutation.isPending}
                  asChild
                  className="ops-btn-secondary w-full h-9"
                >
                  <Link href={ADMIN_ROUTES.VIDEOS}>Annuler</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Status & Visibility */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Statut & Visibilité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Statut
                  </Label>
                  <Select
                    value={watch("status")}
                    onValueChange={(value) => setValue("status", value as VideoStatus)}
                  >
                    <SelectTrigger id="status" className="ops-input h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value={VideoStatus.ACTIVE}>Actif</SelectItem>
                      <SelectItem value={VideoStatus.INACTIVE}>Inactif</SelectItem>
                      <SelectItem value={VideoStatus.PROCESSING}>En traitement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic" className="text-sm font-medium">
                      Public
                    </Label>
                    <p className="text-xs text-ops-tertiary">
                      Visible par tous les utilisateurs
                    </p>
                  </div>
                  <input
                    id="isPublic"
                    type="checkbox"
                    checked={watch("isPublic")}
                    {...register("isPublic")}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
