"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Plus, MoreHorizontal, UserPlus, Shield, User } from "lucide-react";
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
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useUserMetrics } from "@/lib/hooks/use-users";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
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
import { TablePagination, type PaginationConfig } from "@/components/ui/data-table";
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
      <Card className="ops-card border-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-medium text-ops-secondary">User</TableHead>
              <TableHead className="font-medium text-ops-secondary">Role</TableHead>
              <TableHead className="font-medium text-ops-secondary">Status</TableHead>
              <TableHead className="font-medium text-ops-secondary">Email Verified</TableHead>
              <TableHead className="font-medium text-ops-secondary">Created</TableHead>
              <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <EmptyState
                    title="No users found"
                    description="Create your first user to get started"
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-ops-primary">
                        {user.name}
                      </p>
                      <p className="text-xs text-ops-tertiary">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={user.role}
                      className="h-6 text-xs bg-metric-purple-light text-metric-purple-dark! border-metric-purple-main!"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.status} className="h-6 text-xs" />
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <span className="text-xs text-metric-mint-dark">
                        {formatDate(user.emailVerified)}
                      </span>
                    ) : (
                      <span className="text-xs text-ops-tertiary">Not verified</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-ops-secondary">
                      {formatDate(user.createdAt)}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <TablePagination {...pagination} />
        )}
      </Card>

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
              className="ops-btn-secondary h-9"
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
              className="ops-btn-secondary h-9"
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

