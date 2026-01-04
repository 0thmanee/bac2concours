"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, X } from "lucide-react";
import { useStartup, useUpdateStartup } from "@/lib/hooks/use-startups";
import { updateStartupSchema, type UpdateStartupInput, type StartupEditFormData } from "@/lib/validations/startup.validation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { StartupStatus, ApiSuccessResponse, UserSelect } from "@/lib/types/prisma";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { formatDateForInput } from "@/lib/utils/startup.utils";
import { ADMIN_ROUTES, MESSAGES, STARTUP_STATUS, QUERY_KEYS, API_ROUTES, USER_ROLE } from "@/lib/constants";

export default function EditStartupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: startupData, isLoading } = useStartup(id);
  const updateMutation = useUpdateStartup(id);
  const [studentSelectValue, setStudentSelectValue] = useState<string>("");
  
  // Fetch users for student selection
  const { data: usersData } = useQuery<ApiSuccessResponse<UserSelect[]>>({
    queryKey: QUERY_KEYS.USERS.BY_ROLE(USER_ROLE.STUDENT),
    queryFn: () => apiClient.get<ApiSuccessResponse<UserSelect[]>>(`${API_ROUTES.USERS}?role=${USER_ROLE.STUDENT}`),
  });
  
  const students = usersData?.data || [];
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<StartupEditFormData>({
    resolver: zodResolver(updateStartupSchema) as never,
    defaultValues: {
      studentIds: [],
    },
  });

  // Populate form when startup data loads
  const startup = startupData?.data;
  
  useEffect(() => {
    if (startup && !isLoading && startup.incubationStart && startup.incubationEnd) {
      reset({
        name: startup.name || "",
        description: startup.description || "",
        industry: startup.industry || "",
        incubationStart: formatDateForInput(startup.incubationStart),
        incubationEnd: formatDateForInput(startup.incubationEnd),
        totalBudget: startup.totalBudget || 0,
        status: startup.status || STARTUP_STATUS.ACTIVE,
        studentIds: startup.students?.map((f) => f.id) || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startup?.id, isLoading]);
  
  const selectedStudentIds = watch("studentIds") || [];

  const addStudent = (studentId: string) => {
    if (!selectedStudentIds.includes(studentId)) {
      setValue("studentIds", [...selectedStudentIds, studentId]);
      setStudentSelectValue(""); // Reset select after adding
    }
  };

  const removeStudent = (studentId: string) => {
    setValue("studentIds", selectedStudentIds.filter((id) => id !== studentId));
  };

  const onSubmit = async (data: StartupEditFormData) => {
    try {
      const submitData: UpdateStartupInput = {
        name: data.name,
        description: data.description,
        industry: data.industry,
        incubationStart: data.incubationStart,
        incubationEnd: data.incubationEnd,
        totalBudget: data.totalBudget,
        status: data.status,
        studentIds: selectedStudentIds.length > 0 ? selectedStudentIds : data.studentIds,
      };
      
      await updateMutation.mutateAsync(submitData);
      toast.success(MESSAGES.SUCCESS.STARTUP_UPDATED);
      router.push(ADMIN_ROUTES.STARTUP(id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  if (isLoading) {
    return <LoadingState message={MESSAGES.LOADING.STARTUP} />;
  }

  if (!startup) {
    return (
      <ErrorState
        message={MESSAGES.ERROR.STARTUP_NOT_FOUND}
        backHref={ADMIN_ROUTES.STARTUPS}
        backLabel="Back to Startups"
      />
    );
  }

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
        <h1 className="text-2xl font-semibold text-ops-primary">
          Edit Startup
        </h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Update startup information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Basic Information
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Essential details about the startup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Startup Name
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="e.g., TechCo Inc"
                    className="ops-input h-9"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    {...register("industry")}
                    placeholder="e.g., Technology, Healthcare"
                    className="ops-input h-9"
                  />
                  {errors.industry && (
                    <p className="text-xs text-destructive">{errors.industry.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Brief description of the startup and its mission"
                    rows={4}
                    className="ops-input resize-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    onValueChange={(value) => setValue("status", value as StartupStatus)}
                    defaultValue={startup?.status}
                  >
                    <SelectTrigger id="status" className="ops-input h-9">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value={STARTUP_STATUS.ACTIVE}>Active</SelectItem>
                      <SelectItem value={STARTUP_STATUS.INACTIVE}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-xs text-destructive">{errors.status.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Students */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Students
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Assign students to this startup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="add-student" className="text-sm font-medium">
                    Add Student
                  </Label>
                  <Select
                    value={studentSelectValue}
                    onValueChange={(value) => {
                      if (value && value !== "") {
                        addStudent(value);
                      }
                    }}
                  >
                    <SelectTrigger id="add-student" className="ops-input h-9">
                      <SelectValue placeholder="Select a student to add" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {students
                        .filter((f) => !selectedStudentIds.includes(f.id))
                        .map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.email})
                          </SelectItem>
                        ))}
                      {students.filter((f) => !selectedStudentIds.includes(f.id)).length === 0 && (
                        <SelectItem value="no-students" disabled>
                          No available students
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStudentIds.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Students</Label>
                    {selectedStudentIds.map((studentId) => {
                      const student = students.find((f) => f.id === studentId);
                      if (!student) return null;
                      return (
                        <div key={studentId} className="flex items-center justify-between p-2 rounded bg-neutral-50">
                          <div>
                            <p className="text-sm font-medium text-ops-primary">{student.name}</p>
                            <p className="text-xs text-ops-tertiary">{student.email}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStudent(studentId)}
                            className="h-8 w-8 p-0 text-ops-tertiary"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Incubation Period */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Incubation Period
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Define the program timeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register("incubationStart")}
                      className="ops-input h-9"
                    />
                    {errors.incubationStart && (
                      <p className="text-xs text-destructive">{errors.incubationStart.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      {...register("incubationEnd")}
                      className="ops-input h-9"
                    />
                    {errors.incubationEnd && (
                      <p className="text-xs text-destructive">{errors.incubationEnd.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Allocation */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-ops-primary">
                  Budget Allocation
                </CardTitle>
                <CardDescription className="text-ops-secondary">
                  Set the total budget for this startup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget" className="text-sm font-medium">
                    Total Budget
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ops-tertiary">
                      $
                    </span>
                    <Input
                      id="totalBudget"
                      type="number"
                      placeholder="25000"
                      min="0"
                      step="100"
                      {...register("totalBudget", { valueAsNumber: true })}
                      className="ops-input h-9 pl-7"
                    />
                    {errors.totalBudget && (
                      <p className="text-xs text-destructive">{errors.totalBudget.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || updateMutation.isPending}
                  className="ops-btn-primary w-full h-9"
                >
                  {isSubmitting || updateMutation.isPending ? "Updating..." : "Update Startup"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || updateMutation.isPending}
                  asChild
                  className="ops-btn-secondary w-full h-9"
                >
                  <Link href={ADMIN_ROUTES.STARTUP(id)}>
                    Cancel
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

