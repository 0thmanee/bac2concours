"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, MoreHorizontal, UserPlus, Shield, User } from "lucide-react";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  AdminPageHeader,
  AdminStatsGrid,
  AdminFilterBar,
  AdminEmptyState,
  type AdminStatItem,
  type FilterConfig,
} from "@/components/admin";
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
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useUserMetrics } from "@/lib/hooks/use-users";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { MESSAGES, USER_ROLE, USER_STATUS } from "@/lib/constants";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserUIFilters,
} from "@/lib/validations/user.validation";
import { Label } from "@/components/ui/label";
import { type PaginationConfig } from "@/components/ui/data-table";
import { toApiParam } from "@/lib/utils/filter.utils";

// User type based on what's returned from the user service
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  emailVerified: Date | boolean | null;
  paymentStatus?: string | null;
  paymentProofUrl?: string | null;
  paymentSubmittedAt?: Date | string | null;
  paymentReviewedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

// Helper function to format date
function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Default filter values
const DEFAULT_FILTERS: UserUIFilters = {
  search: "",
  role: "",
  status: "",
};

export default function UsersPage() {
  // Filter state using proper types
  const [filters, setFilters] = useState<UserUIFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // API calls with proper params
  const { data: usersData, isLoading } = useUsers({
    search: toApiParam(filters.search),
    role: toApiParam(filters.role) as typeof USER_ROLE.ADMIN | typeof USER_ROLE.STUDENT | undefined,
    status: toApiParam(filters.status) as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE | undefined,
    page: currentPage,
    limit: pageSize,
  });

  const { data: metricsData } = useUserMetrics();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(editingUser?.id || "");
  const deleteMutation = useDeleteUser();

  // Extract data from response
  const users = usersData?.data?.users || [];
  const paginationData = usersData?.data;
  const metrics = metricsData?.data || {
    totalCount: 0,
    adminCount: 0,
    studentCount: 0,
    activeCount: 0,
    verifiedCount: 0,
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
  const updateFilter = useCallback(<K extends keyof UserUIFilters>(key: K, value: UserUIFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleDelete = useCallback(
    async (userId: string, userName: string) => {
      try {
        await deleteMutation.mutateAsync(userId);
        toast.success(`${userName} ${MESSAGES.SUCCESS.USER_DELETED}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
        );
      }
    },
    [deleteMutation]
  );

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.USERS} />;
  }

  // Stats configuration
  const statsConfig: AdminStatItem[] = [
    {
      title: "Total Users",
      value: metrics.totalCount,
      icon: Users,
      color: "blue",
      subtitle: "All users",
    },
    {
      title: "Admins",
      value: metrics.adminCount,
      icon: Shield,
      color: "purple",
      subtitle: "Administrators",
    },
    {
      title: "Students",
      value: metrics.studentCount,
      icon: User,
      color: "cyan",
      subtitle: "Platform students",
    },
    {
      title: "Active",
      value: metrics.activeCount,
      icon: UserPlus,
      color: "mint",
      subtitle: "Active users",
    },
    {
      title: "Verified",
      value: metrics.verifiedCount,
      icon: UserPlus,
      color: "orange",
      subtitle: "Email verified",
    },
  ];

  // Filters configuration
  const filtersConfig: FilterConfig[] = [
    {
      value: filters.role || "all",
      onChange: (value) => updateFilter("role", value === "all" ? "" : value),
      options: [
        { value: "all", label: "All Roles" },
        { value: USER_ROLE.ADMIN, label: "Admin" },
        { value: USER_ROLE.STUDENT, label: "Student" },
      ],
    },
    {
      value: filters.status || "all",
      onChange: (value) => updateFilter("status", value === "all" ? "" : value),
      options: [
        { value: "all", label: "All Status" },
        { value: USER_STATUS.ACTIVE, label: "Active" },
        { value: USER_STATUS.INACTIVE, label: "Inactive" },
      ],
    },
  ];

  const columns: Column<User>[] = [
    {
      header: "User",
      cell: (user) => (
        <div>
          <p className="font-medium text-sm text-foreground">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user) => (
        <StatusBadge
          status={user.role}
          className="h-6 text-xs bg-metric-purple-light text-metric-purple-dark! border-metric-purple-main!"
        />
      ),
    },
    {
      header: "Status",
      cell: (user) => (
        <StatusBadge status={user.status} className="h-6 text-xs" />
      ),
    },
    {
      header: "Email Verified",
      cell: (user) => (
        user.emailVerified && typeof user.emailVerified !== 'boolean' ? (
          <span className="text-xs text-metric-mint-dark">
            {formatDate(user.emailVerified)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Not verified</span>
        )
      ),
    },
    {
      header: "Created",
      cell: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="ops-card">
            <DropdownMenuItem
              className="text-sm"
              onClick={() => handleEdit(user)}
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
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {user.name}? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(user.id, user.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Users"
        description="Manage users and their access to the platform"
        actionLabel="Add User"
        actionIcon={Plus}
        onActionClick={() => setIsCreateOpen(true)}
      />

      {/* Metric Cards */}
      <AdminStatsGrid stats={statsConfig} columns={5} />

      {/* Filters */}
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(value) => updateFilter("search", value)}
        searchPlaceholder="Search users by name or email..."
        filters={filtersConfig}
        resultsCount={paginationData?.total || users.length}
        resultsLabel="user"
      />

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        pagination={pagination}
        emptyState={
          <AdminEmptyState
            icon={Users}
            title="No users found"
            description="Create your first user to get started"
          />
        }
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreate={createMutation}
      />

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          user={editingUser}
          onUpdate={updateMutation}
        />
      )}
    </div>
  );
}

// Create User Dialog Component
function CreateUserDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: ReturnType<typeof useCreateUser>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: USER_ROLE.STUDENT,
      status: USER_STATUS.INACTIVE,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: CreateUserInput) => {
    try {
      await onCreate.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.USER_CREATED);
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
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the platform. They will receive an email to verify their account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              className="ops-input h-9"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="ops-input h-9"
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className="ops-input h-9"
              placeholder="Minimum 8 characters"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue("role", value as typeof USER_ROLE.ADMIN | typeof USER_ROLE.STUDENT, { shouldValidate: true })}
              >
                <SelectTrigger id="role" className="ops-input h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="ops-card">
                  <SelectItem value={USER_ROLE.ADMIN}>Admin</SelectItem>
                  <SelectItem value={USER_ROLE.STUDENT}>Student</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue("status", value as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE, { shouldValidate: true })}
              >
                <SelectTrigger id="status" className="ops-input h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="ops-card">
                  <SelectItem value={USER_STATUS.ACTIVE}>Active</SelectItem>
                  <SelectItem value={USER_STATUS.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || onCreate.isPending}
              className="ops-btn-primary h-9"
            >
              {isSubmitting || onCreate.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog Component
function EditUserDialog({
  open,
  onOpenChange,
  user,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onUpdate: ReturnType<typeof useUpdateUser>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role as typeof USER_ROLE.ADMIN | typeof USER_ROLE.STUDENT,
      status: user.status as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE,
    },
  });

  const selectedRole = watch("role");
  const selectedStatus = watch("status");

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      await onUpdate.mutateAsync(data);
      toast.success(MESSAGES.SUCCESS.USER_UPDATED);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ops-card max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and permissions.
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
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              {...register("email")}
              className="ops-input h-9"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
            <Input
              id="edit-password"
              type="password"
              {...register("password")}
              className="ops-input h-9"
              placeholder="Leave blank to keep current"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue("role", value as typeof USER_ROLE.ADMIN | typeof USER_ROLE.STUDENT, { shouldValidate: true })}
              >
                <SelectTrigger id="edit-role" className="ops-input h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="ops-card">
                  <SelectItem value={USER_ROLE.ADMIN}>Admin</SelectItem>
                  <SelectItem value={USER_ROLE.STUDENT}>Student</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue("status", value as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE, { shouldValidate: true })}
              >
                <SelectTrigger id="edit-status" className="ops-input h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="ops-card">
                  <SelectItem value={USER_STATUS.ACTIVE}>Active</SelectItem>
                  <SelectItem value={USER_STATUS.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-destructive">{errors.status.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || onUpdate.isPending}
              className="ops-btn-primary h-9"
            >
              {isSubmitting || onUpdate.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

