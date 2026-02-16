"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createAnnouncementSchema,
  type CreateAnnouncementInput,
} from "@/lib/validations/announcement.validation";
import { useCreateAnnouncement } from "@/lib/hooks/use-announcements";
import { useSchools } from "@/lib/hooks/use-schools";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";
import { ADMIN_ROUTES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils/error.utils";
import {
  AdminFormHeader,
  AdminFormCard,
  AdminFormActions,
} from "@/components/admin";

type CreateAnnouncementFormValues = z.input<typeof createAnnouncementSchema>;

const TYPE_OPTIONS = [
  { value: "GENERAL", label: "Général" },
  { value: "REGISTRATION", label: "Inscription (ex: ouverture des inscriptions)" },
  { value: "EVENT", label: "Événement" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Brouillon (sauvegarder sans notifier)" },
  { value: "PUBLISHED", label: "Publier (notifier tous les utilisateurs)" },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const createMutation = useCreateAnnouncement();
  const { data: schoolsData } = useSchools();
  const schools = (schoolsData?.data?.schools ?? []) as { id: string; name: string; shortName: string | null }[];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateAnnouncementFormValues>({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: {
      type: "GENERAL",
      status: "DRAFT",
      linkUrl: "",
      schoolId: undefined,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form watch() is not memoizable
  const watched = watch();
  const watchedType = watched.type ?? "GENERAL";
  const watchedStatus = watched.status ?? "DRAFT";

  const onSubmit = async (data: CreateAnnouncementFormValues) => {
    try {
      const payload: CreateAnnouncementInput = {
        title: data.title,
        content: data.content,
        type: data.type ?? "GENERAL",
        status: data.status ?? "DRAFT",
        linkUrl: data.linkUrl?.trim() || undefined,
        schoolId: data.schoolId ?? undefined,
      };
      await createMutation.mutateAsync(payload);
      if (data.status === "PUBLISHED") {
        toast.success("Annonce créée et publiée. Tous les utilisateurs ont été notifiés.");
      } else {
        toast.success("Annonce créée en brouillon.");
      }
      router.push(ADMIN_ROUTES.ANNOUNCEMENTS);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <AdminFormHeader
        backLabel="Retour aux Annonces"
        backHref={ADMIN_ROUTES.ANNOUNCEMENTS}
        title="Nouvelle annonce"
        description="Exemple : une école ouvre ses inscriptions, une date limite, une actualité. En publiant, tous les utilisateurs actifs reçoivent une notification."
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <AdminFormCard
              title="Contenu"
              description="Titre et message de l'annonce"
            >
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Titre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="ex: Ouverture des inscriptions - École X"
                  className="ops-input h-9"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                  Contenu <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Décrivez l'annonce (dates, lien d'inscription, etc.)"
                  rows={6}
                  className="ops-input resize-none"
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl" className="text-sm font-medium">
                  Lien <span className="text-xs text-ops-tertiary">(Optionnel)</span>
                </Label>
                <Input
                  id="linkUrl"
                  {...register("linkUrl")}
                  placeholder="https://..."
                  className="ops-input h-9"
                />
                {errors.linkUrl && (
                  <p className="text-xs text-destructive">{errors.linkUrl.message}</p>
                )}
              </div>
            </AdminFormCard>
          </div>

          <div className="space-y-6">
            <AdminFormCard
              title="Type et publication"
              description="Type d'annonce et statut"
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium">Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(v) => setValue("type", v as CreateAnnouncementFormValues["type"], { shouldValidate: true })}
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
                <Label className="text-sm font-medium">Statut</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(v) => setValue("status", v as CreateAnnouncementFormValues["status"], { shouldValidate: true })}
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
                {watchedStatus === "PUBLISHED" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    La publication enverra une notification à tous les utilisateurs actifs.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">École concernée <span className="text-xs text-ops-tertiary">(Optionnel)</span></Label>
                <Select
                  value={watched.schoolId ?? "__none__"}
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
              submitLabel="Créer l'annonce"
              loadingLabel="Création..."
              cancelHref={ADMIN_ROUTES.ANNOUNCEMENTS}
              isSubmitting={isSubmitting}
              isPending={createMutation.isPending}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
