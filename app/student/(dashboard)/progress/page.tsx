"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MetricCard } from "@/components/ui/metric-card";
import {
  TrendingUp,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/startup.utils";
import { MESSAGES } from "@/lib/constants";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProgressUpdates, useCreateProgressUpdate } from "@/lib/hooks/use-progress";
import { useMyStartups } from "@/lib/hooks/use-startups";
import { createProgressUpdateSchema, type CreateProgressUpdateInput } from "@/lib/validations/progress.validation";
import type { StartupWithRelations, ProgressUpdateWithRelations } from "@/lib/types/prisma";

export default function StudentProgressPage() {
  const [isCreating, setIsCreating] = useState(false);
  
  // Get student's startups using the correct endpoint
  const { data: startupsData, isLoading: isLoadingStartups, error: startupsError } = useMyStartups();
  const startups = (startupsData?.data || []) as StartupWithRelations[];
  const selectedStartup = startups[0]; // Use first startup (students typically have one)
  
  // Get progress updates for the startup (only if startup exists)
  const { data: progressData, isLoading: isLoadingProgress } = useProgressUpdates(
    selectedStartup?.id ? {
      startupId: selectedStartup.id,
      me: "true",
    } : undefined
  );
  const updates = progressData?.data || [];
  
  const createMutation = useCreateProgressUpdate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CreateProgressUpdateInput>({
    resolver: zodResolver(createProgressUpdateSchema),
    defaultValues: {
      startupId: selectedStartup?.id || "",
    },
  });
  
  const selectedStartupId = watch("startupId");
  
  // Update startupId when startups load
  useEffect(() => {
    if (selectedStartup && !selectedStartupId) {
      setValue("startupId", selectedStartup.id);
    }
  }, [selectedStartup, selectedStartupId, setValue]);
  
  const onSubmit = async (data: CreateProgressUpdateInput) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Progress update submitted successfully");
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
  
  // Show loading for progress updates while startup is loaded
  if (isLoadingProgress) {
    return <LoadingState message="Loading progress updates..." />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">
            Progress Updates
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Submit and track progress updates for {selectedStartup.name}
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          className="ops-btn-primary h-9 gap-2"
        >
          <Plus className="h-4 w-4" />
          Submit Update
        </Button>
      </div>
      
      {/* Metric Card */}
      <div className="grid gap-4 md:grid-cols-1">
        <MetricCard
          title="Total Updates"
          value={updates.length}
          icon={FileText}
          color="blue"
          subtitle="Progress updates submitted"
        />
      </div>
      
      {/* Create Form */}
      {isCreating && (
        <Card className="ops-card border border-ops">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ops-primary">
              Submit Progress Update
            </CardTitle>
            <CardDescription className="text-ops-secondary">
              Share what you've accomplished, what's blocking you, and what's next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatWasDone" className="text-sm font-medium">
                  What Was Done <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="whatWasDone"
                  {...register("whatWasDone")}
                  placeholder="Describe what you accomplished since the last update..."
                  rows={4}
                  className="ops-input resize-none"
                />
                {errors.whatWasDone && (
                  <p className="text-xs text-destructive">{errors.whatWasDone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatIsBlocked" className="text-sm font-medium">
                  What Is Blocked <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="whatIsBlocked"
                  {...register("whatIsBlocked")}
                  placeholder="Describe any blockers or write 'None' if there are none..."
                  rows={3}
                  className="ops-input resize-none"
                />
                {errors.whatIsBlocked && (
                  <p className="text-xs text-destructive">{errors.whatIsBlocked.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatIsNext" className="text-sm font-medium">
                  What's Next <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="whatIsNext"
                  {...register("whatIsNext")}
                  placeholder="Describe your next steps and goals..."
                  rows={4}
                  className="ops-input resize-none"
                />
                {errors.whatIsNext && (
                  <p className="text-xs text-destructive">{errors.whatIsNext.message}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="ops-btn-primary h-9"
                >
                  {isSubmitting || createMutation.isPending ? "Submitting..." : "Submit Update"}
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
      
      {/* Updates Table */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ops-primary">
            Update History
          </CardTitle>
          <CardDescription className="text-ops-secondary">
            All progress updates for {selectedStartup.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <EmptyState
              title="No progress updates yet"
              description="Submit your first progress update to get started"
            />
          ) : (
            <div className="space-y-4">
               {updates.map((update: ProgressUpdateWithRelations) => (
                <Card key={update.id} className="ops-card border border-ops">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-ops-tertiary" />
                        <p className="text-sm text-ops-tertiary">
                          {formatDate(new Date(update.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-ops-secondary mb-1">
                          What Was Done
                        </p>
                        <p className="text-sm text-ops-primary">
                          {update.whatWasDone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ops-secondary mb-1">
                          What Is Blocked
                        </p>
                        <p className="text-sm text-ops-primary">
                          {update.whatIsBlocked}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-ops-secondary mb-1">
                          What's Next
                        </p>
                        <p className="text-sm text-ops-primary">
                          {update.whatIsNext}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

