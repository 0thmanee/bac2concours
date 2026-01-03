import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { CollapsibleChartCard } from "@/components/ui/collapsible-chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BudgetUtilizationChart } from "@/components/charts/budget-utilization-chart";
import { ExpenseTrendChart } from "@/components/charts/expense-trend-chart";
import { StartupBudgetChart } from "@/components/charts/startup-budget-chart";
import { YearlyBreakdownChart } from "@/components/charts/yearly-breakdown-chart";
import { startupService } from "@/lib/services/startup.service";
import { expenseService } from "@/lib/services/expense.service";
import { reportService } from "@/lib/services/report.service";
import {
  formatCurrency,
  formatTimeAgo,
} from "@/lib/utils/startup.utils";
import { STARTUP_STATUS, EXPENSE_STATUS, NUMERIC_CONSTANTS } from "@/lib/constants";
import type { ActivityReportTimelineItem } from "@/lib/types/report.types";

export default async function AdminDashboard() {
  // Fetch real data
  const startups = await startupService.findAll();
  const expenses = await expenseService.findAll();
  const activityReport = await reportService.getActivityReport();
  
  // Get metrics from services
  const [startupMetrics, expenseMetrics] = await Promise.all([
    startupService.getMetrics(),
    expenseService.getMetrics(),
  ]);
  
  // Total spent from expense metrics (approved expenses total)
  const totalSpent = expenseMetrics.approvedTotal;
  
  // Get current month expenses total from service
  const thisMonthTotal = await expenseService.getCurrentMonthTotal();
  
  // Recent expenses (last N)
  const recentExpensesList = expenses.slice(0, NUMERIC_CONSTANTS.RECENT_ITEMS_LIMIT).map(exp => ({
    id: exp.id,
    startup: exp.startup.name,
    amount: exp.amount,
    category: exp.category.name,
    status: exp.status,
    date: exp.date,
  }));
  
  // Recent activities from timeline (last N)
  const recentActivities = activityReport.timeline.slice(0, NUMERIC_CONSTANTS.RECENT_ITEMS_LIMIT).map((item: ActivityReportTimelineItem, index: number) => ({
    id: `${item.type}-${index}`,
    action: item.type === "EXPENSE" 
      ? (item.details.status === EXPENSE_STATUS.APPROVED ? "Expense approved" : "Expense submitted") 
      : "Progress update submitted",
    entity: item.type === "EXPENSE" 
      ? `${item.startup.name} - ${formatCurrency(item.details.amount || 0)}`
      : item.startup.name,
    time: formatTimeAgo(item.date),
    type: item.type === "EXPENSE" ? "expense" : "progress",
  }));
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ops-primary">
            Dashboard
        </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Welcome back! Here&apos;s what&apos;s happening with your incubation program.
        </p>
        </div>
      </div>

      {/* Metric Cards - Vibrant Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Startups"
          value={startupMetrics.activeCount}
          icon={Building2}
          color="blue"
          subtitle={`${startupMetrics.totalCount} total startups`}
        />
        <MetricCard
          title="Total Budget"
          value={formatCurrency(startupMetrics.totalBudget, { useK: true, decimals: 0 })}
          icon={DollarSign}
          color="orange"
          subtitle="Across all programs"
        />
        <MetricCard
          title="Pending Approvals"
          value={expenseMetrics.pendingCount}
          icon={Clock}
          color="rose"
          subtitle={`${formatCurrency(expenseMetrics.pendingTotal, { useK: true, decimals: 1 })} total`}
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(thisMonthTotal, { useK: true, decimals: 1 })}
          icon={TrendingUp}
          color="mint"
          subtitle="Expenses processed"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Founders"
          value={startupMetrics.totalFounders}
          icon={Users}
          subtitle={`Across ${startupMetrics.totalCount} startups`}
        />
        <StatCard
          title="Budget Utilization"
          value={`${startupMetrics.totalBudget > 0 ? ((totalSpent / startupMetrics.totalBudget) * 100).toFixed(0) : 0}%`}
          icon={TrendingUp}
          subtitle={`$${(totalSpent / 1000).toFixed(0)}K of $${(startupMetrics.totalBudget / 1000).toFixed(0)}K`}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalSpent, { useK: true, decimals: 0 })}
          icon={DollarSign}
          subtitle={`${expenseMetrics.approvedCount} approved`}
        />
      </div>

      {/* Budget & Expense Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <ChartCard
          title="Budget Utilization"
          description="Allocated vs spent by startup"
          className="lg:col-span-2"
        >
          <BudgetUtilizationChart />
        </ChartCard>

        <CollapsibleChartCard
          title="Yearly Breakdown"
          description="Expenses by category"
          defaultCollapsed={false}
        >
          <YearlyBreakdownChart />
        </CollapsibleChartCard>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ChartCard
          title="Monthly Expenses"
          description="Expense trend over time"
        >
          <ExpenseTrendChart />
        </ChartCard>

        <div className="space-y-6">
          {/* Quick Actions */}
          <ChartCard
            title="Quick Actions"
            description="Common tasks"
          >
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="ops-btn-secondary h-auto flex-col py-4 gap-2"
              >
                <Building2 className="h-5 w-5 text-metric-blue" />
                <span className="text-sm font-medium">Add Startup</span>
              </Button>
              <Button 
                variant="outline" 
                className="ops-btn-secondary h-auto flex-col py-4 gap-2"
              >
                <DollarSign className="h-5 w-5 text-metric-orange" />
                <span className="text-sm font-medium">Allocate Budget</span>
              </Button>
              <Button 
                variant="outline" 
                className="ops-btn-secondary h-auto flex-col py-4 gap-2"
              >
                <FileText className="h-5 w-5 text-metric-purple" />
                <span className="text-sm font-medium">Generate Report</span>
              </Button>
              <Button 
                variant="outline" 
                className="ops-btn-secondary h-auto flex-col py-4 gap-2"
              >
                <Users className="h-5 w-5 text-metric-cyan" />
                <span className="text-sm font-medium">Invite Founder</span>
              </Button>
            </div>
          </ChartCard>

          {/* System Status */}
          <ChartCard
            title="System Status"
            description="Platform health"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ops-secondary">
                  Database
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[rgb(var(--metric-mint-main))]" />
                  <span className="text-sm font-medium text-metric-mint-dark">
                    Operational
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ops-secondary">
                  System Status
                </span>
                <span className="text-sm font-medium text-ops-primary">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ops-secondary">
                  Data Sync
                </span>
                <span className="text-sm font-medium text-ops-primary">
                  Real-time
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ops-secondary">
                  Last Updated
                </span>
                <span className="text-sm font-medium text-ops-primary">
                  {formatTimeAgo(new Date())}
                </span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Expenses */}
        <ChartCard
          title="Recent Expense Requests"
          description="Latest submissions requiring your attention"
          action={
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              View all
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          }
        >
            <div className="space-y-3">
             {recentExpensesList.map((expense) => (
              <div 
                key={expense.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[rgb(var(--neutral-50))]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                      expense.status === EXPENSE_STATUS.PENDING 
                        ? "bg-[rgb(var(--metric-orange-light))]" 
                        : "bg-[rgb(var(--metric-mint-light))]"
                    }`}
                  >
                    {expense.status === EXPENSE_STATUS.PENDING ? (
                      <Clock className={`h-5 w-5 text-[rgb(var(--metric-orange-main))]`} />
                    ) : (
                      <CheckCircle2 className={`h-5 w-5 text-[rgb(var(--metric-mint-main))]`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-ops-primary">
                      {expense.startup}
                    </p>
                    <p className="text-xs truncate text-ops-tertiary">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-semibold text-ops-primary">
                    ${expense.amount.toLocaleString()}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1 h-5 text-xs ${
                      expense.status === EXPENSE_STATUS.PENDING
                        ? 'bg-metric-orange-light text-[rgb(var(--metric-orange-dark))] border-[rgb(var(--metric-orange-main))]'
                        : 'bg-metric-mint-light text-[rgb(var(--metric-mint-dark))] border-[rgb(var(--metric-mint-main))]'
                    }`}
                  >
                    {expense.status.toLowerCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard
          title="Recent Activity"
          description="Track all actions across your platform"
        >
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-[rgb(var(--neutral-50))]"
              >
                <div 
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 bg-[rgb(var(--metric-purple-light))]"
                >
                  <div className="h-2 w-2 rounded-full bg-[rgb(var(--metric-purple-main))]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ops-primary">
                    {activity.action}
                  </p>
                  <p className="text-xs text-ops-secondary">
                    {activity.entity}
                  </p>
                  <p className="text-xs mt-0.5 text-ops-tertiary">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Startup Budget Chart */}
      <ChartCard
        title="Budget Overview by Startup"
        description="Track spending across your portfolio"
      >
        <StartupBudgetChart />
      </ChartCard>
    </div>
  );
}
