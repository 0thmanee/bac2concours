"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validations/user.validation";
import { LoadingState } from "@/components/shared/loading-state";
import { toast } from "sonner";
import { MESSAGES } from "@/lib/constants";
import { User, Mail, Lock, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: profileData, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const profile = profileData?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      email: profile?.email || "",
      password: "",
    },
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        password: "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: UpdateProfileInput) => {
    try {
      // Remove password if it's empty
      const updateData: UpdateProfileInput = {
        ...(data.name && data.name !== profile?.name && { name: data.name }),
        ...(data.email && data.email !== profile?.email && { email: data.email }),
        ...(data.password && data.password.length > 0 && { password: data.password }),
      };

      // Don't send request if nothing changed
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        setIsEditing(false);
        return;
      }

      await updateMutation.mutateAsync(updateData);
      toast.success(MESSAGES.SUCCESS.USER_UPDATED || "Profile updated successfully");
      setIsEditing(false);
      // Reset password field
      reset({ ...data, password: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC
      );
    }
  };

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.USER} />;
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ops-primary">Profile</h1>
          <p className="mt-1 text-sm text-ops-secondary">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ops-primary">Profile</h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Manage your account information and preferences
        </p>
      </div>

      <Card className="ops-card border border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-ops-primary">
                Personal Information
              </CardTitle>
              <CardDescription className="text-ops-tertiary">
                Update your personal details
              </CardDescription>
            </div>
            {/* {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )} */}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="John Doe"
                  className="ops-input h-9"
                  disabled={!isEditing}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                  className="ops-input h-9"
                  disabled={!isEditing}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Leave blank to keep current password"
                  className="ops-input h-9"
                  disabled={!isEditing}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
                <p className="text-xs text-ops-tertiary">
                  Leave blank to keep your current password
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Input
                  value={profile.role}
                  className="ops-input h-9 bg-neutral-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Input
                  value={profile.status}
                  className="ops-input h-9 bg-neutral-50"
                  disabled
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="ops-btn-primary h-9"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting || updateMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      name: profile.name,
                      email: profile.email,
                      password: "",
                    });
                  }}
                  disabled={isSubmitting || updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
