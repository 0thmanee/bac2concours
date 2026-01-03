"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle, X } from "lucide-react";
import { useCreateStartup } from "@/lib/hooks/use-startups";
import { createStartupSchema, type CreateStartupInput } from "@/lib/validations/startup.validation";
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
import { ApiSuccessResponse, UserSelect } from "@/lib/types/prisma";
import { ADMIN_ROUTES, MESSAGES, QUERY_KEYS, API_ROUTES, USER_ROLE } from "@/lib/constants";

export default function NewStartupPage() {
  const router = useRouter();
  const createMutation = useCreateStartup();
  const [founderSelectValue, setFounderSelectValue] = useState<string>("");
  
  // Fetch users for founder selection
  const { data: usersData } = useQuery<ApiSuccessResponse<UserSelect[]>>({
    queryKey: QUERY_KEYS.USERS.BY_ROLE(USER_ROLE.FOUNDER),
    queryFn: () => apiClient.get<ApiSuccessResponse<UserSelect[]>>(`${API_ROUTES.USERS}?role=${USER_ROLE.FOUNDER}`),
  });
  
  const founders = usersData?.data || [];
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateStartupInput & { founderIds: string[] }>({
    resolver: zodResolver(createStartupSchema),
    defaultValues: {
      founderIds: [],
    },
  });
  
  const selectedFounderIds = watch("founderIds") || [];

  const addFounder = (founderId: string) => {
    if (!selectedFounderIds.includes(founderId)) {
      setValue("founderIds", [...selectedFounderIds, founderId]);
      setFounderSelectValue(""); // Reset select after adding
    }
  };

  const removeFounder = (founderId: string) => {
    setValue("founderIds", selectedFounderIds.filter((id) => id !== founderId));
  };

  const onSubmit = async (data: CreateStartupInput & { founderIds: string[] }) => {
    try {
      // Ensure founderIds is set from form state
      const submitData: CreateStartupInput = {
        name: data.name,
        description: data.description,
        industry: data.industry,
        incubationStart: data.incubationStart,
        incubationEnd: data.incubationEnd,
        totalBudget: data.totalBudget,
        founderIds: selectedFounderIds.length > 0 ? selectedFounderIds : data.founderIds,
      };
      
      await createMutation.mutateAsync(submitData);
      toast.success(MESSAGES.SUCCESS.STARTUP_CREATED);
      router.push(ADMIN_ROUTES.STARTUPS);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : MESSAGES.ERROR.GENERIC);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 -ml-2 text-ops-secondary"
        >
          <Link href={ADMIN_ROUTES.STARTUPS}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Startups
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold text-ops-primary">
          Add New Startup
        </h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Register a new startup in the incubation program
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
                    Startup Name <span className="text-destructive">*</span>
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
                    Industry <span className="text-xs text-ops-tertiary">(Optional)</span>
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
                    Description <span className="text-xs text-ops-tertiary">(Optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Brief description of the startup and its mission"
                    rows={4}
                    className="ops-input resize-none"
                  />
                  <p className="text-xs text-ops-tertiary">
                    Provide a brief overview of what the startup does
                  </p>
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Founders */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-ops-primary">
                      Founders
                    </CardTitle>
                    <CardDescription className="text-ops-secondary">
                      Assign founders to this startup
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Add Founder Selector */}
                <div className="space-y-2">
                  <Label htmlFor="add-founder" className="text-sm font-medium">
                    Add Founder
                  </Label>
                  <Select
                    value={founderSelectValue}
                    onValueChange={(value) => {
                      if (value && value !== "") {
                        addFounder(value);
                      }
                    }}
                  >
                    <SelectTrigger id="add-founder" className="ops-input h-9">
                      <SelectValue placeholder="Select a founder to add" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      {founders
                        .filter((f) => !selectedFounderIds.includes(f.id))
                        .map((founder) => (
                          <SelectItem key={founder.id} value={founder.id}>
                            {founder.name} ({founder.email})
                          </SelectItem>
                        ))}
                      {founders.filter((f) => !selectedFounderIds.includes(f.id)).length === 0 && (
                        <SelectItem value="no-founders" disabled>
                          No available founders
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Founders */}
                {selectedFounderIds.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Founders</Label>
                    {selectedFounderIds.map((founderId) => {
                      const founder = founders.find((f) => f.id === founderId);
                      if (!founder) return null;
                      return (
                        <div key={founderId} className="flex items-center justify-between p-2 rounded bg-neutral-50">
                          <div>
                            <p className="text-sm font-medium text-ops-primary">{founder.name}</p>
                            <p className="text-xs text-ops-tertiary">{founder.email}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFounder(founderId)}
                            className="h-8 w-8 p-0 text-ops-tertiary"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {errors.founderIds && (
                  <p className="text-xs text-destructive">{errors.founderIds.message}</p>
                )}
                <p className="text-xs text-ops-tertiary">
                  Select founders from existing users. At least one founder is required.
                </p>
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
                      Start Date <span className="text-destructive">*</span>
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
                      End Date <span className="text-destructive">*</span>
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
                  Set the initial budget for this startup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBudget" className="text-sm font-medium">
                    Total Budget <span className="text-destructive">*</span>
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
                  <p className="text-xs text-ops-tertiary">
                    Budget can be adjusted later and allocated to specific categories
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="ops-card border border-ops">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-ops-primary">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="ops-btn-primary w-full h-9"
                >
                  {isSubmitting || createMutation.isPending ? "Creating..." : "Create Startup"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting || createMutation.isPending}
                  asChild
                  className="ops-btn-secondary w-full h-9"
                >
                  <Link href={ADMIN_ROUTES.STARTUPS}>
                    Cancel
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="ops-card border border-ops ops-status-info">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Need Help?
                    </p>
                    <p className="text-xs">
                      After creating the startup, you can allocate budget to specific categories and invite founders to the platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
