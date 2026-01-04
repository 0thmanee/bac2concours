"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag, Plus, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useCategoryMetrics } from "@/lib/hooks/use-categories";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/startup.utils";
import { ADMIN_ROUTES, MESSAGES } from "@/lib/constants";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type CategoryWithCount,
} from "@/lib/validations/category.validation";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toApiParam } from "@/lib/utils/filter.utils";

// UI filter type for categories
interface CategoryUIFilters {
  search: string;
  status: string;
}

// Default filter values
const DEFAULT_FILTERS: CategoryUIFilters = {
  search: "",
  status: "",
};

export default function CategoriesPage() {
  // Filter state using proper types
  const [filters, setFilters] = useState<CategoryUIFilters>(DEFAULT_FILTERS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Filter change handler
  const updateFilter = useCallback(<K extends keyof CategoryUIFilters>(key: K, value: CategoryUIFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const { data: categoriesData, isLoading } = useCategories({
    search: toApiParam(filters.search),
    isActive: filters.status ? filters.status === "true" : undefined,
  });

  const { data: metricsData } = useCategoryMetrics();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(editingCategory?.id || "");
  const deleteMutation = useDeleteCategory();

  const categories = useMemo(
    () => (categoriesData?.data as CategoryWithCount[]) || [],
    [categoriesData]
  );

  const metrics = metricsData?.data || { totalCount: 0, activeCount: 0, inactiveCount: 0, totalExpensesCount: 0 };

  const handleDelete = useCallback(
    async (categoryId: string, categoryName: string) => {
      try {
        await deleteMutation.mutateAsync(categoryId);
        toast.success(`${categoryName} ${MESSAGES.SUCCESS.CATEGORY_DELETED}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
        );
      }
    },
    [deleteMutation]
  );

  const handleEdit = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.CATEGORIES} />;
  }

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "Total Categories",
      value: metrics.totalCount,
      icon: Tag,
      color: "blue",
      subtitle: "All categories",
    },
    {
      title: "Active",
      value: metrics.activeCount,
      icon: CheckCircle2,
      color: "mint",
      subtitle: "Active categories",
    },
    {
      title: "Inactive",
      value: metrics.inactiveCount,
      icon: XCircle,
      color: "rose",
      subtitle: "Inactive categories",
    },
    {
      title: "Total Expenses",
      value: metrics.totalExpensesCount,
      icon: Tag,
      color: "orange",
      subtitle: "Expenses using categories",
    },
  ];

  // Filters configuration
  const filtersConfig: FilterConfig[] = [
    {
      value: filters.status || "all",
      onChange: (value) => updateFilter("status", value === "all" ? "" : value),
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Categories"
        description="Manage expense categories used across all startups"
        actionLabel="Add Category"
        actionIcon={Plus}
        onActionClick={() => setIsCreateOpen(true)}
      />

      {/* Metric Cards */}
      <AdminStatsGrid stats={statsConfig} columns={4} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search categories by name or description..."
        filters={filtersConfig}
        resultsCount={categories.length}
        resultsLabel="category"
      />

      {/* Categories Table */}
      <Card className="ops-card border border-ops">
        <Table>
          <TableHeader>
            <TableRow className="border-ops">
              <TableHead className="font-medium text-ops-secondary">Name</TableHead>
              <TableHead className="font-medium text-ops-secondary">Description</TableHead>
              <TableHead className="font-medium text-ops-secondary">Status</TableHead>
              <TableHead className="font-medium text-ops-secondary">Expenses</TableHead>
              <TableHead className="font-medium text-ops-secondary">Created</TableHead>
              <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <EmptyState
                    title="No categories found"
                    description="Create your first category to get started"
                  />
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="border-ops">
                  <TableCell>
                    <p className="font-medium text-sm text-ops-primary">
                      {category.name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-ops-secondary max-w-md truncate">
                      {category.description || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={category.isActive ? "ACTIVE" : "INACTIVE"}
                      className="h-6 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-ops-secondary">
                      {category._count?.expenses || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-ops-secondary">
                      {formatDate(category.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="ops-card">
                        <DropdownMenuItem
                          className="text-sm"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
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
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {category.name}? This action
                                cannot be undone.
                                {category._count && category._count.expenses > 0 && (
                                  <span className="block mt-2 text-destructive">
                                    Warning: This category is used by {category._count.expenses} expense(s).
                                    You cannot delete it. Please deactivate it instead.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(category.id, category.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={category._count && category._count.expenses > 0}
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Category Dialog */}
      <CreateCategoryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={createMutation}
      />

      {/* Edit Category Dialog */}
      {editingCategory && (
        <EditCategoryDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          category={editingCategory}
          onUpdate={updateMutation}
        />
      )}
    </div>
  );
}

// Create Category Dialog Component
function CreateCategoryDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: ReturnType<typeof useCreateCategory>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: CreateCategoryInput) => {
    try {
      await onCreate.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.CATEGORY_CREATED);
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ops-card max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new expense category that can be used across all startups.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              className="ops-input h-9"
              placeholder="e.g., Marketing, Development, Legal"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="ops-input resize-none"
              placeholder="Brief description of this category"
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active
            </Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="ops-btn-secondary h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || onCreate.isPending}
              className="ops-btn-primary h-9"
            >
              {isSubmitting || onCreate.isPending ? "Creating..." : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Category Dialog Component
function EditCategoryDialog({
  open,
  onOpenChange,
  category,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithCount;
  onUpdate: ReturnType<typeof useUpdateCategory>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: UpdateCategoryInput) => {
    try {
      await onUpdate.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.CATEGORY_UPDATED);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ops-card max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update category information and status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              {...register("name")}
              className="ops-input h-9"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              {...register("description")}
              className="ops-input resize-none"
              rows={3}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="edit-isActive" className="text-sm font-medium">
              Active
            </Label>
            <Switch
              id="edit-isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="ops-btn-secondary h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || onUpdate.isPending}
              className="ops-btn-primary h-9"
            >
              {isSubmitting || onUpdate.isPending ? "Updating..." : "Update Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

