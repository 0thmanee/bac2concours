"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  Building2,
  Receipt,
  Filter,
  Loader2,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  History,
  Trash2,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useStartups, useStartupMetrics } from "@/lib/hooks/use-startups";
import { useExpenseMetrics } from "@/lib/hooks/use-expenses";
import { useBudgetReport, useExpenseReport, useActivityReport } from "@/lib/hooks/use-reports";
import { formatCurrency } from "@/lib/utils/startup.utils";
import { toast } from "sonner";
import type { BudgetReport, ExpenseReport, ActivityReport } from "@/lib/types/report.types";
import type { StoredReport, ReportStep } from "@/lib/validations/report.validation";
import { downloadHTMLReport, downloadPDFReport, loadLogoBase64 } from "@/lib/utils/report-generator";
import { EmptyState } from "@/components/shared/empty-state";
import { STORAGE_KEYS } from "@/lib/constants";

const reportTypes = [
  {
    id: "expense-summary",
    name: "Expense Summary",
    description: "Overview of all expenses by startup and category",
    icon: Receipt,
    color: "orange" as const,
  },
  {
    id: "budget-utilization",
    name: "Budget Utilization",
    description: "Track budget allocation and spending across startups",
    icon: TrendingUp,
    color: "blue" as const,
  },
  {
    id: "startup-progress",
    name: "Startup Progress",
    description: "Comprehensive report on startup milestones and KPIs",
    icon: Building2,
    color: "purple" as const,
  },
  {
    id: "financial-overview",
    name: "Financial Overview",
    description: "Complete financial summary of the incubation program",
    icon: FileText,
    color: "mint" as const,
  },
] as const;

// Helper function to calculate date range from period
function getDateRangeFromPeriod(period: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  switch (period) {
    case "all-time":
      return {};
    case "current-month":
      return {
        startDate: new Date(year, month, 1).toISOString().split("T")[0],
        endDate: new Date(year, month + 1, 0).toISOString().split("T")[0],
      };
    case "last-month":
      return {
        startDate: new Date(year, month - 1, 1).toISOString().split("T")[0],
        endDate: new Date(year, month, 0).toISOString().split("T")[0],
      };
    case "current-quarter":
      const quarterStart = Math.floor(month / 3) * 3;
      return {
        startDate: new Date(year, quarterStart, 1).toISOString().split("T")[0],
        endDate: new Date(year, quarterStart + 3, 0).toISOString().split("T")[0],
      };
    case "last-quarter":
      const lastQuarterStart = Math.floor((month - 3) / 3) * 3;
      return {
        startDate: new Date(year, lastQuarterStart, 1).toISOString().split("T")[0],
        endDate: new Date(year, lastQuarterStart + 3, 0).toISOString().split("T")[0],
      };
    case "current-year":
      return {
        startDate: new Date(year, 0, 1).toISOString().split("T")[0],
        endDate: new Date(year, 11, 31).toISOString().split("T")[0],
      };
    case "last-year":
      return {
        startDate: new Date(year - 1, 0, 1).toISOString().split("T")[0],
        endDate: new Date(year - 1, 11, 31).toISOString().split("T")[0],
      };
    default:
      return {};
  }
}

// Helper functions for localStorage
function getStoredReports(): StoredReport[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REPORT_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveReportToHistory(report: StoredReport): void {
  if (typeof window === "undefined") return;
  try {
    const reports = getStoredReports();
    // Keep only last 50 reports
    const updated = [report, ...reports].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(updated));
  } catch {
    // Silently fail - localStorage might not be available
    // Report history is a convenience feature, not critical
  }
}

function deleteReportFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const reports = getStoredReports();
    const updated = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(updated));
  } catch {
    // Silently fail - localStorage might not be available
  }
}

