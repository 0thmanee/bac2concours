import { 
  DollarSign, 
  TrendingUp,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  FileText,
  Building2,
  Calendar,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { getStudentDashboardData } from "@/lib/services/dashboard.service";
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  formatTimeAgo,
} from "@/lib/utils/startup.utils";
import { EXPENSE_STATUS } from "@/lib/constants";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { STUDENT_ROUTES } from "@/lib/routes";
import { StartupBudgetChart } from "@/components/charts/startup-budget-chart";
import { ExpenseTrendChart } from "@/components/charts/expense-trend-chart";

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  // Get dashboard data
  const dashboardData = await getStudentDashboardData(session.user.id);
  
  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-ops-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            No startup assigned yet. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }
  
  const { startup, metrics, recentExpenses, recentProgressUpdates } = dashboardData;
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ops-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Welcome back! Here&apos;s an overview of {startup.name}.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Budget Allocated"
          value={formatCurrency(startup.totalBudget, { useK: true, decimals: 0 })}
          icon={DollarSign}
          color="blue"
          subtitle="Total budget"
        />
        <MetricCard
          title="Budget Spent"
          value={formatCurrency(metrics.spentBudget, { useK: true, decimals: 0 })}
          icon={TrendingUp}
          color="orange"
          subtitle={formatPercentage(metrics.utilizationPercent)}
        />
        <MetricCard
          title="Pending Expenses"
          value={metrics.pendingExpensesCount}
          icon={Clock}
          color="rose"
          subtitle={`${formatCurrency(metrics.pendingExpensesTotal, { useK: true, decimals: 1 })} total`}
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(metrics.thisMonthTotal, { useK: true, decimals: 1 })}
          icon={Receipt}
          color="mint"
          subtitle="Expenses approved"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(metrics.remainingBudget, { useK: true, decimals: 0 })}
          icon={DollarSign}
          subtitle="Available to spend"
        />
        <StatCard
          title="Budget Utilization"
          value={formatPercentage(metrics.utilizationPercent, 0)}
          icon={TrendingUp}
          subtitle={`${formatCurrency(metrics.spentBudget, { useK: true, decimals: 0 })} of ${formatCurrency(startup.totalBudget, { useK: true, decimals: 0 })}`}
        />
        <StatCard
          title="Total Expenses"
          value={metrics.totalExpensesCount}
          icon={Receipt}
          subtitle={`${metrics.approvedExpensesCount} approved`}
        />
      </div>

      {/* Budget & Expense Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Budget by Category"
          description="Allocated vs spent by category"
        >
          <StartupBudgetChart startupId={startup.id} />
        </ChartCard>

        <ChartCard
          title="Monthly Expenses"
          description="Expense trend over time"
        >
          <ExpenseTrendChart startupId={startup.id} />
        </ChartCard>
      </div>

      {/* Startup Information & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Startup Information */}
        <ChartCard
          title="Startup Information"
          description="Details about your startup"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-ops-tertiary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ops-primary">{startup.name}</p>
                {startup.description && (
                  <p className="text-xs text-ops-secondary mt-1">{startup.description}</p>
                )}
              </div>
            </div>
            {startup.industry && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-ops-tertiary">Industry:</span>
                <span className="text-xs font-medium text-ops-primary">{startup.industry}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-ops-tertiary" />
              <div className="flex-1">
                <p className="text-xs text-ops-tertiary">Incubation Period</p>
                <p className="text-sm font-medium text-ops-primary">
                  {formatDate(startup.incubationStart)} - {formatDate(startup.incubationEnd)}
                </p>
              </div>
            </div>
            {startup.students.length > 0 && (
              <div className="pt-2 border-t border-ops">
                <p className="text-xs text-ops-tertiary mb-2">Team Members</p>
                <div className="flex flex-wrap gap-2">
                  {startup.students.map((student) => (
                    <Badge
                      key={student.id}
                      variant="outline"
                      className="text-xs bg-metric-cyan-light text-metric-cyan-dark border-metric-cyan-main"
                    >
                      {student.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Quick Actions */}
        <ChartCard
          title="Quick Actions"
          description="Common tasks"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="ops-btn-secondary h-auto flex-col py-4 gap-2"
              asChild
            >
              <Link href={STUDENT_ROUTES.EXPENSES}>
                <Receipt className="h-5 w-5 text-metric-orange" />
                <span className="text-sm font-medium">Submit Expense</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="ops-btn-secondary h-auto flex-col py-4 gap-2"
              asChild
            >
              <Link href={STUDENT_ROUTES.PROGRESS}>
                <FileText className="h-5 w-5 text-metric-purple" />
                <span className="text-sm font-medium">Update Progress</span>
              </Link>
            </Button>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Expenses */}
        <ChartCard
          title="Recent Expenses"
          description="Latest expense submissions"
          action={
            <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
              <Link href={STUDENT_ROUTES.EXPENSES}>
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {recentExpenses.length === 0 ? (
              <p className="text-sm text-ops-tertiary text-center py-4">
                No expenses yet
              </p>
            ) : (
              recentExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[rgb(var(--neutral-50))]"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                        expense.status === EXPENSE_STATUS.PENDING 
                          ? "bg-[rgb(var(--metric-yellow-light))]" 
                          : expense.status === EXPENSE_STATUS.APPROVED
                          ? "bg-[rgb(var(--metric-mint-light))]"
                          : "bg-[rgb(var(--metric-rose-light))]"
                      }`}
                    >
                      {expense.status === EXPENSE_STATUS.PENDING ? (
                        <Clock className={`h-5 w-5 text-[rgb(var(--metric-yellow-main))]`} />
                      ) : expense.status === EXPENSE_STATUS.APPROVED ? (
                        <CheckCircle2 className={`h-5 w-5 text-[rgb(var(--metric-mint-main))]`} />
                      ) : (
                        <XCircle className={`h-5 w-5 text-[rgb(var(--metric-rose-main))]`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-ops-primary">
                        {expense.category}
                      </p>
                      <p className="text-xs truncate text-ops-tertiary">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-ops-primary">
                      {formatCurrency(expense.amount)}
                    </p>
                    <StatusBadge status={expense.status} className="mt-1 h-5 text-xs" />
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>

        {/* Recent Progress Updates */}
        <ChartCard
          title="Recent Progress Updates"
          description="Latest progress submissions"
          action={
            <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
              <Link href={STUDENT_ROUTES.PROGRESS}>
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {recentProgressUpdates.length === 0 ? (
              <p className="text-sm text-ops-tertiary text-center py-4">
                No progress updates yet
              </p>
            ) : (
              recentProgressUpdates.map((update) => (
                <div 
                  key={update.id}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[rgb(var(--neutral-50))]"
                >
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 bg-[rgb(var(--metric-purple-light))]"
                  >
                    <FileText className="h-4 w-4 text-[rgb(var(--metric-purple-main))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ops-primary">
                      Progress Update
                    </p>
                    <p className="text-xs text-ops-secondary mt-1">
                      {update.summary}
                    </p>
                    <p className="text-xs mt-0.5 text-ops-tertiary">
                      {formatTimeAgo(new Date(update.date))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
