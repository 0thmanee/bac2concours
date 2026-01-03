import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategorySpendingChart } from "@/components/charts/category-spending-chart";
import { StartupBudgetChart } from "@/components/charts/startup-budget-chart";
import { startupService } from "@/lib/services/startup.service";
import { budgetService } from "@/lib/services/budget.service";
import {
  calculateRemainingBudget,
  calculateUtilizationPercent,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils/startup.utils";
import { ADMIN_ROUTES, NUMERIC_CONSTANTS } from "@/lib/constants";
import { EmptyState } from "@/components/shared/empty-state";

// Color assignment for startups
const STARTUP_COLORS = ["blue", "cyan", "purple", "mint", "orange", "rose"] as const;

export default async function BudgetsPage() {
  const startups = await startupService.findAll();
  
  // Get all budget categories with expenses for each startup
  const budgetsWithCategories = await Promise.all(
    startups.map(async (startup: typeof startups[number]) => {
      const categories = await budgetService.findByStartupId(startup.id);
      return {
        id: startup.id,
        startup: startup.name,
        totalBudget: startup.totalBudget,
        color: STARTUP_COLORS[startups.indexOf(startup) % STARTUP_COLORS.length],
        categories: await Promise.all(
          categories.map(async (cat: typeof categories[number]) => {
            const spent = await budgetService.getSpentAmount(cat.id, startup.id);
            return {
              name: cat.name,
              allocated: cat.maxBudget,
              spent,
            };
          })
        ),
      };
    })
  );
  
  // Get metrics from service
  const budgetMetrics = await budgetService.getMetrics();
  const utilizationRate = calculateUtilizationPercent(budgetMetrics.totalSpent, budgetMetrics.totalAllocated);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ops-primary">
          Budget Management
        </h1>
        <p className="mt-1 text-sm text-ops-secondary">
          Allocate and track budgets for startups
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Allocated"
          value={formatCurrency(budgetMetrics.totalAllocated, { useK: true, decimals: 0 })}
      icon={Wallet}
          color="blue"
          subtitle={`Across ${budgetMetrics.startupCount} startups`}
        />
        <MetricCard
          title="Total Spent"
          value={formatCurrency(budgetMetrics.totalSpent, { useK: true, decimals: 0 })}
          icon={DollarSign}
          color="orange"
          subtitle={formatPercentage(utilizationRate, 0)}
          trend={{ value: formatPercentage(utilizationRate, 0), isPositive: utilizationRate < 90 }}
        />
        <MetricCard
          title="Remaining"
          value={formatCurrency(calculateRemainingBudget(budgetMetrics.totalAllocated, budgetMetrics.totalSpent), { useK: true, decimals: 0 })}
          icon={TrendingUp}
          color="mint"
          subtitle="Available to allocate"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Budget Overview"
          description="Allocated vs spent by startup"
          className="lg:col-span-2"
        >
          <StartupBudgetChart />
        </ChartCard>

        <ChartCard
          title="Spending by Category"
          description="Total expenses breakdown"
        >
          <CategorySpendingChart />
        </ChartCard>
      </div>

      {/* Budgets by Startup */}
      {budgetsWithCategories.length === 0 ? (
        <EmptyState
          title="No budgets found"
          description="Create startups and allocate budgets to see them here"
        />
      ) : (
        budgetsWithCategories.map((budget: typeof budgetsWithCategories[number]) => {
        const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0);
        const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocated, 0);
        const remaining = calculateRemainingBudget(totalAllocated, totalSpent);
        
        return (
          <ChartCard
            key={budget.id}
            title={budget.startup}
            description={`Total Budget: ${formatCurrency(budget.totalBudget)} • Spent: ${formatCurrency(totalSpent)}`}
            action={
              <Button variant="outline" size="sm" className="ops-btn-secondary h-8" asChild>
                <Link href={ADMIN_ROUTES.STARTUP_BUDGETS(budget.id)}>
                  Manage Budget
                </Link>
              </Button>
            }
          >
            <Table>
              <TableHeader>
                <TableRow className="border-ops">
                  <TableHead className="font-medium text-ops-secondary">Category</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Allocated</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Spent</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Remaining</TableHead>
                  <TableHead className="font-medium text-ops-secondary">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <EmptyState
                        title="No budget categories"
                        description="Create budget categories for this startup"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {budget.categories.map((category, idx) => {
                      const remaining = calculateRemainingBudget(category.allocated, category.spent);
                      const utilization = calculateUtilizationPercent(category.spent, category.allocated);
                      const isOverBudget = category.spent > category.allocated;
                      
                      return (
                        <TableRow key={idx} className="border-ops">
                          <TableCell>
                            <p className="text-sm font-medium text-ops-primary">
                              {category.name}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-ops-secondary">
                              {formatCurrency(category.allocated)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium text-ops-primary">
                              {formatCurrency(category.spent)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p 
                              className={`text-sm font-medium ${
                                isOverBudget ? 'text-[rgb(var(--metric-rose-main))]' : 'text-metric-mint'
                              }`}
                            >
                              {formatCurrency(remaining)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-2 rounded-full overflow-hidden bg-neutral-200" style={{ width: `${NUMERIC_CONSTANTS.PROGRESS_BAR_WIDTH * 4}px` }}>
                                <div
                                  className="h-full rounded-full transition-all progress-bar progress-bar-bg"
                                  style={{
                                    '--progress-width': `${Math.min(utilization, NUMERIC_CONSTANTS.PERCENTAGE_MAX)}%`,
                                    '--progress-color': isOverBudget
                                      ? 'var(--metric-rose-main)'
                                      : utilization > 80
                                      ? 'var(--metric-orange-main)'
                                      : `var(--metric-${budget.color}-main)`,
                                  } as React.CSSProperties}
                                />
                              </div>
                              <span className="text-sm font-medium min-w-11.25 text-ops-secondary">
                                {formatPercentage(utilization, 0)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="border-ops">
                      <TableCell className="font-semibold text-ops-primary">
                        Total
                      </TableCell>
                      <TableCell className="font-semibold text-ops-primary">
                        {formatCurrency(totalAllocated)}
                      </TableCell>
                      <TableCell className="font-semibold text-ops-primary">
                        {formatCurrency(totalSpent)}
                      </TableCell>
                      <TableCell className="font-semibold text-ops-primary">
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell className="font-semibold text-ops-primary">
                        {formatPercentage(calculateUtilizationPercent(totalSpent, totalAllocated), 0)}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </ChartCard>
        );
      })
      )}
    </div>
  );
}
