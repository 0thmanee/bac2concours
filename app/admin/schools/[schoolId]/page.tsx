"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  Award,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Building2,
  CheckCircle2,
  FileText,
  Coins,
  TrendingUp,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { useSchool, useDeleteSchool } from "@/lib/hooks/use-schools";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { format } from "date-fns";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { AdminDetailHeader } from "@/components/admin";

// School type labels
const SCHOOL_TYPE_LABELS: Record<string, string> = {
  UNIVERSITE: "Université",
  ECOLE_INGENIEUR: "École d'Ingénieur",
  ECOLE_COMMERCE: "École de Commerce",
  INSTITUT: "Institut",
  FACULTE: "Faculté",
};

export default function SchoolDetailPage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = use(params);
  const router = useRouter();
  const { data: schoolData, isLoading, error, isError } = useSchool(schoolId);
  const deleteMutation = useDeleteSchool();

  if (isLoading) {
    return <LoadingState message="Chargement de l'école..." />;
  }

  if (isError || error) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "École non trouvée"}
        backHref={ADMIN_ROUTES.SCHOOLS}
        backLabel="Retour aux Écoles"
      />
    );
  }

  const school = schoolData?.data;

  if (!school) {
    return (
      <ErrorState
        message="École non trouvée"
        backHref={ADMIN_ROUTES.SCHOOLS}
        backLabel="Retour aux Écoles"
      />
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(schoolId);
      toast.success("École supprimée avec succès");
      router.push(ADMIN_ROUTES.SCHOOLS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const handleVisitWebsite = () => {
    if (school.website) {
      window.open(school.website, "_blank");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      INACTIVE: "bg-linear-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200",
      DRAFT: "bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      DRAFT: "Brouillon",
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg border ${styles[status] || styles.ACTIVE}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminDetailHeader
        backLabel="Retour aux Écoles"
        backHref={ADMIN_ROUTES.SCHOOLS}
        title={school.shortName ? `${school.name} (${school.shortName})` : school.name}
        badges={
          <>
            {getStatusBadge(school.status)}
            {school.isPublic && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] border border-[rgb(var(--brand-200))]">
                Public
              </span>
            )}
            {school.featured && (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-lg bg-linear-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200">
                <Star className="h-3 w-3 mr-1 fill-current" />
                À la une
              </span>
            )}
          </>
        }
        subtitle={
          <>
            <Building2 className="h-4 w-4" />
            {SCHOOL_TYPE_LABELS[school.type] || school.type}
          </>
        }
        description={school.description || undefined}
        actions={
          <>
            {school.website && (
              <Button onClick={handleVisitWebsite} variant="outline" className="ops-btn-secondary h-9 gap-2">
                <ExternalLink className="h-4 w-4" />
                Site Web
              </Button>
            )}
            <Button asChild variant="outline" className="ops-btn-secondary h-9 gap-2">
              <Link href={ADMIN_ROUTES.SCHOOL_EDIT(schoolId)}>
                <Edit className="h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="ops-btn-secondary h-9 gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l&apos;École</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &ldquo;{school.name}&rdquo; ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Vues"
          value={school.views?.toLocaleString() || "0"}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Étudiants"
          value={school.nombreEtudiants?.toLocaleString() || "N/A"}
          icon={Users}
          color="orange"
        />
        <MetricCard
          title="Taux de Réussite"
          value={school.tauxReussite ? `${school.tauxReussite}%` : "N/A"}
          icon={TrendingUp}
          color="mint"
        />
        <MetricCard
          title="Classement National"
          value={school.classementNational ? `#${school.classementNational}` : "N/A"}
          icon={Award}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* School Image */}
          {school.imageFile?.publicUrl && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Image de l&apos;École
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  <SupabaseImage
                    src={school.imageFile.publicUrl}
                    alt={school.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Long Description */}
          {school.longDescription && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Description Détaillée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ops-secondary whitespace-pre-wrap">{school.longDescription}</p>
              </CardContent>
            </Card>
          )}

          {/* Admission Information */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations d&apos;Admission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {school.seuilDeSelection !== null && (
                  <div>
                    <p className="text-sm font-medium text-ops-tertiary">Seuil de Sélection</p>
                    <p className="text-base text-ops-primary mt-1">{school.seuilDeSelection}/20</p>
                  </div>
                )}
                {school.fraisInscription !== null && (
                  <div>
                    <p className="text-sm font-medium text-ops-tertiary">Frais d&apos;Inscription</p>
                    <p className="text-base text-ops-primary mt-1 flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {school.fraisInscription.toLocaleString()} MAD
                    </p>
                  </div>
                )}
                {school.datesConcours && (
                  <div>
                    <p className="text-sm font-medium text-ops-tertiary">Dates du Concours</p>
                    <p className="text-base text-ops-primary mt-1">{school.datesConcours}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Bourses Disponibles</p>
                  <p className="text-base text-ops-primary mt-1 flex items-center gap-1">
                    {school.bourses ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Oui
                      </>
                    ) : (
                      "Non"
                    )}
                  </p>
                </div>
              </div>

              {school.documentsRequis && school.documentsRequis.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-ops-tertiary mb-2">Documents Requis</p>
                  <ul className="list-disc list-inside space-y-1">
                    {school.documentsRequis.map((doc, index) => (
                      <li key={index} className="text-sm text-ops-primary">{doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specializations */}
          {school.specializations && school.specializations.length > 0 && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Spécialisations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {school.specializations.map((spec, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-[rgb(var(--brand-700))] border border-[rgb(var(--brand-200))]">
                      {spec}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advantages */}
          {school.avantages && school.avantages.length > 0 && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Avantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {school.avantages.map((adv, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-ops-primary">{adv}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Partnerships */}
          {school.partenariats && school.partenariats.length > 0 && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Partenariats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {school.partenariats.map((partner, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      {partner}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logo */}
          {school.logoFile?.publicUrl && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SupabaseImage
                  src={school.logoFile.publicUrl}
                  alt={`${school.name} logo`}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Informations de Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-ops-tertiary mt-0.5" />
                <div>
                  <p className="text-sm text-ops-primary">{school.city}</p>
                  {school.address && (
                    <p className="text-xs text-ops-tertiary">{school.address}</p>
                  )}
                  {school.region && (
                    <p className="text-xs text-ops-tertiary">{school.region}</p>
                  )}
                </div>
              </div>
              {school.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-ops-tertiary" />
                  <p className="text-sm text-ops-primary">{school.phone}</p>
                </div>
              )}
              {school.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-ops-tertiary" />
                  <a href={`mailto:${school.email}`} className="text-sm text-[rgb(var(--brand-600))] hover:underline">
                    {school.email}
                  </a>
                </div>
              )}
              {school.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-ops-tertiary" />
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[rgb(var(--brand-600))] hover:underline truncate">
                    {school.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services & Infrastructure */}
          {((school.services && school.services.length > 0) || (school.infrastructures && school.infrastructures.length > 0)) && (
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Services & Infrastructures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.services && school.services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-ops-tertiary mb-2">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {school.services.map((service, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {school.infrastructures && school.infrastructures.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-ops-tertiary mb-2">Infrastructures</p>
                    <div className="flex flex-wrap gap-1">
                      {school.infrastructures.map((infra, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-600 dark:text-gray-400">
                          {infra}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Publication Information */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Informations de Publication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {school.establishedYear && (
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Année de Fondation</p>
                  <p className="text-sm text-ops-primary mt-1">{school.establishedYear}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-ops-tertiary flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ajouté le
                </p>
                <p className="text-sm text-ops-primary mt-1">
                  {format(new Date(school.createdAt), "d MMMM yyyy 'à' HH:mm")}
                </p>
              </div>
              {school.updatedAt && school.updatedAt !== school.createdAt && (
                <div>
                  <p className="text-sm font-medium text-ops-tertiary">Dernière modification</p>
                  <p className="text-sm text-ops-primary mt-1">
                    {format(new Date(school.updatedAt), "d MMMM yyyy 'à' HH:mm")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
