"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, X, Plus, Upload } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVideoSchema,
  type CreateVideoInput,
  extractYouTubeId,
  getYouTubeThumbnailUrl,
} from "@/lib/validations/video.validation";
import { useUploadFile } from "@/lib/hooks/use-files";

export default function NewVideoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const uploadFileMutation = useUploadFile();
  const [newTag, setNewTag] = useState("");
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

  const addTag = () => {
    if (newTag && !watchedTags.includes(newTag)) {
      setValue("tags", [...watchedTags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setValue("tags", watchedTags.filter((t) => t !== tag));
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
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={ADMIN_ROUTES.VIDEOS}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux Vidéos
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Ajouter une Nouvelle Vidéo</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Ajoutez une nouvelle vidéo YouTube à la bibliothèque
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de Base</CardTitle>
                <CardDescription>Détails essentiels de la vidéo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titre <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="ex: Cours complet de Mathématiques - Analyse"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">
                    URL YouTube <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="url"
                    {...register("url")}
                    placeholder="https://www.youtube.com/watch?v=..."
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description{" "}
                    <span className="text-xs text-gray-500">(Optionnel)</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Description complète de la vidéo"
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Durée (secondes){" "}
                    <span className="text-xs text-gray-500">(Optionnel)</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    {...register("duration", { valueAsNumber: true })}
                    placeholder="ex: 1800 pour 30 minutes"
                  />
                  {errors.duration && (
                    <p className="text-xs text-destructive">
                      {errors.duration.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Classification */}
            <Card>
              <CardHeader>
                <CardTitle>Classification</CardTitle>
                <CardDescription>
                  Catégorisation et niveau académique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="school">
                      École/Filière <span className="text-destructive">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("school", value)}>
                      <SelectTrigger id="school">
                        <SelectValue placeholder="Sélectionner une filière" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.length > 0 ? (
                          schools.map((school: string) => (
                            <SelectItem key={school} value={school}>
                              {school}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Sciences Mathématiques">
                              Sciences Mathématiques
                            </SelectItem>
                            <SelectItem value="Sciences Physiques">
                              Sciences Physiques
                            </SelectItem>
                            <SelectItem value="Sciences de la Vie et de la Terre">
                              Sciences de la Vie et de la Terre
                            </SelectItem>
                            <SelectItem value="Sciences Économiques">
                              Sciences Économiques
                            </SelectItem>
                            <SelectItem value="Toutes Filières">
                              Toutes Filières
                            </SelectItem>
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
                    <Label htmlFor="level">
                      Niveau <span className="text-destructive">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("level", value)}>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                      <SelectContent>
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
                            <SelectItem value="Tous Niveaux">
                              Tous Niveaux
                            </SelectItem>
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
                    <Label htmlFor="category">
                      Catégorie <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("category", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map((category: string) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Mathématiques">
                              Mathématiques
                            </SelectItem>
                            <SelectItem value="Physique">Physique</SelectItem>
                            <SelectItem value="Chimie">Chimie</SelectItem>
                            <SelectItem value="SVT">SVT</SelectItem>
                            <SelectItem value="Français">Français</SelectItem>
                            <SelectItem value="Anglais">Anglais</SelectItem>
                            <SelectItem value="Philosophie">
                              Philosophie
                            </SelectItem>
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
                    <Label htmlFor="subject">
                      Matière <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={(value) => setValue("subject", value)}
                    >
                      <SelectTrigger id="subject">
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length > 0 ? (
                          subjects.map((subject: string) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="Mathématiques">
                              Mathématiques
                            </SelectItem>
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

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Ajouter un tag"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {watchedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Miniature</CardTitle>
                <CardDescription>
                  Image de prévisualisation de la vidéo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto-detected YouTube thumbnail */}
                {autoThumbnail && !thumbnailPreview && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      Miniature YouTube détectée:
                    </p>
                    <Image
                      src={autoThumbnail}
                      alt="YouTube thumbnail"
                      width={320}
                      height={180}
                      className="w-full rounded-lg"
                    />
                    <p className="text-xs text-gray-500">
                      Vous pouvez télécharger une miniature personnalisée
                      ci-dessous
                    </p>
                  </div>
                )}

                {/* Custom thumbnail */}
                {thumbnailPreview ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <SupabaseImage
                        src={thumbnailPreview}
                        alt="Miniature"
                        width={300}
                        height={169}
                        className="w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <label className="w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="mr-2 h-4 w-4" />
                          Changer la miniature
                        </span>
                      </Button>
                    </label>
                  </div>
                ) : !autoThumbnail ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cliquez pour télécharger
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <label className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Miniature personnalisée
                      </span>
                    </Button>
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("status", value as VideoStatus)
                    }
                    defaultValue={VideoStatus.ACTIVE}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={VideoStatus.ACTIVE}>Actif</SelectItem>
                      <SelectItem value={VideoStatus.INACTIVE}>
                        Inactif
                      </SelectItem>
                      <SelectItem value={VideoStatus.PROCESSING}>
                        En traitement
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    {...register("isPublic")}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic" className="font-normal">
                    Vidéo publique
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || createMutation.isPending}
              >
                {isSubmitting || createMutation.isPending
                  ? "Création..."
                  : "Créer la Vidéo"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
                disabled={isSubmitting || createMutation.isPending}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
