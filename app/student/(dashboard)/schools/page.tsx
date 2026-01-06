"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, Users, Award } from "lucide-react";
import { useSchools, useSchoolFilterOptions } from "@/lib/hooks/use-schools";
import type { SchoolUIFilters, SchoolWithRelations, SchoolTypeInput } from "@/lib/validations/school.validation";
import { SchoolStatus } from "@prisma/client";
import { LoadingState } from "@/components/shared/loading-state";
import { SearchInput } from "@/components/ui/search-input";
import { FilterSelect } from "@/components/ui/filter-select";
import { FilterPanel } from "@/components/ui/filter-panel";
import { TablePagination } from "@/components/ui/data-table";
import { STUDENT_ROUTES } from "@/lib/routes";
import { toApiParam } from "@/lib/utils/filter.utils";
import {
  StudentPageHeader,
  StudentEmptyState,
  StudentMediaCard,
} from "@/components/student";

// School type labels
const SCHOOL_TYPE_LABELS: Record<string, string> = {
  UNIVERSITE: "Université",
  ECOLE_INGENIEUR: "École d'Ingénieur",
  ECOLE_COMMERCE: "École de Commerce",
  INSTITUT: "Institut",
  FACULTE: "Faculté",
};

// Default filter values
const DEFAULT_FILTERS: SchoolUIFilters = {
  search: "",
  type: "",
  city: "",
  status: "",
};

export default function StudentSchoolsPage() {
  const router = useRouter();

  // Filter state using proper types
  const [filters, setFilters] = useState<SchoolUIFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // API calls with proper params
  const { data: schoolsData, isLoading } = useSchools({
    search: toApiParam(filters.search),
    type: toApiParam(filters.type) as SchoolTypeInput | undefined,
    city: toApiParam(filters.city),
    status: SchoolStatus.ACTIVE,
    isPublic: true,
    page: currentPage,
    limit: pageSize,
    sortBy: "views",
    sortOrder: "desc",
  });

  const { data: filtersData } = useSchoolFilterOptions();

  // Extract data from response
  const schools = (schoolsData?.data?.schools as SchoolWithRelations[]) || [];
  const paginationData = schoolsData?.data;
  const filterOptions = filtersData?.data || {
    types: [],
    cities: [],
    regions: [],
  };

  // Filter change handler - resets pagination
  const updateFilter = useCallback(
    <K extends keyof SchoolUIFilters>(key: K, value: SchoolUIFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  if (isLoading) {
    return <LoadingState message="Chargement des écoles..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <StudentPageHeader
        title="Écoles et Universités"
        count={paginationData?.total || schools.length}
        countLabel="écoles"
        countLabelSingular="école"
      />

      {/* Search and Filter Controls */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            placeholder="Rechercher une école..."
            containerClassName="flex-1 min-w-full sm:min-w-[250px]"
          />

          <FilterSelect
            value={filters.type || "all"}
            onChange={(value) => updateFilter("type", value === "all" ? "" : value)}
            options={[
              "Tous les types",
              ...filterOptions.types.map((t) => SCHOOL_TYPE_LABELS[t] || t),
            ]}
            placeholder="Type"
            className="w-full sm:w-45"
          />

          <FilterSelect
            value={filters.city || "all"}
            onChange={(value) => updateFilter("city", value === "all" ? "" : value)}
            options={["Toutes les villes", ...filterOptions.cities]}
            placeholder="Ville"
            className="w-full sm:w-45"
          />
        </div>
      </FilterPanel>

      {/* Schools Grid */}
      {schools.length === 0 ? (
        <StudentEmptyState
          icon={GraduationCap}
          title="Aucune école trouvée"
          description="Essayez de modifier vos critères de recherche ou vos filtres."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {schools.map((school) => (
            <StudentMediaCard
              key={school.id}
              onClick={() => router.push(STUDENT_ROUTES.SCHOOL(school.id))}
              thumbnailUrl={school.imageFile?.publicUrl || school.logoFile?.publicUrl}
              thumbnailAlt={school.name}
              thumbnailAspect="video"
              fallbackIcon={GraduationCap}
              badge={
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-sm text-gray-700 shadow-sm border border-white/50">
                  {SCHOOL_TYPE_LABELS[school.type] || school.type}
                </span>
              }
              title={school.shortName ? `${school.name} (${school.shortName})` : school.name}
              description={school.description}
              category={school.city}
              level={school.region || undefined}
              metrics={[
                { icon: Eye, value: school.views || 0 },
                ...(school.nombreEtudiants
                  ? [{ icon: Users, value: `${school.nombreEtudiants} étudiants` }]
                  : []),
                ...(school.classementNational
                  ? [{ icon: Award, value: `#${school.classementNational}` }]
                  : []),
              ]}
              overlayContent={
                school.featured ? (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-sm">
                      <Award className="h-3 w-3 mr-1" />
                      Recommandée
                    </span>
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {paginationData && paginationData.totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={paginationData.totalPages}
          totalItems={paginationData.total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
