"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Calendar, DollarSign, TrendingUp, Edit, Trash2 } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStartup, useDeleteStartup } from "@/lib/hooks/use-startups";
import { toast } from "sonner";
import { StartupBudgetChart } from "@/components/charts/startup-budget-chart";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  calculateSpentBudget,
  calculateUtilizationPercent,
  calculateRemainingBudget,
  calculateCategorySpentFromExpenses,
  formatCurrency,
  formatPercentage,
  formatDate,
} from "@/lib/utils/startup.utils";
import { ADMIN_ROUTES, MESSAGES, NUMERIC_CONSTANTS } from "@/lib/constants";

export default function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: startupData, isLoading, error, isError } = useStartup(id);
  const deleteMutation = useDeleteStartup();

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.STARTUP} />;
  }

  if (isError || error) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : MESSAGES.ERROR.STARTUP_NOT_FOUND
        }
        backHref={ADMIN_ROUTES.STARTUPS}
        backLabel="Back to Startups"
      />
    );
  }

  const startup = startupData?.data;

  if (!startup) {
    return (
      <ErrorState
        message={MESSAGES.ERROR.STARTUP_NOT_FOUND}
        backHref={ADMIN_ROUTES.STARTUPS}
        backLabel="Back to Startups"
      />
    );
  }

  const startupExpenses = startup.expenses || [];
  const spentBudget = calculateSpentBudget(startupExpenses);
  const remainingBudget = calculateRemainingBudget(startup.totalBudget, spentBudget);
  const utilizationPercent = calculateUtilizationPercent(spentBudget, startup.totalBudget);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(MESSAGES.SUCCESS.STARTUP_DELETED);
      router.push(ADMIN_ROUTES.STARTUPS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-ops-secondary">
          <Link href={ADMIN_ROUTES.STARTUPS}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-ops-primary">{startup.name}</h1>
              <StatusBadge status={startup.status} />
            </div>
            {startup.industry && (
              <p className="mt-1 text-sm text-ops-secondary">{startup.industry}</p>
            )}
            {startup.description && (
              <p className="mt-2 text-sm text-ops-tertiary">{startup.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="ops-btn-secondary h-9 gap-2">
              <Link href={ADMIN_ROUTES.STARTUP_EDIT(id)}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="ops-btn-secondary h-9 gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="ops-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Startup</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {startup.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Budget"
          value={formatCurrency(startup.totalBudget)}
          icon={DollarSign}
          color="blue"
          subtitle="Allocated budget"
        />
        <MetricCard
          title="Spent"
          value={formatCurrency(spentBudget)}
          icon={TrendingUp}
          color="orange"
          subtitle={formatPercentage(utilizationPercent)}
        />
        <MetricCard
          title="Remaining"
          value={formatCurrency(remainingBudget)}
          icon={DollarSign}
          color="mint"
          subtitle={formatPercentage(NUMERIC_CONSTANTS.PERCENTAGE_MAX - utilizationPercent)}
        />
        <MetricCard
          title="Students"
          value={startup.students.length}
          icon={Users}
          color="cyan"
          subtitle="Assigned students"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Budget Overview"
          description="Category breakdown"
        >
          <StartupBudgetChart startupId={id} />
        </ChartCard>
        <Card className="ops-card border border-ops">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ops-primary">Program Timeline</CardTitle>
            <CardDescription className="text-ops-secondary">Incubation period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-ops-tertiary" />
              <div>
                <p className="text-sm font-medium text-ops-primary">Start Date</p>
                <p className="text-xs text-ops-tertiary">
                  {formatDate(startup.incubationStart)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-ops-tertiary" />
              <div>
                <p className="text-sm font-medium text-ops-primary">End Date</p>
                <p className="text-xs text-ops-tertiary">
                  {formatDate(startup.incubationEnd)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ops-primary">Students</CardTitle>
          <CardDescription className="text-ops-secondary">Assigned students for this startup</CardDescription>
        </CardHeader>
        <CardContent>
          {startup.students.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {startup.students.map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
                  <div className="h-10 w-10 rounded-full bg-metric-blue-light flex items-center justify-center">
                    <Users className="h-5 w-5 text-metric-blue-dark" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ops-primary">{student.name}</p>
                    <p className="text-xs text-ops-tertiary">{student.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ops-tertiary">No students assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-ops-primary">Budget Categories</CardTitle>
              <CardDescription className="text-ops-secondary">Budget allocation by category</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="ops-btn-secondary h-8">
              <Link href={ADMIN_ROUTES.STARTUP_BUDGETS(id)}>
                Manage Budgets
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {startup.budgetCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-ops">
                  <TableHead className="font-medium text-ops-secondary">Category</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Allocated</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Spent</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Remaining</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {startup.budgetCategories.map((category) => {
                  const categorySpent = calculateCategorySpentFromExpenses(
                    category.name,
                    startupExpenses
                  );
                  const categoryRemaining = calculateRemainingBudget(category.maxBudget, categorySpent);
                  const categoryUtilization = calculateUtilizationPercent(categorySpent, category.maxBudget);
                  
                  return (
                    <TableRow key={category.id} className="border-ops">
                      <TableCell className="font-medium text-ops-primary">{category.name}</TableCell>
                      <TableCell>{formatCurrency(category.maxBudget)}</TableCell>
                      <TableCell>{formatCurrency(categorySpent)}</TableCell>
                      <TableCell>{formatCurrency(categoryRemaining)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full overflow-hidden bg-neutral-200" style={{ width: `${NUMERIC_CONSTANTS.PROGRESS_BAR_WIDTH * 4}px` }}>
                            <div
                              className="h-full rounded-full bg-metric-blue-main progress-bar"
                              style={{
                                "--progress-width": `${Math.min(categoryUtilization, NUMERIC_CONSTANTS.PERCENTAGE_MAX)}%`,
                              } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-xs text-ops-tertiary">{formatPercentage(categoryUtilization, 0)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No budget categories defined"
              description="Create budget categories to allocate funds"
            />
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ops-primary">Recent Expenses</CardTitle>
          <CardDescription className="text-ops-secondary">Latest expense submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {startup.expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-ops">
                  <TableHead className="font-medium text-ops-secondary">Date</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Category</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Description</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Amount</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {startup.expenses.slice(0, NUMERIC_CONSTANTS.RECENT_EXPENSES_LIMIT).map((expense) => (
                  <TableRow key={expense.id} className="border-ops">
                    <TableCell className="text-sm text-ops-secondary">
                      {formatDate(expense.date)}
                    </TableCell>
                    <TableCell className="text-sm text-ops-primary">{expense.category.name}</TableCell>
                    <TableCell className="text-sm text-ops-secondary">{expense.description}</TableCell>
                    <TableCell className="text-sm font-medium text-ops-primary">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={expense.status} className="h-5" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Expenses will appear here once submitted"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

