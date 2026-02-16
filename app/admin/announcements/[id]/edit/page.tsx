"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateAnnouncementSchema,
  type UpdateAnnouncementInput,
} from "@/lib/validations/announcement.validation";
import { useAnnouncement, useUpdateAnnouncement, usePublishAnnouncement } from "@/lib/hooks/use-announcements";
import { useSchools } from "@/lib/hooks/use-schools";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils";
import {
  AdminFormHeader,
  AdminFormCard,
  AdminFormActions,
} from "@/components/admin";
import { LoadingState } from "@/components/shared/loading-state";
import { Megaphone } from "lucide-react";

const TYPE_OPTIONS = [
  { value: "GENERAL", label: "Général" },
  { value: "REGISTRATION", label: "Inscription" },
  { value: "EVENT", label: "Événement" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PUBLISHED", label: "Publié" },
];

export default function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading } = useAnnouncement(id);
  const updateMutation = useUpdateAnnouncement(id);
  const publishMutation = usePublishAnnouncement(id);
  const { data: schoolsData } = useSchools({ limit: 100 });
  const schools = (schoolsData?.data?.schools ?? []) as { id: string; name: string; shortName: string | null }[];
  const announcement = data?.data;
  const [isFormReady, setIsFormReady] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<UpdateAnnouncementInput>({
    resolver: zodResolver(updateAnnouncementSchema),
  });

  const watchedType = watch("type");
  const watchedStatus = watch("status");

  useEffect(() => {
    if (announcement && !isLoading) {
      reset({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type as UpdateAnnouncementInput["type"],
        status: announcement.status as UpdateAnnouncementInput["status"],
        linkUrl: announcement.linkUrl ?? "",
        schoolId: announcement.schoolId ?? undefined,
      });
      setIsFormReady(true);
    }
  }, [announcement, isLoading, reset]);

  const onSubmit = async (payload: UpdateAnnouncementInput) => {
    try {
      await updateMutation.mutateAsync({
        ...payload,
        linkUrl: payload.linkUrl?.trim() || undefined,
        schoolId: payload.schoolId || undefined,
      });
      if (payload.status === "PUBLISHED" && announcement?.status !== "PUBLISHED") {
        toast.success("Annonce publiée. Tous les utilisateurs ont été notifiés.");
      } else {
        toast.success("Annonce mise à jour.");
      }
      router.push(ADMIN_ROUTES.ANNOUNCEMENTS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handlePublish = () => {
    publishMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Annonce publiée. Tous les utilisateurs ont été notifiés.");
        router.push(ADMIN_ROUTES.ANNOUNCEMENTS);
      },
      onError: () => toast.error("Échec de la publication"),
    });
  };

  if (isLoading || !isFormReady) {
    return <LoadingState message="Chargement de l'annonce..." />;
  }

  if (!announcement) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Annonce non trouvée</p>
        <Button variant="link" onClick={() => router.push(ADMIN_ROUTES.ANNOUNCEMENTS)}>
          Retour aux annonces
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminFormHeader
        backLabel="Retour aux Annonces"
        backHref={ADMIN_ROUTES.ANNOUNCEMENTS}
        title="Modifier l'annonce"
        description={announcement.title}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <AdminFormCard title="Contenu" description="Titre et message">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  {...register("title")}
                  className="ops-input h-9"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Contenu</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  rows={6}
                  className="ops-input resize-none"
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl">Lien (optionnel)</Label>
                <Input
                  id="linkUrl"
                  {...register("linkUrl")}
                  className="ops-input h-9"
                />
                {errors.linkUrl && (
                  <p className="text-xs text-destructive">{errors.linkUrl.message}</p>
                )}
              </div>
            </AdminFormCard>
          </div>

          <div className="space-y-6">
            <AdminFormCard title="Type et publication">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(v) => setValue("type", v as UpdateAnnouncementInput["type"], { shouldValidate: true })}
                >
                  <SelectTrigger className="ops-input h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(v) => setValue("status", v as UpdateAnnouncementInput["status"], { shouldValidate: true })}
                >
                  <SelectTrigger className="ops-input h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {announcement.status === "DRAFT" && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={handlePublish}
                    disabled={publishMutation.isPending}
                  >
                    {publishMutation.isPending ? "Publication..." : "Publier maintenant (notifier tous)"}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>École concernée (optionnel)</Label>
                <Select
                  value={watch("schoolId") ?? "__none__"}
                  onValueChange={(v) => setValue("schoolId", v === "__none__" ? undefined : v, { shouldValidate: true })}
                >
                  <SelectTrigger className="ops-input h-9">
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucune</SelectItem>
                    {schools.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.shortName || s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AdminFormCard>

            <AdminFormActions
              submitLabel="Enregistrer"
              loadingLabel="Enregistrement..."
              cancelHref={ADMIN_ROUTES.ANNOUNCEMENTS}
              isSubmitting={isSubmitting}
              isPending={updateMutation.isPending}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
