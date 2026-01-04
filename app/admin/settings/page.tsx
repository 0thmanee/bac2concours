"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Save,
} from "lucide-react";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { updateSettingsSchema, type UpdateSettingsInput } from "@/lib/validations/settings.validation";
import { SETTINGS_DEFAULTS } from "@/lib/constants";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";

export default function SettingsPage() {
  const { data: settingsData, isLoading, error } = useSettings();
  const updateMutation = useUpdateSettings();
  
  const settings = settingsData?.data;
  
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
      await updateMutation.mutateAsync(data);
      toast.success("Paramètres enregistrés avec succès");
      reset(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde");
    }
  };

  if (isLoading) {
    return <LoadingState message="Chargement des paramètres..." />;
  }

  if (error || !settings) {
    return <ErrorState message="Impossible de charger les paramètres" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">
            Paramètres
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Configurez les paramètres de votre plateforme
          </p>
        </div>
        {isDirty && (
          <Badge
            className="h-6 text-xs bg-metric-orange-light text-metric-orange border-ops"
          >
            Modifications non sauvegardées
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Settings */}
            <Card className="ops-card border border-ops">
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
                    <p className="text-xs text-red-500">{errors.incubatorName.message}</p>
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
            <Card className="ops-card border border-ops">
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
            <Card className="ops-card border border-ops sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full ops-btn-primary"
                  disabled={!isDirty || updateMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
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
    </div>
  );
}
