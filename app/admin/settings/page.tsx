"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  Bell,
  Shield,
  Database,
  Save,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { updateSettingsSchema, type UpdateSettingsInput } from "@/lib/validations/settings.validation";
import { UPDATE_FREQUENCY, SETTINGS_DEFAULTS } from "@/lib/constants";
import { toast } from "sonner";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";

export default function SettingsPage() {
  const { data: settingsData, isLoading, error } = useSettings();
  const updateMutation = useUpdateSettings();
  
  const settings = settingsData?.data;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<UpdateSettingsInput>({
    resolver: zodResolver(updateSettingsSchema),
    defaultValues: {
      incubatorName: SETTINGS_DEFAULTS.INCUBATOR_NAME,
      updateFrequency: SETTINGS_DEFAULTS.UPDATE_FREQUENCY,
      autoApproveExpenses: SETTINGS_DEFAULTS.AUTO_APPROVE_EXPENSES,
    },
  });

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      reset({
        incubatorName: settings.incubatorName,
        updateFrequency: settings.updateFrequency,
        autoApproveExpenses: settings.autoApproveExpenses,
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: UpdateSettingsInput) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success("Settings saved successfully");
      reset(data); // Reset form state to current values
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading settings..." />;
  }

  if (error || !settings) {
    return <ErrorState message="Failed to load settings" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ops-primary">
            System Settings
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Configure your incubation program settings
          </p>
        </div>
        {isDirty && (
          <Badge
            className="h-6 text-xs bg-metric-orange-light text-metric-orange border-ops"
          >
            Unsaved Changes
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Settings */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-blue-light"
                >
                  <Building2 className="h-6 w-6 text-metric-blue" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-ops-primary">
                    Organization
                  </CardTitle>
                  <CardDescription className="text-ops-secondary">
                    Basic information about your incubator
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-sm font-medium">
                  Organization Name
                </Label>
                <Input
                  id="orgName"
                  {...register("incubatorName")}
                  className="ops-input h-9"
                />
                {errors.incubatorName && (
                  <p className="text-xs text-red-500">{errors.incubatorName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgEmail" className="text-sm font-medium">
                  Contact Email
                </Label>
                <Input
                  id="orgEmail"
                  type="email"
                  defaultValue="admin@incubator.com"
                  className="ops-input h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDescription" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="orgDescription"
                  placeholder="Brief description of your incubation program"
                  rows={3}
                  className="ops-input resize-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="programDuration" className="text-sm font-medium">
                    Default Program Duration
                  </Label>
                  <Select defaultValue="12">
                    <SelectTrigger id="programDuration" className="ops-input h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="18">18 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium">
                    Currency
                  </Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency" className="ops-input h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-purple-light"
                >
                  <Mail className="h-6 w-6 text-metric-purple" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-ops-primary">
                    Email Configuration
                  </CardTitle>
                  <CardDescription className="text-ops-secondary">
                    Configure email server and templates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost" className="text-sm font-medium">
                  SMTP Host
                </Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.example.com"
                  className="ops-input h-9"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpPort" className="text-sm font-medium">
                    SMTP Port
                  </Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    className="ops-input h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpUser" className="text-sm font-medium">
                    SMTP Username
                  </Label>
                  <Input
                    id="smtpUser"
                    placeholder="user@example.com"
                    className="ops-input h-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail" className="text-sm font-medium">
                  From Email Address
                </Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@incubator.com"
                  className="ops-input h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-orange-light"
                >
                  <Bell className="h-6 w-6 text-metric-orange" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-ops-primary">
                    Notifications
                  </CardTitle>
                  <CardDescription className="text-ops-secondary">
                    Manage notification preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotif" className="text-sm font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-ops-tertiary">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  disabled
                  checked={false}
                />
              </div>

              <div className="ops-divider" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoApproveExpenses" className="text-sm font-medium cursor-pointer">
                    Auto-Approve Expenses
                  </Label>
                  <p className="text-xs text-ops-tertiary">
                    Automatically approve expenses without manual review
                  </p>
                </div>
                <Switch
                  id="autoApproveExpenses"
                  checked={watch("autoApproveExpenses")}
                  onCheckedChange={(checked) => setValue("autoApproveExpenses", checked, { shouldDirty: true })}
                />
                {errors.autoApproveExpenses && (
                  <p className="text-xs text-red-500 mt-1">{errors.autoApproveExpenses.message}</p>
                )}
              </div>

              <div className="ops-divider" />

              <div className="space-y-2">
                <Label htmlFor="updateFreq" className="text-sm font-medium">
                  Progress Update Frequency
                </Label>
                <Select
                  value={watch("updateFrequency")}
                  onValueChange={(value) => setValue("updateFrequency", value as typeof UPDATE_FREQUENCY.WEEKLY | typeof UPDATE_FREQUENCY.MONTHLY, { shouldDirty: true })}
                >
                  <SelectTrigger id="updateFreq" className="ops-input h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="ops-card">
                    <SelectItem value={UPDATE_FREQUENCY.WEEKLY}>Weekly</SelectItem>
                    <SelectItem value={UPDATE_FREQUENCY.MONTHLY}>Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {errors.updateFrequency && (
                  <p className="text-xs text-red-500">{errors.updateFrequency.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-rose-light"
                >
                  <Shield className="h-6 w-6 text-metric-rose" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-ops-primary">
                    Security
                  </CardTitle>
                  <CardDescription className="text-ops-secondary">
                    Configure security and access controls
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout" className="text-sm font-medium">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  defaultValue="30"
                  min="5"
                  max="1440"
                  className="ops-input h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordPolicy" className="text-sm font-medium">
                  Password Policy
                </Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="passwordPolicy" className="ops-input h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="ops-card">
                    <SelectItem value="low">Low (8+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                    <SelectItem value="high">High (12+ chars, mixed case, numbers, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-metric-cyan-light"
                >
                  <Database className="h-6 w-6 text-metric-cyan" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-ops-primary">
                    Backup & Data
                  </CardTitle>
                  <CardDescription className="text-ops-secondary">
                    Manage data backup and retention
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup" className="text-sm font-medium cursor-pointer">
                    Automatic Backups
                  </Label>
                  <p className="text-xs text-ops-tertiary">
                    Enable daily automated database backups
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  disabled
                  checked={false}
                />
              </div>

              <div className="ops-divider" />

              <div className="space-y-2">
                <Label htmlFor="retentionPeriod" className="text-sm font-medium">
                  Backup Retention Period
                </Label>
                <Select defaultValue="30">
                  <SelectTrigger id="retentionPeriod" className="ops-input h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="ops-card">
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button variant="outline" className="ops-btn-secondary h-9">
                  Export All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Actions */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={updateMutation.isPending || !isDirty}
                className="ops-btn-primary w-full h-9 gap-2"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={updateMutation.isPending || !isDirty}
                onClick={() => reset()}
                className="ops-btn-secondary w-full h-9"
              >
                Reset Changes
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="ops-card border border-ops ops-status-info">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Configuration Help
                  </p>
                  <p className="text-xs">
                    Changes to these settings will affect all users and startups in your incubation program.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="ops-card border border-ops">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-ops-primary">
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded bg-neutral-100">
                <span className="text-sm text-ops-secondary">Version</span>
                <span className="text-sm font-mono font-semibold text-ops-primary">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-neutral-100">
                <span className="text-sm text-ops-secondary">Last Backup</span>
                <span className="text-sm font-semibold text-ops-primary">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-metric-mint-light">
                <span className="text-sm text-ops-secondary">Database</span>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-metric-mint" />
                  <span className="text-sm font-semibold text-metric-mint-dark">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-metric-mint-light">
                <span className="text-sm text-ops-secondary">API Status</span>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-metric-mint" />
                  <span className="text-sm font-semibold text-metric-mint-dark">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