export default function ReportsPage() {
  const [step, setStep] = useState<ReportStep>("select");
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedStartup, setSelectedStartup] = useState("all");
  const [exportFormat, setExportFormat] = useState<"html" | "pdf">("pdf");
  const [generatedReport, setGeneratedReport] = useState<{
    type: string;
    data: BudgetReport | ExpenseReport | ActivityReport | null;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<StoredReport[]>([]);

  // Fetch startups for dropdown
  const { data: startupsData, isLoading: isLoadingStartups } = useStartups();
  const startups = startupsData?.data || [];

  // Fetch metrics from services
  const { data: startupMetricsData } = useStartupMetrics();
  const { data: expenseMetricsData } = useExpenseMetrics();
  
  // Load report history on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReportHistory(getStoredReports());
  }, []);

  // Metrics from services
  const metrics = useMemo(() => {
    const startupMetrics = startupMetricsData?.data || { activeCount: 0, totalBudget: 0, totalCount: 0, totalStudents: 0 };
    const expenseMetrics = expenseMetricsData?.data || { pendingCount: 0, pendingTotal: 0, approvedCount: 0, totalCount: 0 };
    
    return {
      activeStartups: startupMetrics.activeCount,
      totalBudget: startupMetrics.totalBudget,
      pendingCount: expenseMetrics.pendingCount,
      totalPending: expenseMetrics.pendingTotal,
      totalExpenses: expenseMetrics.totalCount,
    };
  }, [startupMetricsData?.data, expenseMetricsData?.data]);

  // Calculate date range from period
  const dateRange = useMemo(() => {
    if (!selectedPeriod || selectedPeriod === "custom") return {};
    return getDateRangeFromPeriod(selectedPeriod);
  }, [selectedPeriod]);

  // Prepare report query params
  const reportParams = useMemo(() => {
    const baseParams = {
      startupId: selectedStartup !== "all" ? selectedStartup : undefined,
      ...dateRange,
    };
    return baseParams;
  }, [selectedStartup, dateRange]);

  // Fetch reports based on selection
  const { data: budgetReportData, isLoading: isLoadingBudget } = useBudgetReport(
    selectedReport === "budget-utilization" || selectedReport === "financial-overview"
      ? reportParams
      : undefined
  );

  const { data: expenseReportData, isLoading: isLoadingExpense } = useExpenseReport(
    selectedReport === "expense-summary" || selectedReport === "financial-overview"
      ? reportParams
      : undefined
  );

  const { data: activityReportData, isLoading: isLoadingActivity } = useActivityReport(
    selectedReport === "startup-progress"
      ? reportParams
      : undefined
  );

  const isLoadingReport =
    isLoadingBudget || isLoadingExpense || isLoadingActivity;

  const handleReportTypeSelect = (reportId: string) => {
    setSelectedReport(reportId);
    setStep("configure");
  };

  const handleGenerateReport = async () => {
    if (!selectedReport || !selectedPeriod) {
      toast.error("Please select a report type and time period");
      return;
    }

    setIsGenerating(true);

    // Small delay to show loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    let reportData: BudgetReport | ExpenseReport | ActivityReport | null = null;

    if (selectedReport === "budget-utilization" || selectedReport === "financial-overview") {
      if (budgetReportData?.data) {
        reportData = budgetReportData.data;
      }
    } else if (selectedReport === "expense-summary") {
      if (expenseReportData?.data) {
        reportData = expenseReportData.data;
      }
    } else if (selectedReport === "startup-progress") {
      if (activityReportData?.data) {
        reportData = activityReportData.data;
      }
    }

    if (reportData) {
      setGeneratedReport({
        type: selectedReport,
        data: reportData,
      });
      setStep("preview");
      toast.success("Report generated successfully");
    } else {
      toast.error("Failed to generate report. Please try again.");
    }

    setIsGenerating(false);
  };

  const handleDownloadReport = async () => {
    if (!generatedReport?.data) {
      toast.error("No report to download");
      return;
    }

    const reportTypeName = reportTypes.find(r => r.id === generatedReport.type)?.name || "Report";
    const startupName = selectedStartup !== "all" 
      ? startups.find(s => s.id === selectedStartup)?.name 
      : undefined;

    const metadata = {
      reportType: reportTypeName,
      period: selectedPeriod,
      startupName,
      generatedAt: new Date(),
    };

    try {
      // Load logo for report
      const logoBase64 = await loadLogoBase64();
      
      if (exportFormat === "pdf") {
        await downloadPDFReport(generatedReport.data, metadata, logoBase64);
        toast.success("PDF report downloaded");
      } else {
        downloadHTMLReport(generatedReport.data, metadata, logoBase64);
        toast.success("HTML report downloaded");
      }

      // Save to history
      const storedReport: StoredReport = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: generatedReport.type,
        typeName: reportTypeName,
        period: selectedPeriod,
        startupName,
        format: exportFormat,
        generatedAt: new Date().toISOString(),
        data: generatedReport.data,
      };
      saveReportToHistory(storedReport);
      setReportHistory(getStoredReports());
      } catch (error) {
        toast.error("Failed to download report. Please try again.");
      }
  };

  const handleDownloadFromHistory = async (storedReport: StoredReport) => {
    const metadata = {
      reportType: storedReport.typeName,
      period: storedReport.period,
      startupName: storedReport.startupName,
      generatedAt: new Date(storedReport.generatedAt),
    };

    try {
      // Load logo for report
      const logoBase64 = await loadLogoBase64();
      
      if (storedReport.format === "pdf") {
        await downloadPDFReport(storedReport.data, metadata, logoBase64);
        toast.success("PDF report downloaded");
      } else {
        downloadHTMLReport(storedReport.data, metadata, logoBase64);
        toast.success("HTML report downloaded");
      }
      } catch (error) {
        toast.error("Failed to download report. Please try again.");
      }
  };

  const handleDeleteFromHistory = (id: string) => {
    deleteReportFromHistory(id);
    setReportHistory(getStoredReports());
    toast.success("Report deleted from history");
  };

  const handleReset = () => {
    setStep("select");
    setSelectedReport("");
    setSelectedPeriod("");
    setSelectedStartup("all");
    setGeneratedReport(null);
    setExportFormat("pdf");
  };

  const formatPeriodDisplay = (period: string): string => {
    if (period === "all-time") return "All Time";
    return period.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ops-primary">
          Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Generate and download comprehensive reports
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Startups"
          value={metrics.activeStartups}
          icon={Building2}
          color="blue"
          subtitle={`${startups.length} total`}
        />
        <MetricCard
          title="Total Budget"
          value={formatCurrency(metrics.totalBudget, { useK: true, decimals: 0 })}
          icon={DollarSign}
          color="purple"
          subtitle="Allocated"
        />
        <MetricCard
          title="Pending Expenses"
          value={metrics.pendingCount}
          icon={Clock}
          color="orange"
          subtitle={formatCurrency(metrics.totalPending, { useK: true, decimals: 1 })}
        />
        <MetricCard
          title="Total Expenses"
          value={metrics.totalExpenses}
          icon={Receipt}
          color="cyan"
          subtitle="All time"
        />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 pb-6 border-b border-ops">
        <div className={`flex items-center gap-2 ${step === "select" ? "text-ops-action-primary" : "text-ops-text-secondary"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "select" ? "bg-ops-action-primary text-white" : "bg-neutral-100 text-ops-text-secondary"}`}>
            {step !== "select" ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className="text-sm font-medium">Select Report Type</span>
        </div>
        <ChevronRight className="h-4 w-4 text-ops-text-tertiary" />
        <div className={`flex items-center gap-2 ${step === "configure" ? "text-ops-action-primary" : step === "preview" ? "text-ops-text-secondary" : "text-ops-text-tertiary"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "configure" ? "bg-ops-action-primary text-white" : step === "preview" ? "bg-neutral-100 text-ops-text-secondary" : "bg-neutral-50 text-ops-text-tertiary"}`}>
            {step === "preview" ? <Check className="h-4 w-4" /> : "2"}
          </div>
          <span className="text-sm font-medium">Configure Options</span>
        </div>
        <ChevronRight className="h-4 w-4 text-ops-text-tertiary" />
        <div className={`flex items-center gap-2 ${step === "preview" ? "text-ops-action-primary" : "text-ops-text-tertiary"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "preview" ? "bg-ops-action-primary text-white" : "bg-neutral-50 text-ops-text-tertiary"}`}>
            3
          </div>
          <span className="text-sm font-medium">Preview & Download</span>
        </div>
      </div>

      {/* Step 1: Select Report Type */}
      {step === "select" && (
        <Card className="ops-card border border-ops">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ops-primary">
              Step 1: Select Report Type
            </CardTitle>
            <CardDescription>
              Choose the type of report you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {reportTypes.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.id}
                    className={`ops-card border-2 cursor-pointer transition-all hover:border-ops-action-primary ${
                      selectedReport === report.id ? 'border-ops-action-primary' : 'border-transparent'
                    }`}
                    onClick={() => handleReportTypeSelect(report.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className={`flex h-12 w-12 items-center justify-center rounded-lg shrink-0 bg-metric-${report.color}-light`}
                        >
                          <Icon 
                            className={`h-6 w-6 text-metric-${report.color}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-1 text-ops-primary">
                            {report.name}
                          </p>
                          <p className="text-xs leading-relaxed text-ops-tertiary">
                            {report.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure Options */}
      {step === "configure" && (
        <Card className="ops-card border border-ops">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-ops-primary">
              Step 2: Configure Report Options
            </CardTitle>
            <CardDescription>
              Select time period and filter options for your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="period" className="text-sm font-medium">
                    Time Period <span className="text-destructive">*</span>
                  </Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger id="period" className="ops-input h-9">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value="all-time">All Time</SelectItem>
                      <SelectItem value="current-month">Current Month</SelectItem>
                      <SelectItem value="last-month">Last Month</SelectItem>
                      <SelectItem value="current-quarter">Current Quarter</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                      <SelectItem value="current-year">Current Year</SelectItem>
                      <SelectItem value="last-year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startup" className="text-sm font-medium">
                    Startup (Optional)
                  </Label>
                  <Select value={selectedStartup} onValueChange={setSelectedStartup} disabled={isLoadingStartups}>
                    <SelectTrigger id="startup" className="ops-input h-9">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder={isLoadingStartups ? "Loading..." : "Select startup"} />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value="all">All Startups</SelectItem>
                      {startups.map((startup) => (
                        <SelectItem key={startup.id} value={startup.id}>
                          {startup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleGenerateReport}
                  disabled={!selectedPeriod || isLoadingReport || isGenerating}
                  className="ops-btn-primary h-9 gap-2"
                >
                  {(isLoadingReport || isGenerating) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isGenerating ? "Generating..." : "Loading..."}
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("select")}
                  className="ops-btn-secondary h-9"
                >
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview & Download */}
      {step === "preview" && generatedReport?.data && (
        <div className="space-y-4">
          <Card className="ops-card border border-ops">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-ops-primary">
                    Step 3: Preview & Download Report
                  </CardTitle>
                  <CardDescription>
                    Review your report and choose your preferred format
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={exportFormat} onValueChange={(value: "html" | "pdf") => setExportFormat(value)}>
                    <SelectTrigger className="ops-input h-9 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="ops-card">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleDownloadReport}
                    className="ops-btn-primary h-9 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download {exportFormat.toUpperCase()}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedReport.type === "budget-utilization" || generatedReport.type === "financial-overview" ? (
                  <BudgetReportDisplay data={generatedReport.data as BudgetReport} />
                ) : generatedReport.type === "expense-summary" ? (
                  <ExpenseReportDisplay data={generatedReport.data as ExpenseReport} />
                ) : generatedReport.type === "startup-progress" ? (
                  <ActivityReportDisplay data={generatedReport.data as ActivityReport} />
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setStep("configure")}
              className="ops-btn-secondary h-9"
            >
              Back to Configuration
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="ops-btn-secondary h-9"
            >
              Generate New Report
            </Button>
          </div>
        </div>
      )}

      {/* Report History Table */}
      <Card className="ops-card border border-ops">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-ops-primary flex items-center gap-2">
            <History className="h-5 w-5" />
            Generated Reports History
          </CardTitle>
          <CardDescription>
            Previously generated reports available for re-download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-ops">
                <TableHead className="font-medium text-ops-secondary">Report Type</TableHead>
                <TableHead className="font-medium text-ops-secondary">Period</TableHead>
                <TableHead className="font-medium text-ops-secondary">Startup</TableHead>
                <TableHead className="font-medium text-ops-secondary">Format</TableHead>
                <TableHead className="font-medium text-ops-secondary">Generated</TableHead>
                <TableHead className="text-right font-medium text-ops-secondary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <EmptyState
                      title="No reports generated yet"
                      description="Generate your first report to see it here"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                reportHistory.map((report) => (
                  <TableRow key={report.id} className="border-ops">
                    <TableCell>
                      <p className="font-medium text-sm text-ops-primary">
                        {report.typeName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="h-6 text-xs bg-neutral-100 text-ops-secondary border-ops"
                      >
                        {formatPeriodDisplay(report.period)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-ops-secondary">
                        {report.startupName || "All Startups"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="h-6 text-xs bg-neutral-100 text-ops-secondary border-ops uppercase"
                      >
                        {report.format}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-ops-secondary">
                        {formatDate(report.generatedAt)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFromHistory(report)}
                          className="h-8 w-8 p-0"
                          title="Download report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFromHistory(report.id)}
                          className="h-8 w-8 p-0 text-metric-rose hover:text-metric-rose"
                          title="Delete report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Budget Report Display Component
function BudgetReportDisplay({ data }: { data: BudgetReport }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Startups</p>
          <p className="text-lg font-semibold text-ops-primary">{data.summary.totalStartups}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Budget</p>
          <p className="text-lg font-semibold text-ops-primary">{formatCurrency(data.summary.totalBudget)}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Allocated</p>
          <p className="text-lg font-semibold text-ops-primary">{formatCurrency(data.summary.totalAllocated)}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Spent</p>
          <p className="text-lg font-semibold text-ops-primary">{formatCurrency(data.summary.totalSpent)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.report.map((item) => (
          <Card key={item.startup.id} className="ops-card border border-ops">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2 text-ops-primary">{item.startup.name}</h4>
              <div className="grid gap-2 md:grid-cols-3 text-xs">
                <div>
                  <p className="text-ops-secondary">Budget Utilization</p>
                  <p className="font-medium text-ops-primary">{item.budget.utilizationPercent.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-ops-secondary">Spent</p>
                  <p className="font-medium text-ops-primary">{formatCurrency(item.budget.spent)}</p>
                </div>
                <div>
                  <p className="text-ops-secondary">Remaining</p>
                  <p className="font-medium text-ops-primary">{formatCurrency(item.budget.remaining)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Expense Report Display Component
function ExpenseReportDisplay({ data }: { data: ExpenseReport }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Expenses</p>
          <p className="text-lg font-semibold text-ops-primary">{data.summary.totalExpenses}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Amount</p>
          <p className="text-lg font-semibold text-ops-primary">{formatCurrency(data.summary.totalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Approved Amount</p>
          <p className="text-lg font-semibold text-ops-primary">{formatCurrency(data.summary.approvedAmount)}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2 text-ops-primary">By Status</h4>
        <div className="grid gap-2 md:grid-cols-3">
          <div>
            <p className="text-xs text-ops-secondary">Pending</p>
            <p className="text-sm font-medium text-ops-primary">
              {data.byStatus.PENDING.count} ({formatCurrency(data.byStatus.PENDING.total)})
            </p>
          </div>
          <div>
            <p className="text-xs text-ops-secondary">Approved</p>
            <p className="text-sm font-medium text-ops-primary">
              {data.byStatus.APPROVED.count} ({formatCurrency(data.byStatus.APPROVED.total)})
            </p>
          </div>
          <div>
            <p className="text-xs text-ops-secondary">Rejected</p>
            <p className="text-sm font-medium text-ops-primary">
              {data.byStatus.REJECTED.count} ({formatCurrency(data.byStatus.REJECTED.total)})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Report Display Component
function ActivityReportDisplay({ data }: { data: ActivityReport }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs text-ops-secondary mb-1">Progress Updates</p>
          <p className="text-lg font-semibold text-ops-primary">{data.summary.totalProgressUpdates}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Total Expenses</p>
          <p className="text-lg font-semibold text-ops-primary">{data.summary.totalExpenses}</p>
        </div>
        <div>
          <p className="text-xs text-ops-secondary mb-1">Active Startups</p>
          <p className="text-lg font-semibold text-ops-primary">{data.summary.activeStartups}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2 text-ops-primary">Activity by Startup</h4>
        <div className="space-y-2">
          {data.activityByStartup.slice(0, 5).map((activity) => (
            <div key={activity.startup.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
              <p className="text-sm font-medium text-ops-primary">{activity.startup.name}</p>
              <div className="flex gap-4 text-xs text-ops-secondary">
                <span>{activity.progressUpdateCount} updates</span>
                <span>{activity.expenseCount} expenses</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
