"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  History,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  Calendar,
  ArrowLeft,
  Eye,
  Trophy,
  TrendingUp,
  FileQuestion,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuizHistory, useQuizFilterOptions } from "@/lib/hooks/use-qcm";
import { LoadingState } from "@/components/shared/loading-state";
import { FilterPanel } from "@/components/ui/filter-panel";
import { FilterSelect } from "@/components/ui/filter-select";
import {
  StudentPageHeader,
  StudentEmptyState,
} from "@/components/student";
import { STUDENT_ROUTES } from "@/lib/routes";
import type { QuizAttempt } from "@prisma/client";
import { cn } from "@/lib/utils";

// Filters interface
interface HistoryFilters {
  school: string;
  matiere: string;
  sortBy: "createdAt" | "score" | "percentage";
  sortOrder: "asc" | "desc";
}

const DEFAULT_FILTERS: HistoryFilters = {
  school: "",
  matiere: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

// Format date for display
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Format time spent
function formatTimeSpent(seconds: number | null): string {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

// Get score color based on percentage
function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (percentage >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

// Get score badge variant
function getScoreBadgeVariant(percentage: number): "default" | "secondary" | "destructive" | "outline" {
  if (percentage >= 80) return "default";
  if (percentage >= 60) return "secondary";
  return "destructive";
}

export default function QuizHistoryPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch data
  const { data: historyData, isLoading } = useQuizHistory({
    school: filters.school || undefined,
    matiere: filters.matiere || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: currentPage,
    limit: pageSize,
  });

  const { data: filterOptions } = useQuizFilterOptions();

  // Extract data
  const attempts = historyData?.data?.attempts || [];
  const total = historyData?.data?.total || 0;
  const totalPages = historyData?.data?.totalPages || 1;
  const schools = filterOptions?.data?.schools || [];
  const matieres = filterOptions?.data?.matieres || [];

  // Filter handlers
  const updateFilter = useCallback(<K extends keyof HistoryFilters>(
    key: K,
    value: HistoryFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = filters.school || filters.matiere;

  if (isLoading) {
    return <LoadingState message="Chargement de l'historique..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={STUDENT_ROUTES.QUIZ}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <StudentPageHeader
          title="Historique des Quiz"
          count={total}
          countLabel="tentatives"
          countLabelSingular="tentative"
        />
      </div>

      {/* Filters */}
      <FilterPanel>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:flex-nowrap">
          <FilterSelect
            value={filters.school || "all"}
            onChange={(value) => updateFilter("school", value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Toutes les filières" },
              ...schools.map((s) => ({ value: s, label: s })),
            ]}
            placeholder="Filière"
            className="w-full sm:w-48"
          />

          <FilterSelect
            value={filters.matiere || "all"}
            onChange={(value) => updateFilter("matiere", value === "all" ? "" : value)}
            options={[
              { value: "all", label: "Toutes les matières" },
              ...matieres.map((m) => ({ value: m, label: m })),
            ]}
            placeholder="Matière"
            className="w-full sm:w-48"
          />

          <FilterSelect
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split("-") as [HistoryFilters["sortBy"], HistoryFilters["sortOrder"]];
              setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              setCurrentPage(1);
            }}
            options={[
              { value: "createdAt-desc", label: "Plus récent" },
              { value: "createdAt-asc", label: "Plus ancien" },
              { value: "percentage-desc", label: "Meilleur score" },
              { value: "percentage-asc", label: "Moins bon score" },
            ]}
            placeholder="Trier par"
            className="w-full sm:w-44"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </FilterPanel>

      {/* Results */}
      {attempts.length === 0 ? (
        <StudentEmptyState
          icon={History}
          title="Aucun quiz effectué"
          description={
            hasActiveFilters
              ? "Aucun quiz ne correspond à vos critères de recherche."
              : "Vous n'avez pas encore effectué de quiz. Commencez dès maintenant !"
          }
        />
      ) : (
        <>
          {/* Attempts List */}
          <div className="space-y-4">
            {attempts.map((attempt: QuizAttempt) => (
              <Card
                key={attempt.id}
                className="ops-card hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => router.push(STUDENT_ROUTES.QUIZ_ATTEMPT(attempt.id))}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Left: Quiz Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileQuestion className="h-5 w-5 text-[rgb(var(--brand-600))]" />
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {attempt.school} - {attempt.matiere}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(attempt.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {attempt.totalQuestions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTimeSpent(attempt.timeSpent)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Score */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={cn(
                          "text-2xl font-bold",
                          getScoreColor(attempt.percentage)
                        )}>
                          {Math.round(attempt.percentage)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {attempt.score}/{attempt.totalQuestions} correctes
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge
                        variant={getScoreBadgeVariant(attempt.percentage)}
                        className="hidden sm:inline-flex"
                      >
                        {attempt.percentage >= 80 ? (
                          <>
                            <Trophy className="h-3 w-3 mr-1" />
                            Excellent
                          </>
                        ) : attempt.percentage >= 60 ? (
                          <>
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Bien
                          </>
                        ) : attempt.percentage >= 40 ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Passable
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            À améliorer
                          </>
                        )}
                      </Badge>

                      {/* View button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
