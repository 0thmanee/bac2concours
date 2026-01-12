"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Award,
  GraduationCap,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  Coins,
  TrendingUp,
  Star,
  Sparkles,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupabaseImage } from "@/components/ui/supabase-image";
import { LoadingState } from "@/components/shared/loading-state";

import { STUDENT_ROUTES } from "@/lib/routes";
import {
  useSchool,
  useRelatedSchools,
  useIncrementSchoolViews,
} from "@/lib/hooks/use-schools";
import type { SchoolWithRelations } from "@/lib/validations/school.validation";
import {
  StudentDetailHeader,
  StudentDetailCard,
  StudentRelatedItems,
} from "@/components/student";

// School type labels
const SCHOOL_TYPE_LABELS: Record<string, string> = {
  UNIVERSITE: "Université",
  ECOLE_INGENIEUR: "École d'Ingénieur",
  ECOLE_COMMERCE: "École de Commerce",
  INSTITUT: "Institut",
  FACULTE: "Faculté",
};

export default function StudentSchoolDetailPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  // Fetch school data
  const { data: schoolData, isLoading } = useSchool(schoolId);
  const school = schoolData?.data as SchoolWithRelations | undefined;

  // Fetch related schools
  const { data: relatedData } = useRelatedSchools(schoolId);
  const relatedSchools = (relatedData?.data as SchoolWithRelations[]) || [];

  // Track view mutation
  const viewMutation = useIncrementSchoolViews(schoolId);

  // Track view on mount
  useEffect(() => {
    if (school) {
      viewMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school?.id]);

  if (isLoading) {
    return <LoadingState message="Chargement de l'école..." />;
  }

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <GraduationCap className="h-16 w-16 text-ops-tertiary" />
        <h2 className="text-2xl font-bold text-ops-primary">
          École introuvable
        </h2>
        <p className="text-ops-secondary">
          Cette école n&apos;existe pas ou a été supprimée.
        </p>
        <Button asChild variant="outline" className="ops-btn-secondary">
          <Link href={STUDENT_ROUTES.SCHOOLS}>Retour aux écoles</Link>
        </Button>
      </div>
    );
  }

  // Prepare header metrics
  const headerMetrics: { icon: typeof Calendar; value: React.ReactNode }[] = [
    { icon: MapPin, value: school.city },
    { icon: Eye, value: `${school.views || 0} vues` },
  ];

  if (school.establishedYear) {
    headerMetrics.push({
      icon: Calendar,
      value: `Fondée en ${school.establishedYear}`,
    });
  }

  if (school.classementNational) {
    headerMetrics.push({
      icon: Award,
      value: `#${school.classementNational} national`,
    });
  }

  // Prepare related items for sidebar
  const relatedItemsData = relatedSchools.map((s) => ({
    id: s.id,
    title: s.shortName ? `${s.name} (${s.shortName})` : s.name,
    thumbnailUrl: s.imageFile?.publicUrl || s.logoFile?.publicUrl,
    views: s.views,
    extraInfo: s.city,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <StudentDetailHeader
        backHref={STUDENT_ROUTES.SCHOOLS}
        title={school.shortName ? `${school.name} (${school.shortName})` : school.name}
        metrics={headerMetrics}
      />

      {/* Hero Section with Cover Image */}
      <Card className="ops-card border border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-64 sm:h-80 lg:h-96 w-full">
            {school.imageFile?.publicUrl ? (
              <SupabaseImage
                src={school.imageFile.publicUrl}
                alt={school.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-brand-400/20 to-brand-600/20 flex items-center justify-center">
                <GraduationCap className="h-24 w-24 text-brand-500/30" />
              </div>
            )}
            {/* Overlay with logo and quick info */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-4">
                {school.logoFile?.publicUrl && (
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                    <SupabaseImage
                      src={school.logoFile.publicUrl}
                      alt={`${school.name} logo`}
                      fill
                      className="object-cover bg-white"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                      {SCHOOL_TYPE_LABELS[school.type] || school.type}
                    </span>
                    {school.featured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Recommandée
                      </span>
                    )}
                    {school.bourses && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success text-white">
                        <Coins className="h-3 w-3 mr-1" />
                        Bourses disponibles
                      </span>
                    )}
                  </div>
                  <p className="text-white/90 text-sm line-clamp-2">
                    {school.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <StudentDetailCard title="À propos">
            {school.longDescription ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-ops-secondary whitespace-pre-wrap leading-relaxed">
                  {school.longDescription}
                </p>
              </div>
            ) : school.description ? (
              <p className="text-ops-secondary">{school.description}</p>
            ) : (
              <p className="text-ops-tertiary italic">
                Aucune description détaillée disponible
              </p>
            )}
          </StudentDetailCard>

          {/* Key Statistics */}
          {(school.nombreEtudiants || school.tauxReussite || school.classementNational) && (
            <Card className="ops-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-500" />
                  Chiffres clés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {school.nombreEtudiants && (
                    <div className="text-center p-4 rounded-xl bg-info-light dark:bg-info-dark/20 border border-info/30 dark:border-info-dark/50">
                      <Users className="h-8 w-8 mx-auto text-info mb-2" />
                      <p className="text-2xl font-bold text-info-dark dark:text-info">
                        {school.nombreEtudiants.toLocaleString()}
                      </p>
                      <p className="text-sm text-info dark:text-info">
                        Étudiants
                      </p>
                    </div>
                  )}
                  {school.tauxReussite && (
                    <div className="text-center p-4 rounded-xl bg-success-light dark:bg-success-dark/20 border border-success/30 dark:border-success-dark/50">
                      <Award className="h-8 w-8 mx-auto text-success mb-2" />
                      <p className="text-2xl font-bold text-success-dark dark:text-success">
                        {school.tauxReussite}%
                      </p>
                      <p className="text-sm text-success dark:text-success">
                        Taux de réussite
                      </p>
                    </div>
                  )}
                  {school.classementNational && (
                    <div className="text-center p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                      <Star className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">
                        #{school.classementNational}
                      </p>
                      <p className="text-sm text-primary dark:text-brand-500">
                        Classement national
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Programs Section */}
          {school.programs && school.programs.length > 0 && (
            <Card className="ops-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-brand-500" />
                  Programmes de formation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {school.programs.map((program) => (
                  <div
                    key={program.id}
                    className="p-4 rounded-xl border border-border bg-ops-hover/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-ops-primary">
                          {program.name}
                        </h4>
                        {program.description && (
                          <p className="text-sm text-ops-secondary mt-1">
                            {program.description}
                          </p>
                        )}
                        {program.duration && (
                          <p className="text-sm text-brand-600 dark:text-brand-400 mt-2">
                            Durée: {program.duration}
                          </p>
                        )}
                      </div>
                    </div>
                    {program.requirements && program.requirements.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-ops-tertiary mb-2">Prérequis:</p>
                        <div className="flex flex-wrap gap-2">
                          {program.requirements.map((req, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-ops-secondary"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Specializations */}
          {school.specializations && school.specializations.length > 0 && (
            <StudentDetailCard title="Spécialisations">
              <div className="flex flex-wrap gap-2">
                {school.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-linear-to-r from-[rgb(var(--brand-50))] to-[rgb(var(--brand-100))] text-brand-700 dark:from-[rgb(var(--brand-900))]/30 dark:to-[rgb(var(--brand-800))]/20 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </StudentDetailCard>
          )}

          {/* Advantages */}
          {school.avantages && school.avantages.length > 0 && (
            <Card className="ops-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Avantages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {school.avantages.map((avantage, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-ops-secondary">{avantage}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Infrastructure and Services */}
          {((school.infrastructures && school.infrastructures.length > 0) ||
            (school.services && school.services.length > 0)) && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
              {school.infrastructures && school.infrastructures.length > 0 && (
                <Card className="ops-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-ops-primary flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-brand-500" />
                      Infrastructures
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {school.infrastructures.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-ops-secondary"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {school.services && school.services.length > 0 && (
                <Card className="ops-card border border-border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-ops-primary flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-brand-500" />
                      Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {school.services.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-ops-secondary"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Partners */}
          {school.partenariats && school.partenariats.length > 0 && (
            <StudentDetailCard title="Partenariats">
              <div className="flex flex-wrap gap-2">
                {school.partenariats.map((partner) => (
                  <span
                    key={partner}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </StudentDetailCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Admission Info */}
          <Card className="ops-card border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-500" />
                Admission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {school.seuilDeSelection && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-ops-secondary">Seuil de sélection</span>
                  <span className="font-semibold text-ops-primary">
                    {school.seuilDeSelection}/20
                  </span>
                </div>
              )}
              {school.fraisInscription && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-ops-secondary">Frais d&apos;inscription</span>
                  <span className="font-semibold text-ops-primary">
                    {school.fraisInscription.toLocaleString()} DH
                  </span>
                </div>
              )}
              {school.datesConcours && (
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-ops-secondary">Dates concours</span>
                  <span className="font-semibold text-ops-primary">
                    {school.datesConcours}
                  </span>
                </div>
              )}
              {school.bourses && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-success-light dark:bg-success-dark/20 border border-success/30 dark:border-success-dark/50">
                  <Coins className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium text-success-dark dark:text-success">
                    Bourses disponibles
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Documents */}
          {school.documentsRequis && school.documentsRequis.length > 0 && (
            <Card className="ops-card border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Documents requis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {school.documentsRequis.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-ops-secondary">
                      <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card className="ops-card border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-ops-primary">
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ops-tertiary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-ops-primary">{school.city}</p>
                  {school.address && (
                    <p className="text-ops-secondary">{school.address}</p>
                  )}
                  {school.region && (
                    <p className="text-ops-tertiary">{school.region}</p>
                  )}
                </div>
              </div>
              {school.phone && (
                <a
                  href={`tel:${school.phone}`}
                  className="flex items-center gap-3 text-sm text-ops-secondary hover:text-brand-600 transition-colors"
                >
                  <Phone className="h-5 w-5 text-ops-tertiary" />
                  {school.phone}
                </a>
              )}
              {school.email && (
                <a
                  href={`mailto:${school.email}`}
                  className="flex items-center gap-3 text-sm text-ops-secondary hover:text-brand-600 transition-colors"
                >
                  <Mail className="h-5 w-5 text-ops-tertiary" />
                  {school.email}
                </a>
              )}
              {school.website && (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <Globe className="h-5 w-5" />
                  Visiter le site web
                </a>
              )}
            </CardContent>
          </Card>

          {/* Related Schools */}
          <StudentRelatedItems
            title="Écoles Similaires"
            description="Vous pourriez aussi être intéressé par"
            items={relatedItemsData}
            getHref={(id) => STUDENT_ROUTES.SCHOOL(id)}
            fallbackIcon={GraduationCap}
            maxItems={5}
            thumbnailAspect="video"
          />
        </div>
      </div>
    </div>
  );
}
