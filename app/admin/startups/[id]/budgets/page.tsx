"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStartup } from "@/lib/hooks/use-startups";
import { useBudgets, useCreateBudget, useDeleteBudget, useBudgetMetrics } from "@/lib/hooks/use-budgets";
import type { BudgetCategoryWithSpent } from "@/lib/validations/budget.validation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBudgetCategorySchema, type CreateBudgetCategoryInput } from "@/lib/validations/budget.validation";
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
import { useState } from "react";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import {
  calculateRemainingBudget,
  calculateUtilizationPercent,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils/startup.utils";
import { ADMIN_ROUTES, MESSAGES, NUMERIC_CONSTANTS } from "@/lib/constants";

export default function StartupBudgetsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: startupData, isLoading: startupLoading } = useStartup(id);
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets(id, { includeSpent: true });
  const { data: metricsData } = useBudgetMetrics(id);
  const createMutation = useCreateBudget(id);
  const deleteMutation = useDeleteBudget(id);
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBudgetCategoryInput>({
    resolver: zodResolver(createBudgetCategorySchema),
  });

  const onSubmit = async (data: CreateBudgetCategoryInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.BUDGET_CREATED);
      reset();
      setIsCreating(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteMutation.mutateAsync(categoryId);
      toast.success(MESSAGES.SUCCESS.BUDGET_DELETED);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  if (startupLoading || budgetsLoading) {
    return <LoadingState message={MESSAGES.LOADING.BUDGETS} />;
  }

  const startup = startupData?.data;
  const categoriesWithSpent = budgetsData?.data || [];
  const categories = (Array.isArray(categoriesWithSpent) 
    ? categoriesWithSpent 
    : []) as BudgetCategoryWithSpent[];
  const metrics = metricsData?.data || { totalAllocated: 0, totalSpent: 0 };

  if (!startup) {
    return (
      <ErrorState
        message={MESSAGES.ERROR.STARTUP_NOT_FOUND}
        backHref={ADMIN_ROUTES.STARTUPS}
        backLabel="Back to Startups"
      />
    );
  }
  
  const remaining = calculateRemainingBudget(startup?.totalBudget || 0, metrics.totalAllocated); 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-ops-secondary">
          <Link href={ADMIN_ROUTES.STARTUP(id)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startup
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ops-primary">
              Budget Management
            </h1>
            <p className="mt-1 text-sm text-ops-secondary">
              {startup?.name || "Unknown"} - Allocate budget to categories
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="ops-btn-primary h-9 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="ops-card border border-ops">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-metric-blue-light flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-metric-blue-dark" />
              </div>
              <div>
                <p className="text-xs text-ops-tertiary">Total Budget</p>
                <p className="text-sm font-semibold text-ops-primary">
                  {formatCurrency(startup?.totalBudget || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="ops-card border border-ops">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-metric-orange-light flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-metric-orange-dark" />
              </div>
              <div>
                <p className="text-xs text-ops-tertiary">Allocated</p>
                <p className="text-sm font-semibold text-ops-primary">
                  {formatCurrency(metrics.totalAllocated)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="ops-card border border-ops">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-metric-cyan-light flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-metric-cyan-dark" />
              </div>
              <div>
                <p className="text-xs text-ops-tertiary">Spent</p>
                <p className="text-sm font-semibold text-ops-primary">
                  {formatCurrency(metrics.totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="ops-card border border-ops">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-metric-mint-light flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-metric-mint-dark" />
              </div>
              <div>
                <p className="text-xs text-ops-tertiary">Remaining</p>
                <p className="text-sm font-semibold text-ops-primary">
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="ops-card border border-ops">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ops-primary">
              Create Budget Category
            </CardTitle>
            <CardDescription className="text-ops-secondary">
              Allocate a portion of the total budget to a specific category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Category Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., Marketing, Development"
                    className="ops-input h-9"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget" className="text-sm font-medium">
                    Budget Amount <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ops-tertiary">
                      $
                    </span>
                    <Input
                      id="maxBudget"
                      type="number"
                      placeholder="10000"
                      min="0"
                      step="100"
                      {...register("maxBudget", { valueAsNumber: true })}
                      className="ops-input h-9 pl-7"
                    />
                  </div>
                  {errors.maxBudget && (
                    <p className="text-xs text-destructive">{errors.maxBudget.message}</p>
                  )}
                  <p className="text-xs text-ops-tertiary">
                    Remaining budget: {formatCurrency(remaining)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="ops-btn-primary h-9"
                >
                  {createMutation.isPending ? "Creating..." : "Create Category"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    reset();
                  }}
                  className="ops-btn-secondary h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Table */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ops-primary">
            Budget Categories
          </CardTitle>
          <CardDescription className="text-ops-secondary">
            Manage budget allocation by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-ops">
                  <TableHead className="font-medium text-ops-secondary">Category</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Allocated</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Spent</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Remaining</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Utilization</TableHead>
                  <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const categorySpent = category.spent;
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
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="ops-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {category.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No budget categories yet"
              description="Create your first category to get started"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

