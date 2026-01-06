"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Mail,
  Save,
  FolderOpen,
  GraduationCap,
  BookOpen,
  Settings2,
} from "lucide-react";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import {
  useCategories,
  useLevels,
  useMatieres,
  useCreateCategory,
  useCreateLevel,
  useCreateMatiere,
  useDeleteCategory,
  useDeleteLevel,
  useDeleteMatiere,
} from "@/lib/hooks/use-settings-resources";
import { updateSettingsSchema, type UpdateSettingsInput } from "@/lib/validations/settings.validation";
import { SETTINGS_DEFAULTS, API_ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { SettingsResourceManager } from "@/components/admin";
import { apiClient } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import type { Category, Level, Matiere } from "@prisma/client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();
  
  // General settings
  const { data: settingsData, isLoading: isLoadingSettings, error: settingsError } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const settings = settingsData?.data;

  // Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Levels
  const { data: levelsData, isLoading: isLoadingLevels } = useLevels();
  const createLevelMutation = useCreateLevel();
  const deleteLevelMutation = useDeleteLevel();

  // Matieres
  const { data: matieresData, isLoading: isLoadingMatieres } = useMatieres();
  const createMatiereMutation = useCreateMatiere();
  const deleteMatiereMutation = useDeleteMatiere();

  // Update state for inline updates
  const [isUpdating, setIsUpdating] = useState(false);

  const categories = categoriesData?.data?.categories || [];
  const levels = levelsData?.data?.levels || [];
  const matieres = matieresData?.data?.matieres || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      incubatorName: SETTINGS_DEFAULTS.INCUBATOR_NAME,
    },
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        incubatorName: settings.incubatorName,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: UpdateSettingsInput) => {
    try {
      await updateSettingsMutation.mutateAsync(data);
      toast.success("Paramètres enregistrés avec succès");
      reset(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    }
  };

  // Update handlers using direct API calls
  const handleUpdateCategory = useCallback(async (id: string, data: { name: string; description?: string; isActive: boolean }) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(API_ROUTES.CATEGORY(id), data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  const handleUpdateLevel = useCallback(async (id: string, data: { name: string; description?: string; isActive: boolean }) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(API_ROUTES.LEVEL(id), data);
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  const handleUpdateMatiere = useCallback(async (id: string, data: { name: string; description?: string; isActive: boolean }) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(API_ROUTES.MATIERE(id), data);
      queryClient.invalidateQueries({ queryKey: ["matieres"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-options"] });
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  if (isLoadingSettings) {
    return <LoadingState message="Chargement des paramètres..." />;
  }

  if (settingsError || !settings) {
    return <ErrorState message="Impossible de charger les paramètres" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ops-primary">
            Paramètres
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Configurez les paramètres et les ressources de votre plateforme
          </p>
        </div>
        {isDirty && activeTab === "general" && (
          <Badge
            className="h-6 text-xs bg-metric-orange-light text-metric-orange border-border w-fit"
          >
            Modifications non sauvegardées
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Catégories</span>
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Niveaux</span>
          </TabsTrigger>
          <TabsTrigger value="matieres" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Matières</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Main Settings */}
              <div className="md:col-span-2 space-y-6">
                {/* Organization Settings */}
                <Card className="ops-card border border-border">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-blue-light"
                      >
                        <Building2 className="h-6 w-6 text-metric-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-ops-primary">
                          Organisation
                        </CardTitle>
                        <CardDescription className="text-ops-secondary">
                          Informations sur votre plateforme
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName" className="text-sm font-medium">
                        Nom de la plateforme
                      </Label>
                      <Input
                        id="orgName"
                        {...register("incubatorName")}
                        className="ops-input h-9"
                      />
                      {errors.incubatorName && (
                        <p className="text-xs text-destructive">{errors.incubatorName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgDescription" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="orgDescription"
                        placeholder="Description de votre plateforme éducative"
                        rows={3}
                        className="ops-input resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Email Settings */}
                <Card className="ops-card border border-border">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-purple-light"
                      >
                        <Mail className="h-6 w-6 text-metric-purple" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-ops-primary">
                          Configuration Email
                        </CardTitle>
                        <CardDescription className="text-ops-secondary">
                          Paramètres du serveur email
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail" className="text-sm font-medium">
                        Adresse email d&apos;envoi
                      </Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        placeholder="noreply@2baconcours.com"
                        className="ops-input h-9"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Save Actions */}
                <Card className="ops-card border border-border sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-ops-primary">
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full ops-btn-primary"
                      disabled={!isDirty || updateSettingsMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateSettingsMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full ops-btn-secondary"
                      onClick={() => reset()}
                      disabled={!isDirty}
                    >
                      Annuler les modifications
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <SettingsResourceManager<Category>
            title="Catégorie"
            description="Gérez les catégories disponibles pour les vidéos et livres"
            icon={FolderOpen}
            resources={categories}
            isLoading={isLoadingCategories}
            onCreate={async (data) => {
              await createCategoryMutation.mutateAsync({ ...data, order: 0 });
            }}
            onUpdate={handleUpdateCategory}
            onDelete={async (id) => {
              await deleteCategoryMutation.mutateAsync(id);
            }}
            createPending={createCategoryMutation.isPending}
            updatePending={isUpdating}
            deletePending={deleteCategoryMutation.isPending}
          />
        </TabsContent>

        {/* Levels Tab */}
        <TabsContent value="levels">
          <SettingsResourceManager<Level>
            title="Niveau"
            description="Gérez les niveaux disponibles (ex: Terminale, Première)"
            icon={GraduationCap}
            resources={levels}
            isLoading={isLoadingLevels}
            onCreate={async (data) => {
              await createLevelMutation.mutateAsync({ ...data, order: 0 });
            }}
            onUpdate={handleUpdateLevel}
            onDelete={async (id) => {
              await deleteLevelMutation.mutateAsync(id);
            }}
            createPending={createLevelMutation.isPending}
            updatePending={isUpdating}
            deletePending={deleteLevelMutation.isPending}
          />
        </TabsContent>

        {/* Matieres Tab */}
        <TabsContent value="matieres">
          <SettingsResourceManager<Matiere>
            title="Matière"
            description="Gérez les matières disponibles (ex: Mathématiques, Physique)"
            icon={BookOpen}
            resources={matieres}
            isLoading={isLoadingMatieres}
            onCreate={async (data) => {
              await createMatiereMutation.mutateAsync({ ...data, order: 0 });
            }}
            onUpdate={handleUpdateMatiere}
            onDelete={async (id) => {
              await deleteMatiereMutation.mutateAsync(id);
            }}
            createPending={createMatiereMutation.isPending}
            updatePending={isUpdating}
            deletePending={deleteMatiereMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
