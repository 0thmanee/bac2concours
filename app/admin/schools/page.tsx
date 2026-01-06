"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Eye, Star, MapPin, Users } from "lucide-react";
import { DataTable, Column, type PaginationConfig } from "@/components/ui/data-table";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminEmptyState,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
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
import { SupabaseImage } from "@/components/ui/supabase-image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { MESSAGES, ADMIN_ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import {
  useSchools,
  useSchoolStats,
  useSchoolFilterOptions,
  useDeleteSchool,
} from "@/lib/hooks/use-schools";
import type { SchoolUIFilters, SchoolWithRelations, SchoolTypeInput, SchoolStatusInput } from "@/lib/validations/school.validation";
import { toApiParam } from "@/lib/utils/filter.utils";

// Extended UI filters for schools (includes additional admin filters)
interface SchoolAdminFilters extends SchoolUIFilters {
  region: string;
}

// Default filter values
const DEFAULT_FILTERS: SchoolAdminFilters = {
  search: "",
  type: "",
  city: "",
  status: "",
  region: "",
};

// School type labels
const SCHOOL_TYPE_LABELS: Record<string, string> = {
  UNIVERSITE: "Université",
  ECOLE_INGENIEUR: "École d'Ingénieur",
  ECOLE_COMMERCE: "École de Commerce",
  INSTITUT: "Institut",
  FACULTE: "Faculté",
};

export default function AdminSchoolsPage() {
  // Filter state using proper types
  const [filters, setFilters] = useState<SchoolAdminFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API calls with proper params
  const { data: schoolsData, isLoading } = useSchools({
    search: toApiParam(filters.search),
    type: toApiParam(filters.type) as SchoolTypeInput | undefined,
    city: toApiParam(filters.city),
    region: toApiParam(filters.region),
    status: toApiParam(filters.status) as SchoolStatusInput | undefined,
    page: currentPage,
    limit: pageSize,
  });

  const { data: statsData } = useSchoolStats();
  const { data: filtersData } = useSchoolFilterOptions();
  const deleteMutation = useDeleteSchool();

  // Extract data from response
  const schools = (schoolsData?.data?.schools as SchoolWithRelations[]) || [];
  const paginationData = schoolsData?.data;
  const filterOptions = filtersData?.data || {
    types: [],
    cities: [],
    regions: [],
  };

  // Pagination config
  const pagination: PaginationConfig | undefined = paginationData
    ? {
        currentPage: paginationData.page,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.total,
        pageSize: paginationData.limit,
        onPageChange: setCurrentPage,
      }
    : undefined;

  // Filter change handler - resets pagination
  const updateFilter = useCallback(<K extends keyof SchoolAdminFilters>(key: K, value: SchoolAdminFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const stats = statsData?.data || {
    totalSchools: 0,
    activeSchools: 0,
    featuredSchools: 0,
    totalViews: 0,
    schoolsByType: {},
    schoolsByCity: {},
  };

  const handleDelete = useCallback(
    async (schoolId: string, schoolName: string) => {
      try {
        await deleteMutation.mutateAsync(schoolId);
        toast.success(`"${schoolName}" a été supprimée avec succès`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
        );
      }
    },
    [deleteMutation]
  );

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
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[status] || styles.DRAFT}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "Total Écoles",
      value: stats.totalSchools,
      icon: GraduationCap,
      color: "blue",
      subtitle: `${stats.activeSchools} actives`,
    },
    {
      title: "À la une",
      value: stats.featuredSchools,
      icon: Star,
      color: "orange",
      subtitle: "Écoles mises en avant",
    },
    {
      title: "Total Vues",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "mint",
      subtitle: "Total",
    },
    {
      title: "Villes",
      value: Object.keys(stats.schoolsByCity).length,
      icon: MapPin,
      color: "purple",
      subtitle: "Couvertes",
    },
  ];

  // Filters configuration
  const filtersConfig: FilterConfig[] = [
    {
      value: filters.type || "all",
      onChange: (value) => updateFilter("type", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Tous types" },
        ...filterOptions.types.map((type) => ({ 
          value: type, 
          label: SCHOOL_TYPE_LABELS[type] || type 
        })),
      ],
    },
    {
      value: filters.city || "all",
      onChange: (value) => updateFilter("city", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Toutes villes" },
        ...filterOptions.cities.map((city) => ({ value: city, label: city })),
      ],
    },
    {
      value: filters.status || "all",
      onChange: (value) => updateFilter("status", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Tous statuts" },
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "DRAFT", label: "Brouillon" },
      ],
    },
  ];

  const columns: Column<SchoolWithRelations>[] = [
    {
      header: "École",
      cell: (school) => (
        <div className="flex items-start gap-3">
          {school.logoFile?.publicUrl ? (
            <SupabaseImage
              src={school.logoFile.publicUrl}
              alt={school.name}
              width={36}
              height={36}
              className="h-9 w-9 rounded object-cover shrink-0"
            />
          ) : (
            <div className="h-9 w-9 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {school.shortName || school.name}
            </p>
            {school.shortName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {school.name}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (school) => (
        <p className="text-sm text-gray-900 dark:text-white">
          {SCHOOL_TYPE_LABELS[school.type] || school.type}
        </p>
      ),
    },
    {
      header: "Localisation",
      cell: (school) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          <p className="text-sm text-gray-900 dark:text-white">
            {school.city}
          </p>
        </div>
      ),
    },
    {
      header: "Statistiques",
      cell: (school) => (
        <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {school.views}
          </span>
          {school.nombreEtudiants && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {school.nombreEtudiants.toLocaleString()}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (school) => (
        <div className="flex items-center gap-1 flex-wrap">
          {getStatusBadge(school.status)}
          {school.featured && (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-linear-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200">
              <Star className="h-3 w-3 mr-1 fill-current" />
              À la une
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Ajouté le",
      cell: (school) => (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(school.createdAt), "MMM d, yyyy")}
        </p>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (school) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ops-card">
            <DropdownMenuItem asChild className="text-sm">
              <Link
                href={ADMIN_ROUTES.SCHOOL(school.id)}
                className="cursor-pointer"
              >
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-sm">
              <Link
                href={ADMIN_ROUTES.SCHOOL_EDIT(school.id)}
                className="cursor-pointer"
              >
                Modifier
              </Link>
            </DropdownMenuItem>
            {school.website && (
              <DropdownMenuItem asChild className="text-sm">
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  Visiter le site
                </a>
              </DropdownMenuItem>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-sm text-destructive cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  Supprimer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l&apos;école</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer &ldquo;{school.name}
                    &rdquo; ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(school.id, school.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState message="Chargement des écoles..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Écoles"
        description="Gérer les écoles et institutions de la plateforme"
        actionLabel="Ajouter une école"
        actionHref={ADMIN_ROUTES.SCHOOL_NEW}
        actionIcon={Plus}
      />

      {/* Metric Cards */}
      <AdminStatsGrid stats={statsConfig} columns={4} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Rechercher des écoles..."
        filters={filtersConfig}
        resultsCount={paginationData?.total || schools.length}
        resultsLabel="résultat"
      />

      {/* Schools Table */}
      <DataTable
        data={schools}
        columns={columns}
        keyExtractor={(school) => school.id}
        isLoading={isLoading}
        pagination={pagination}
        emptyState={
          <AdminEmptyState
            icon={GraduationCap}
            title="Aucune école trouvée"
            description="Ajoutez votre première école pour commencer"
          />
        }
      />
    </div>
  );
}
