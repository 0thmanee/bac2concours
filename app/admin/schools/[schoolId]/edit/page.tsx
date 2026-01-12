"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils";
import { SchoolStatus, SchoolType, FileType } from "@/lib/enums";
import {
  updateSchoolSchema,
  type UpdateSchoolInput,
} from "@/lib/validations/school.validation";
import { useSchool, useUpdateSchool } from "@/lib/hooks/use-schools";
import { useUploadFile, useDeleteFile } from "@/lib/hooks/use-files";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  AdminFormHeader,
  AdminFormCard,
  AdminFormActions,
  AdminStatusVisibility,
  AdminTagsInput,
} from "@/components/admin";
import { Switch } from "@/components/ui/switch";
import { SupabaseImage } from "@/components/ui/supabase-image";

const SCHOOL_STATUS_OPTIONS = [
  { value: SchoolStatus.ACTIVE, label: "Actif" },
  { value: SchoolStatus.INACTIVE, label: "Inactif" },
  { value: SchoolStatus.DRAFT, label: "Brouillon" },
];

const SCHOOL_TYPE_OPTIONS = [
  { value: SchoolType.UNIVERSITE, label: "Université" },
  { value: SchoolType.ECOLE_INGENIEUR, label: "École d'Ingénieur" },
  { value: SchoolType.ECOLE_COMMERCE, label: "École de Commerce" },
  { value: SchoolType.INSTITUT, label: "Institut" },
  { value: SchoolType.FACULTE, label: "Faculté" },
];

