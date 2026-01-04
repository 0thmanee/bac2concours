"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Plus, MoreHorizontal, TrendingUp, DollarSign } from "lucide-react";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
import { ChartCard } from "@/components/ui/chart-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StartupGrowthChart } from "@/components/charts/startup-growth-chart";
import { CategorySpendingChart } from "@/components/charts/category-spending-chart";
import { useStartups, useDeleteStartup, useStartupMetrics } from "@/lib/hooks/use-startups";
import { StartupWithRelations } from "@/lib/types/prisma";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  calculateUtilizationPercent,
  formatCurrency,
  formatPercentage,
  getStudentsDisplay,
} from "@/lib/utils/startup.utils";
import { ADMIN_ROUTES, MESSAGES, NUMERIC_CONSTANTS } from "@/lib/constants";
import { toApiParam } from "@/lib/utils/filter.utils";

// UI filter type for startups
interface StartupUIFilters {
  search: string;
}

// Default filter values
const DEFAULT_FILTERS: StartupUIFilters = {
  search: "",
};

export default function StartupsPage() {
  // Filter state using proper types
  const [filters, setFilters] = useState<StartupUIFilters>(DEFAULT_FILTERS);
  
  // Filter change handler
  const updateFilter = useCallback(<K extends keyof StartupUIFilters>(key: K, value: StartupUIFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const { data: startupsData, isLoading } = useStartups({
    search: toApiParam(filters.search),
    includeSpentBudgets: true,
  });
  const { data: metricsData } = useStartupMetrics();
  const deleteMutation = useDeleteStartup();

  const startups = useMemo(
    () => (startupsData?.data as (StartupWithRelations & { spentBudget?: number })[]) || [],
    [startupsData]
  );

  const startupMetrics = metricsData?.data || { activeCount: 0, totalBudget: 0, totalSpent: 0, totalCount: 0, totalStudents: 0 };
  const utilizationPercent = useMemo(
    () => calculateUtilizationPercent(startupMetrics.totalSpent, startupMetrics.totalBudget),
    [startupMetrics.totalSpent, startupMetrics.totalBudget]
  );

  const handleDelete = useCallback(
    async (startupId: string, startupName: string) => {
      try {
        await deleteMutation.mutateAsync(startupId);
        toast.success(`${startupName} ${MESSAGES.SUCCESS.STARTUP_DELETED}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
        );
      }
    },
    [deleteMutation]
  );

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.STARTUPS} />;
  }

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "Active Startups",
      value: startupMetrics.activeCount,
      icon: Building2,
      color: "blue",
      subtitle: `${startupMetrics.totalCount} total startups`,
    },
    {
      title: "Total Budget",
      value: formatCurrency(startupMetrics.totalBudget, { useK: true }),
      icon: DollarSign,
      color: "orange",
      subtitle: "Across all programs",
    },
    {
      title: "Budget Utilized",
      value: formatCurrency(startupMetrics.totalSpent, { useK: true }),
      icon: TrendingUp,
      color: "mint",
      subtitle: formatPercentage(utilizationPercent),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Startups"
        description="Manage startups in your incubation program"
        actionLabel="Add Startup"
        actionHref={ADMIN_ROUTES.STARTUP_NEW}
        actionIcon={Plus}
      />

      {/* Metric Cards */}
      <AdminStatsGrid stats={statsConfig} columns={3} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Startup Growth"
          description="Active startups over time"
          className="lg:col-span-2"
        >
          <StartupGrowthChart />
        </ChartCard>

        <ChartCard
          title="Total Spending"
          description="By category"
        >
          <CategorySpendingChart />
        </ChartCard>
      </div>

      {/* Search */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search startups..."
        filters={[]}
        resultsCount={startups.length}
        resultsLabel="startup"
      />

      {/* Startups Table */}
      <Card className="ops-card border border-ops">
        <Table>
          <TableHeader>
            <TableRow className="border-ops">
              <TableHead className="font-medium text-ops-secondary">Startup</TableHead>
              <TableHead className="font-medium text-ops-secondary">Students</TableHead>
              <TableHead className="font-medium text-ops-secondary">Budget</TableHead>
              <TableHead className="font-medium text-ops-secondary">Spent</TableHead>
              <TableHead className="font-medium text-ops-secondary">Status</TableHead>
              <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {startups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <EmptyState
                    title="No startups found"
                    description="Create your first startup to get started"
                  />
                </TableCell>
              </TableRow>
            ) : (
              startups.map((startup) => {
                const spentBudget = startup.spentBudget || 0;
                const utilizationPercent = calculateUtilizationPercent(
                  spentBudget,
                  startup.totalBudget
                );

                return (
                  <TableRow key={startup.id} className="border-ops">
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-ops-primary">
                          {startup.name}
                        </p>
                        {startup.industry && (
                          <p className="text-xs text-ops-tertiary">
                            {startup.industry}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-ops-secondary">
                        {getStudentsDisplay(startup.students)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-ops-primary">
                        {formatCurrency(startup.totalBudget)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-ops-primary">
                          {formatCurrency(spentBudget)}
                        </p>
                        <div className="mt-1 h-1.5 rounded-full overflow-hidden bg-neutral-200" style={{ width: `${NUMERIC_CONSTANTS.PROGRESS_BAR_WIDTH * 4}px` }}>
                          <div
                            className="h-full rounded-full bg-metric-blue-main progress-bar"
                            style={{
                              "--progress-width": `${Math.min(utilizationPercent, NUMERIC_CONSTANTS.PERCENTAGE_MAX)}%`,
                            } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={startup.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="ops-card">
                          <DropdownMenuItem asChild className="text-sm">
                            <Link href={ADMIN_ROUTES.STARTUP(startup.id)}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="text-sm">
                            <Link href={ADMIN_ROUTES.STARTUP_EDIT(startup.id)}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="text-sm">
                            <Link href={ADMIN_ROUTES.STARTUP_BUDGETS(startup.id)}>
                              Manage Budget
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-sm text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="ops-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Startup</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {startup.name}? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(startup.id, startup.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
