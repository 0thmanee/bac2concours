"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus, CheckCircle, XCircle, BarChart3 } from "lucide-react";
import { DataTable, Column, type PaginationConfig } from "@/components/ui/data-table";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminEmptyState,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
import {
  useQuestions,
  useDeleteQuestion,
  useQuestionStats,
  useQuestionFilterOptions,
  type QuestionWithRelations,
} from "@/lib/hooks/use-qcm";
import type { QuestionStatusType } from "@/lib/validations/qcm.validation";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { MESSAGES, ADMIN_ROUTES } from "@/lib/constants";
import { format } from "date-fns";
import { toApiParam } from "@/lib/utils/filter.utils";

// Filter interface
interface QuestionAdminFilters {
  search: string;
  school: string;
  matiere: string;
  difficulty: string;
  status: string;
}

// Default filter values
const DEFAULT_FILTERS: QuestionAdminFilters = {
  search: "",
  school: "",
  matiere: "",
  difficulty: "",
  status: "",
};

export default function AdminQCMPage() {
  // Filter state
  const [filters, setFilters] = useState<QuestionAdminFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // API calls
  const { data: questionsData, isLoading } = useQuestions({
    search: toApiParam(filters.search),
    school: toApiParam(filters.school),
    matiere: toApiParam(filters.matiere),
    difficulty: toApiParam(filters.difficulty) as "EASY" | "MEDIUM" | "HARD" | undefined,
    status: toApiParam(filters.status) as QuestionStatusType | undefined,
    page: currentPage,
    limit: pageSize,
  });

  const { data: statsData } = useQuestionStats();
  const { data: filtersData } = useQuestionFilterOptions();
  const deleteMutation = useDeleteQuestion();

  // Extract data from response
  const questions = questionsData?.data?.questions || [];
  const paginationData = questionsData?.data;
  const filterOptions = filtersData?.data || {
    schools: [],
    matieres: [],
    chapters: [],
    difficulties: [],
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

  // Filter change handler
  const updateFilter = useCallback(
    <K extends keyof QuestionAdminFilters>(key: K, value: QuestionAdminFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const stats = statsData?.data || {
    totalQuestions: 0,
    activeQuestions: 0,
    questionsBySchool: {},
    questionsByMatiere: {},
    questionsByDifficulty: {},
    averageSuccessRate: 0,
  };

  const handleDelete = useCallback(
    async (questionId: string) => {
      try {
        await deleteMutation.mutateAsync(questionId);
        toast.success("Question supprimée avec succès");
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
      ACTIVE:
        "bg-linear-to-r from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200",
      INACTIVE:
        "bg-linear-to-r from-gray-50 to-gray-100 text-muted-foreground border-border",
      DRAFT:
        "bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Actif",
      INACTIVE: "Inactif",
      DRAFT: "Brouillon",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[status] || styles.ACTIVE}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const styles: Record<string, string> = {
      EASY: "bg-success-light text-success-dark border-success-light",
      MEDIUM: "bg-warning-light text-warning-dark border-warning/30",
      HARD: "bg-error-light text-error-dark border-error/30",
    };
    const labels: Record<string, string> = {
      EASY: "Facile",
      MEDIUM: "Moyen",
      HARD: "Difficile",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles[difficulty] || styles.MEDIUM}`}
      >
        {labels[difficulty] || difficulty}
      </span>
    );
  };

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "Total Questions",
      value: stats.totalQuestions,
      icon: HelpCircle,
      color: "blue",
    },
    {
      title: "Questions Actives",
      value: stats.activeQuestions,
      icon: CheckCircle,
      color: "mint",
    },
    {
      title: "Taux de Réussite",
      value: `${stats.averageSuccessRate}%`,
      icon: BarChart3,
      color: "purple",
    },
    {
      title: "Par Difficulté",
      value: Object.keys(stats.questionsByDifficulty).length,
      icon: XCircle,
      color: "orange",
    },
  ];

  // Filter configuration
  const filterConfig: FilterConfig[] = [
    {
      value: filters.school || "all",
      onChange: (value: string) => updateFilter("school", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Toutes les écoles" },
        ...(filterOptions.schools.length > 0
          ? filterOptions.schools.map((s) => ({ value: s, label: s }))
          : [
              { value: "Sciences Mathématiques", label: "Sciences Mathématiques" },
              { value: "Sciences Physiques", label: "Sciences Physiques" },
            ]),
      ],
    },
    {
      value: filters.matiere || "all",
      onChange: (value: string) => updateFilter("matiere", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Toutes les matières" },
        ...(filterOptions.matieres.length > 0
          ? filterOptions.matieres.map((m) => ({ value: m, label: m }))
          : [
              { value: "Mathématiques", label: "Mathématiques" },
              { value: "Physique", label: "Physique" },
            ]),
      ],
    },
    {
      value: filters.difficulty || "all",
      onChange: (value: string) => updateFilter("difficulty", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Toutes difficultés" },
        { value: "EASY", label: "Facile" },
        { value: "MEDIUM", label: "Moyen" },
        { value: "HARD", label: "Difficile" },
      ],
    },
    {
      value: filters.status || "all",
      onChange: (value: string) => updateFilter("status", value === "all" ? "" : value),
      options: [
        { value: "all", label: "Tous statuts" },
        { value: "ACTIVE", label: "Actif" },
        { value: "INACTIVE", label: "Inactif" },
        { value: "DRAFT", label: "Brouillon" },
      ],
    },
  ];

  // Table columns
  const columns: Column<QuestionWithRelations>[] = [
    {
      header: "Question",
      cell: (question: QuestionWithRelations) => (
        <div className="max-w-md">
          <div
            className="text-sm font-medium text-ops-primary line-clamp-2"
            dangerouslySetInnerHTML={{
              __html:
                question.text.length > 100
                  ? question.text.substring(0, 100) + "..."
                  : question.text,
            }}
          />
          <div className="text-xs text-ops-tertiary mt-1">
            {(question.options as { id: string; text: string }[]).length} options
          </div>
        </div>
      ),
    },
    {
      header: "École/Matière",
      cell: (question: QuestionWithRelations) => (
        <div>
          <div className="text-sm font-medium">{question.school}</div>
          <div className="text-xs text-ops-tertiary">{question.matiere}</div>
        </div>
      ),
    },
    {
      header: "Difficulté",
      cell: (question: QuestionWithRelations) => getDifficultyBadge(question.difficulty),
    },
    {
      header: "Stats",
      cell: (question: QuestionWithRelations) => {
        const successRate =
          question.timesAnswered > 0
            ? Math.round((question.timesCorrect / question.timesAnswered) * 100)
            : 0;
        return (
          <div className="text-sm">
            <div className="font-medium">{question.timesAnswered} réponses</div>
            <div className="text-xs text-ops-tertiary">{successRate}% réussite</div>
          </div>
        );
      },
    },
    {
      header: "Statut",
      cell: (question: QuestionWithRelations) => getStatusBadge(question.status),
    },
    {
      header: "Créé le",
      cell: (question: QuestionWithRelations) => (
        <span className="text-sm text-ops-tertiary">
          {format(new Date(question.createdAt), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (question: QuestionWithRelations) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ops-card">
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.QCM_VIEW(question.id)}>
                Voir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={ADMIN_ROUTES.QCM_EDIT(question.id)}>
                Modifier
              </Link>
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-destructive focus:text-destructive"
                >
                  Supprimer
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cette question?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. La question sera
                    définitivement supprimée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(question.id)}
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
    return <LoadingState message="Chargement des questions..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Gestion des QCM"
        description="Gérez les questions à choix multiples"
        actionLabel="Nouvelle Question"
        actionHref={ADMIN_ROUTES.QCM_NEW}
        actionIcon={Plus}
      />

      {/* Stats */}
      <AdminStatsGrid stats={statsConfig} columns={4} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Rechercher une question..."
        filters={filterConfig}
        resultsCount={paginationData?.total || questions.length}
        resultsLabel="question"
      />

      {/* Table or Empty State */}
      <DataTable
        data={questions}
        columns={columns}
        keyExtractor={(question: QuestionWithRelations) => question.id}
        pagination={pagination}
        emptyState={
          <AdminEmptyState
            icon={HelpCircle}
            title="Aucune question trouvée"
            description="Commencez par ajouter votre première question QCM."
          />
        }
      />
    </div>
  );
}