export default function EditSchoolPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = use(params);
  const router = useRouter();
  const { data: schoolData, isLoading } = useSchool(schoolId);
  const updateMutation = useUpdateSchool(schoolId);
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(updateSchoolSchema),
  });

  // Populate form when school data loads
  const school = schoolData?.data;

  useEffect(() => {
    if (school && !isLoading) {
      // Safely parse programs - ensure each program has required fields
      const safePrograms = Array.isArray(school.programs)
        ? school.programs.map((p: Record<string, unknown>) => ({
            id: String(p.id || ''),
            name: String(p.name || ''),
            description: p.description ? String(p.description) : undefined,
            duration: p.duration ? String(p.duration) : undefined,
            requirements: Array.isArray(p.requirements) ? p.requirements : [],
          }))
        : [];

      reset({
        name: school.name || "",
        shortName: school.shortName || "",
        type: school.type as SchoolType,
        description: school.description || "",
        longDescription: school.longDescription || "",
        city: school.city || "",
        region: school.region || "",
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
        website: school.website || "",
        seuilDeSelection: school.seuilDeSelection || undefined,
        fraisInscription: school.fraisInscription || undefined,
        datesConcours: school.datesConcours || "",
        establishedYear: school.establishedYear || undefined,
        bourses: school.bourses ?? false,
        documentsRequis: school.documentsRequis || [],
        nombreEtudiants: school.nombreEtudiants || undefined,
        tauxReussite: school.tauxReussite || undefined,
        classementNational: school.classementNational || undefined,
        programs: safePrograms,
        specializations: school.specializations || [],
        avantages: school.avantages || [],
        services: school.services || [],
        infrastructures: school.infrastructures || [],
        partenariats: school.partenariats || [],
        isPublic: school.isPublic ?? true,
        featured: school.featured ?? false,
        status: school.status as SchoolStatus || SchoolStatus.DRAFT,
        imageFileId: school.imageFileId || null,
        logoFileId: school.logoFileId || null,
      });

      // Set image previews from existing files
      if (school.imageFile?.publicUrl) {
        setImagePreview(school.imageFile.publicUrl);
      }
      if (school.logoFile?.publicUrl) {
        setLogoPreview(school.logoFile.publicUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school?.id, isLoading]);

  const watchedStatus = watch("status") || SchoolStatus.DRAFT;
  const watchedIsPublic = watch("isPublic") ?? true;
  const watchedFeatured = watch("featured") ?? false;
  const watchedBourses = watch("bourses") ?? false;
  const watchedSpecializations = (watch("specializations") as string[]) || [];
  const watchedAvantages = (watch("avantages") as string[]) || [];
  const watchedDocumentsRequis = (watch("documentsRequis") as string[]) || [];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Delete old image if exists
      if (school?.imageFileId) {
        try {
          await deleteFileMutation.mutateAsync(school.imageFileId);
        } catch {
          // Continue even if delete fails
        }
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Delete old logo if exists
      if (school?.logoFileId) {
        try {
          await deleteFileMutation.mutateAsync(school.logoFileId);
        } catch {
          // Continue even if delete fails
        }
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = async () => {
    if (school?.imageFileId) {
      try {
        await deleteFileMutation.mutateAsync(school.imageFileId);
      } catch {
        // Continue even if delete fails
      }
    }
    setImageFile(null);
    setImagePreview(null);
    setValue("imageFileId", null);
  };

  const removeLogo = async () => {
    if (school?.logoFileId) {
      try {
        await deleteFileMutation.mutateAsync(school.logoFileId);
      } catch {
        // Continue even if delete fails
      }
    }
    setLogoFile(null);
    setLogoPreview(null);
    setValue("logoFileId", null);
  };

  const onSubmit = async (data: UpdateSchoolInput) => {
    try {
      // Upload new image if provided
      if (imageFile) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: imageFile,
          type: FileType.IMAGE,
          folder: "school-images",
        });
        data.imageFileId = uploadResult.data.id;
      }

      // Upload new logo if provided
      if (logoFile) {
        const uploadResult = await uploadFileMutation.mutateAsync({
          file: logoFile,
          type: FileType.IMAGE,
          folder: "school-logos",
        });
        data.logoFileId = uploadResult.data.id;
      }

      await updateMutation.mutateAsync(data);
      toast.success("École mise à jour avec succès");
      router.push(ADMIN_ROUTES.SCHOOLS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement de l'école..." />;
  }

  if (!school) {
    return (
      <ErrorState
        message="L'école que vous recherchez n'existe pas ou a été supprimée."
        backHref={ADMIN_ROUTES.SCHOOLS}
        backLabel="Retour aux Écoles"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminFormHeader
        backLabel="Retour aux Écoles"
        backHref={ADMIN_ROUTES.SCHOOLS}
        title={`Modifier: ${school.name}`}
        description="Modifier les informations de l'école"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <AdminFormCard
              title="Informations de Base"
              description="Détails essentiels de l'école"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nom complet <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="ex: École Nationale Supérieure d'Informatique"
                    className="ops-input h-9"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortName" className="text-sm font-medium">
                    Abréviation <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                  </Label>
                  <Input
                    id="shortName"
                    {...register("shortName")}
                    placeholder="ex: ENSIAS"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={watch("type") || ""}
                    onValueChange={(value) => setValue("type", value as SchoolType, { shouldValidate: true })}
                  >
                    <SelectTrigger id="type" className="ops-input h-9">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {SCHOOL_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-xs text-destructive">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description courte <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brève description de l'école"
                  rows={2}
                  className="ops-input resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription" className="text-sm font-medium">
                  Description détaillée <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Textarea
                  id="longDescription"
                  {...register("longDescription")}
                  placeholder="Description complète de l'école, son histoire, ses missions..."
                  rows={4}
                  className="ops-input resize-none"
                />
              </div>
            </AdminFormCard>

            {/* Location */}
            <AdminFormCard
              title="Localisation"
              description="Adresse et contact de l'école"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    Ville <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="ex: Rabat"
                    className="ops-input h-9"
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">
                    Région <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                  </Label>
                  <Input
                    id="region"
                    {...register("region")}
                    placeholder="ex: Rabat-Salé-Kénitra"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Adresse <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                  </Label>
                  <Input
                    id="address"
                    {...register("address")}
                    placeholder="Adresse complète"
                    className="ops-input h-9"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="+212 5XX XX XX XX"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="contact@ecole.ma"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-medium">
                    Site web
                  </Label>
                  <Input
                    id="website"
                    {...register("website")}
                    placeholder="https://ecole.ma"
                    className="ops-input h-9"
                  />
                </div>
              </div>
            </AdminFormCard>

            {/* Admission */}
            <AdminFormCard
              title="Admission"
              description="Informations sur les conditions d'admission"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="seuilDeSelection" className="text-sm font-medium">
                    Seuil de sélection
                  </Label>
                  <Input
                    id="seuilDeSelection"
                    type="number"
                    step="0.1"
                    {...register("seuilDeSelection", { valueAsNumber: true })}
                    placeholder="ex: 16.5"
                    className="ops-input h-9"
                  />
                  <p className="text-xs text-ops-tertiary">
                    Note minimale requise (sur 20)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fraisInscription" className="text-sm font-medium">
                    Frais d&apos;inscription (DH)
                  </Label>
                  <Input
                    id="fraisInscription"
                    type="number"
                    {...register("fraisInscription", { valueAsNumber: true })}
                    placeholder="ex: 1200"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datesConcours" className="text-sm font-medium">
                    Dates du concours
                  </Label>
                  <Input
                    id="datesConcours"
                    {...register("datesConcours")}
                    placeholder="ex: Juin - Juillet"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="establishedYear" className="text-sm font-medium">
                    Année de création
                  </Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    {...register("establishedYear", { valueAsNumber: true })}
                    placeholder="ex: 1993"
                    className="ops-input h-9"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="bourses" className="text-sm font-medium">Bourses disponibles</Label>
                  <p className="text-xs text-ops-tertiary">
                    L&apos;école offre des bourses aux étudiants
                  </p>
                </div>
                <Switch
                  id="bourses"
                  checked={watchedBourses}
                  onCheckedChange={(checked) => setValue("bourses", checked, { shouldValidate: true })}
                />
              </div>

              <AdminTagsInput
                tags={watchedDocumentsRequis}
                onChange={(tags: string[]) => setValue("documentsRequis", tags, { shouldValidate: true })}
                cardTitle="Documents requis"
                cardDescription="Ajouter les documents nécessaires pour l'inscription"
                placeholder="Ajouter un document (ex: Baccalauréat)"
              />
            </AdminFormCard>

            {/* Statistics */}
            <AdminFormCard
              title="Statistiques"
              description="Chiffres clés de l'école"
            >
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="nombreEtudiants" className="text-sm font-medium">
                    Nombre d&apos;étudiants
                  </Label>
                  <Input
                    id="nombreEtudiants"
                    type="number"
                    {...register("nombreEtudiants", { valueAsNumber: true })}
                    placeholder="ex: 1200"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tauxReussite" className="text-sm font-medium">
                    Taux de réussite (%)
                  </Label>
                  <Input
                    id="tauxReussite"
                    type="number"
                    step="0.1"
                    {...register("tauxReussite", { valueAsNumber: true })}
                    placeholder="ex: 92"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classementNational" className="text-sm font-medium">
                    Classement national
                  </Label>
                  <Input
                    id="classementNational"
                    type="number"
                    {...register("classementNational", { valueAsNumber: true })}
                    placeholder="ex: 2"
                    className="ops-input h-9"
                  />
                </div>
              </div>
            </AdminFormCard>

            {/* Additional Info */}
            <AdminFormCard
              title="Informations Additionnelles"
              description="Spécialisations, avantages et plus"
            >
              <AdminTagsInput
                tags={watchedSpecializations}
                onChange={(tags: string[]) => setValue("specializations", tags, { shouldValidate: true })}
                cardTitle="Spécialisations"
                cardDescription="Domaines d'expertise de l'école"
                placeholder="Ajouter une spécialisation"
                withCard={false}
              />

              <AdminTagsInput
                tags={watchedAvantages}
                onChange={(tags: string[]) => setValue("avantages", tags, { shouldValidate: true })}
                cardTitle="Avantages"
                cardDescription="Points forts de l'école"
                placeholder="Ajouter un avantage"
                withCard={false}
              />
            </AdminFormCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <AdminStatusVisibility
              status={watchedStatus}
              onStatusChange={(value) => setValue("status", value as SchoolStatus, { shouldValidate: true })}
              statusOptions={SCHOOL_STATUS_OPTIONS}
              isPublic={watchedIsPublic}
              onIsPublicChange={(checked) => setValue("isPublic", checked, { shouldValidate: true })}
            />

            {/* Featured */}
            <AdminFormCard title="Mise en avant">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured" className="text-sm font-medium">À la une</Label>
                  <p className="text-xs text-ops-tertiary">
                    Mettre en avant sur la page d&apos;accueil
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={watchedFeatured}
                  onCheckedChange={(checked) => setValue("featured", checked, { shouldValidate: true })}
                />
              </div>
            </AdminFormCard>

            {/* Logo Upload */}
            <AdminFormCard title="Logo">
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="relative">
                    <SupabaseImage
                      src={logoPreview}
                      alt="Logo preview"
                      width={200}
                      height={200}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={removeLogo}
                      disabled={deleteFileMutation.isPending}
                    >
                      {deleteFileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-ops-hover transition-colors">
                    <Upload className="h-6 w-6 text-ops-tertiary mb-2" />
                    <span className="text-sm text-ops-tertiary">Cliquer pour télécharger</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
                <p className="text-xs text-ops-tertiary text-center">
                  Format carré recommandé (ex: 200x200)
                </p>
              </div>
            </AdminFormCard>

            {/* Image Upload */}
            <AdminFormCard title="Image principale">
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <SupabaseImage
                      src={imagePreview}
                      alt="Image preview"
                      width={400}
                      height={225}
                      className="w-full aspect-video rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={removeImage}
                      disabled={deleteFileMutation.isPending}
                    >
                      {deleteFileMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-ops-hover transition-colors">
                    <Upload className="h-6 w-6 text-ops-tertiary mb-2" />
                    <span className="text-sm text-ops-tertiary">Cliquer pour télécharger</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
                <p className="text-xs text-ops-tertiary text-center">
                  Format 16:9 recommandé
                </p>
              </div>
            </AdminFormCard>

            {/* Actions */}
            <AdminFormActions
              cancelHref={ADMIN_ROUTES.SCHOOLS}
              submitLabel="Mettre à jour"
              loadingLabel="Mise à jour..."
              isSubmitting={isSubmitting || updateMutation.isPending}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
