"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Receipt,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils/startup.utils";
import { EXPENSE_STATUS, MESSAGES } from "@/lib/constants";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExpenses, useCreateExpense, useExpenseMetrics } from "@/lib/hooks/use-expenses";
import { useMyStartups } from "@/lib/hooks/use-startups";
import { useCategories } from "@/lib/hooks/use-categories";
import { createExpenseSchema, type CreateExpenseInput } from "@/lib/validations/expense.validation";
import { STUDENT_ROUTES } from "@/lib/routes";
import type { StartupWithRelations, ExpenseWithRelations } from "@/lib/types/prisma";

export default function StudentExpensesPage() {
  const [isCreating, setIsCreating] = useState(false);
  
  // Get student's startups using the correct endpoint
  const { data: startupsData, isLoading: isLoadingStartups, error: startupsError } = useMyStartups();
  const startups = (startupsData?.data || []) as StartupWithRelations[];
  const selectedStartup = startups[0]; // Use first startup (students typically have one)
  
  // Get global categories (only active ones for selection)
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({
    isActive: true,
  });
  const categories = (categoriesData?.data || []) as Array<{ id: string; name: string }>;
  
  // Get expenses for the startup (only if startup exists)
  const { data: expensesData, isLoading: isLoadingExpenses } = useExpenses(
    selectedStartup?.id ? { startupId: selectedStartup.id } : undefined
  );
  const expenses = (expensesData?.data || []) as ExpenseWithRelations[];
  
  // Get metrics from service
  const { data: metricsData } = useExpenseMetrics(selectedStartup?.id);
  const metrics = metricsData?.data || { pendingCount: 0, pendingTotal: 0, approvedCount: 0, approvedTotal: 0, totalCount: 0 };
  
  const createMutation = useCreateExpense();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      startupId: selectedStartup?.id || "",
    },
  });
  
  const selectedCategoryId = watch("categoryId");
  const selectedStartupId = watch("startupId");
  
  // Update startupId when startups load
  useEffect(() => {
    if (selectedStartup && !selectedStartupId) {
      setValue("startupId", selectedStartup.id);
    }
  }, [selectedStartup, selectedStartupId, setValue]);
  
  const onSubmit = async (data: CreateExpenseInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.EXPENSE_CREATED);
      reset();
      setIsCreating(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };
  
  // Handle loading states
  if (isLoadingStartups) {
    return <LoadingState message="Loading your startups..." />;
  }
  
  // Handle errors
  if (startupsError) {
    return (
      <EmptyState
        title="Error loading startups"
        description="Please try refreshing the page or contact support if the issue persists"
      />
    );
  }
  
  // Handle no startup assigned
  if (!selectedStartup || startups.length === 0) {
    return (
      <EmptyState
        title="No startup assigned"
        description="Please contact an administrator to be assigned to a startup"
      />
    );
  }
  
  // Show loading for categories and expenses while startup is loaded
  if (isLoadingCategories || isLoadingExpenses) {
    return <LoadingState message={MESSAGES.LOADING.EXPENSES} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">
            My Expenses
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Submit and track expenses for {selectedStartup.name}
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="ops-btn-primary h-9 gap-2"
        >
          <Plus className="h-4 w-4" />
          Submit Expense
        </Button>
      </div>
      
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Pending Approval"
          value={metrics.pendingCount}
          icon={Clock}
          color="orange"
          subtitle="Awaiting review"
        />
        <MetricCard
          title="Approved Total"
          value={formatCurrency(metrics.approvedTotal || 0, { useK: true, decimals: 1 })}
          icon={DollarSign}
          color="mint"
          subtitle="Total approved"
        />
        <MetricCard
          title="Total Expenses"
          value={metrics.totalCount}
          icon={Receipt}
          color="blue"
          subtitle="All time"
        />
      </div>
      
      {/* Create Form */}
      {isCreating && (
        <Card className="ops-card border border-ops">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ops-primary">
              Submit New Expense
            </CardTitle>
            <CardDescription className="text-ops-secondary">
              Fill in the details below to submit an expense request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("categoryId", value)}
                  >
                    <SelectTrigger id="categoryId" className="ops-input h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-xs text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ops-tertiary">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      {...register("amount", { valueAsNumber: true })}
                      className="ops-input h-9 pl-7"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-destructive">{errors.amount.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  className="ops-input h-9"
                />
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe the expense..."
                  rows={4}
                  className="ops-input resize-none"
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="ops-btn-primary h-9"
                >
                  {isSubmitting || createMutation.isPending ? "Submitting..." : "Submit Expense"}
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
      
      {/* Expenses Table */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ops-primary">
            Expense History
          </CardTitle>
          <CardDescription className="text-ops-secondary">
            All expenses submitted for {selectedStartup.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <EmptyState
              title="No expenses yet"
              description="Submit your first expense to get started"
            />
          ) : (
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
                {expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-ops">
                    <TableCell>
                      <p className="text-sm text-ops-secondary">
                        {formatDate(expense.date)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-ops-primary">
                        {expense.category?.name || "Unknown"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-md text-ops-secondary">
                        {expense.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-ops-primary">
                        {formatCurrency(expense.amount)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={expense.status} className="h-6 text-xs" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
