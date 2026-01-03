"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Plus, Search, MoreHorizontal, UserPlus, Shield, User } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
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
import { formatDate } from "@/lib/utils/startup.utils";
import { MESSAGES, USER_ROLE, USER_STATUS } from "@/lib/constants";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserWithCount,
} from "@/lib/validations/user.validation";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithCount | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: usersData, isLoading } = useUsers({
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? (roleFilter as typeof USER_ROLE.ADMIN | typeof USER_ROLE.FOUNDER) : undefined,
    status: statusFilter !== "all" ? (statusFilter as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE) : undefined,
  });

  const { data: metricsData } = useUserMetrics();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(editingUser?.id || "");
  const deleteMutation = useDeleteUser();

  const users = useMemo(
    () => (usersData?.data as UserWithCount[]) || [],
    [usersData]
  );

  const metrics = metricsData?.data || { totalCount: 0, adminCount: 0, founderCount: 0, activeCount: 0, verifiedCount: 0 };

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

  const handleEdit = (user: UserWithCount) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.USERS} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">
            Users
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Manage users and their access to the platform
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="ops-btn-primary h-9 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Users"
          value={metrics.totalCount}
          icon={Users}
          color="blue"
          subtitle="All users"
        />
        <MetricCard
          title="Admins"
          value={metrics.adminCount}
          icon={Shield}
          color="purple"
          subtitle="Administrators"
        />
        <MetricCard
          title="Founders"
          value={metrics.founderCount}
          icon={User}
          color="cyan"
          subtitle="Startup founders"
        />
        <MetricCard
          title="Active"
          value={metrics.activeCount}
          icon={UserPlus}
          color="mint"
          subtitle="Active users"
        />
        <MetricCard
          title="Verified"
          value={metrics.verifiedCount}
          icon={UserPlus}
          color="orange"
          subtitle="Email verified"
        />
      </div>

      {/* Filters */}
      <Card className="ops-card border-0">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ops-tertiary" />
              <Input
                placeholder="Search users by name or email..."
                className="ops-input pl-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="ops-input h-9 w-full md:w-45">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="ops-card">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value={USER_ROLE.ADMIN}>Admin</SelectItem>
                <SelectItem value={USER_ROLE.FOUNDER}>Founder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="ops-input h-9 w-full md:w-45">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="ops-card">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={USER_STATUS.ACTIVE}>Active</SelectItem>
                <SelectItem value={USER_STATUS.INACTIVE}>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="ops-card border-0">
        <Table>
          <TableHeader>
            <TableRow className="border-ops">
              <TableHead className="font-medium text-ops-secondary">User</TableHead>
              <TableHead className="font-medium text-ops-secondary">Role</TableHead>
              <TableHead className="font-medium text-ops-secondary">Status</TableHead>
              <TableHead className="font-medium text-ops-secondary">Email Verified</TableHead>
              <TableHead className="font-medium text-ops-secondary">Startups</TableHead>
              <TableHead className="font-medium text-ops-secondary">Created</TableHead>
              <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <EmptyState
                    title="No users found"
                    description="Create your first user to get started"
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-ops">
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
                      {user._count?.startups || 0}
                    </span>
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
                                {user._count && user._count.startups > 0 && (
                                  <span className="block mt-2 text-destructive">
                                    Warning: This user is assigned to {user._count.startups} startup(s).
                                  </span>
                                )}
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
      role: USER_ROLE.FOUNDER,
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
                onValueChange={(value) => setValue("role", value as typeof USER_ROLE.ADMIN | typeof USER_ROLE.FOUNDER)}
              >
                <SelectTrigger id="role" className="ops-input h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="ops-card">
                  <SelectItem value={USER_ROLE.ADMIN}>Admin</SelectItem>
                  <SelectItem value={USER_ROLE.FOUNDER}>Founder</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue("status", value as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE)}
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
  user: UserWithCount;
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
      role: user.role as typeof USER_ROLE.ADMIN | typeof USER_ROLE.FOUNDER,
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
                onValueChange={(value) => setValue("role", value as typeof USER_ROLE.ADMIN | typeof USER_ROLE.FOUNDER)}
              >
                <SelectTrigger id="edit-role" className="ops-input h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="ops-card">
                  <SelectItem value={USER_ROLE.ADMIN}>Admin</SelectItem>
                  <SelectItem value={USER_ROLE.FOUNDER}>Founder</SelectItem>
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
                onValueChange={(value) => setValue("status", value as typeof USER_STATUS.ACTIVE | typeof USER_STATUS.INACTIVE)}
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

