"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle, X, Plus } from "lucide-react";
import { useCreateBook, useBookFilters } from "@/lib/hooks/use-books";
import { createBookSchema, type CreateBookInput } from "@/lib/validations/book.validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { BookStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export default function NewBookPage() {
  const router = useRouter();
  const createMutation = useCreateBook();
  const { data: filtersData } = useBookFilters();
  const [newTag, setNewTag] = useState("");

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

  const addTag = () => {
    if (newTag && !watchedTags.includes(newTag)) {
      setValue("tags", [...watchedTags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setValue("tags", watchedTags.filter((t) => t !== tag));
  };

  const onSubmit = async (data: CreateBookInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.BOOK_CREATED || "Livre créé avec succès");
      router.push(ADMIN_ROUTES.BOOKS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const categories = filtersData?.data?.categories || [];
  const schools = filtersData?.data?.schools || [];
  const levels = filtersData?.data?.levels || [];
  const subjects = filtersData?.data?.subjects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 -ml-2 text-ops-secondary"
        >
          <Link href={ADMIN_ROUTES.BOOKS}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux Livres
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-ops-primary">
          Ajouter un Nouveau Livre
        </h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Ajoutez un nouveau livre à la bibliothèque
        </p>
      </div>

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
                  Détails essentiels du livre
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
                      École/Filière <span className="text-destructive">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("school", value)}>
                      <SelectTrigger id="school" className="ops-input h-9">
                        <SelectValue placeholder="Sélectionner une filière" />
                      </SelectTrigger>
                      <SelectContent className="ops-card">
                        {schools.length > 0 ? (
                          schools.map((school) => (
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
                      <p className="text-xs text-destructive">{errors.school.message}</p>
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
                          levels.map((level) => (
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
                      <p className="text-xs text-destructive">{errors.level.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                          categories.map((category) => (
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
                      <p className="text-xs text-destructive">{errors.category.message}</p>
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
                          subjects.map((subject) => (
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
                    onValueChange={(value) => setValue("language", value)}
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
              </CardContent>
            </Card>

            {/* File Information */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Informations du Fichier
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Détails du fichier PDF et de la couverture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileUrl" className="text-sm font-medium">
                    URL du Fichier PDF <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fileUrl"
                    {...register("fileUrl")}
                    placeholder="https://example.com/books/file.pdf"
                    className="ops-input h-9"
                  />
                  {errors.fileUrl && (
                    <p className="text-xs text-destructive">{errors.fileUrl.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fileName" className="text-sm font-medium">
                      Nom du Fichier <span className="text-destructive">*</span>
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
                      Taille du Fichier <span className="text-destructive">*</span>
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
                    Nombre de Pages <span className="text-destructive">*</span>
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

                <div className="space-y-2">
                  <Label htmlFor="coverUrl" className="text-sm font-medium">
                    URL de la Couverture <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                  </Label>
                  <Input
                    id="coverUrl"
                    {...register("coverUrl")}
                    placeholder="https://example.com/covers/image.jpg"
                    className="ops-input h-9"
                  />
                  {errors.coverUrl && (
                    <p className="text-xs text-destructive">{errors.coverUrl.message}</p>
                  )}
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
                      placeholder="ex: exercices, corrigés, bac"
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
                <p className="text-xs text-ops-tertiary">
                  Utilisez des étiquettes pertinentes pour améliorer la recherche
                </p>
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
                  disabled={isSubmitting || createMutation.isPending}
                  className="ops-btn-primary w-full h-9"
                >
                  {isSubmitting || createMutation.isPending ? "Création..." : "Créer le Livre"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || createMutation.isPending}
                  asChild
                  className="ops-btn-secondary w-full h-9"
                >
                  <Link href={ADMIN_ROUTES.BOOKS}>Annuler</Link>
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
                    defaultValue={BookStatus.ACTIVE}
                    onValueChange={(value) => setValue("status", value as BookStatus)}
                  >
                    <SelectTrigger id="status" className="ops-input h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value={BookStatus.ACTIVE}>Actif</SelectItem>
                      <SelectItem value={BookStatus.INACTIVE}>Inactif</SelectItem>
                      <SelectItem value={BookStatus.PROCESSING}>En traitement</SelectItem>
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
                    defaultChecked={true}
                    {...register("isPublic")}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                </div>
              </CardContent>
            </Card>

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
