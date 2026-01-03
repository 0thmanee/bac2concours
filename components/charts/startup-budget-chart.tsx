"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useBudgets } from "@/lib/hooks/use-budgets"
import { useStartups } from "@/lib/hooks/use-startups"
import { BudgetCategoryWithRelations, StartupWithRelations } from "@/lib/types/prisma"

const chartConfig = {
  allocated: {
    label: "Allocated",
    color: "rgb(var(--metric-blue-main))",
  },
  spent: {
    label: "Spent",
    color: "rgb(var(--metric-mint-main))",
  },
}

function calculateSpent(category: BudgetCategoryWithRelations) {
  return category.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
}

function calculateStartupSpent(startup: StartupWithRelations) {
  return startup.budgetCategories.reduce((sum, category) => {
    const categorySpent = category.expenses?.reduce((expSum, expense) => expSum + expense.amount, 0) || 0;
    return sum + categorySpent;
  }, 0);
}

export function StartupBudgetChart({ startupId }: { startupId?: string }) {
  const { data: budgetsData, isLoading: budgetsLoading } = startupId ? useBudgets(startupId) : { data: null, isLoading: false };
  const { data: startupsData, isLoading: startupsLoading } = !startupId ? useStartups() : { data: null, isLoading: false };

  if (budgetsLoading || startupsLoading) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-sm text-ops-tertiary">Loading chart data...</p>
      </div>
    );
  }

  let chartData: Array<{ category: string; allocated: number; spent: number }> = [];

  if (startupId) {
    // Single startup: show categories
    const categories = (budgetsData?.data as BudgetCategoryWithRelations[]) || [];
    chartData = categories.map((category) => ({
      category: category.name,
      allocated: category.maxBudget,
      spent: calculateSpent(category),
    }));
  } else {
    // All startups: show startups
    const startups = (startupsData?.data as StartupWithRelations[]) || [];
    chartData = startups.map((startup) => ({
      category: startup.name,
      allocated: startup.totalBudget,
      spent: calculateStartupSpent(startup),
    }));
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px]">
        <p className="text-sm text-ops-tertiary">No data available</p>
      </div>
    );
  }
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full min-w-0">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        width={undefined}
        height={undefined}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgb(var(--neutral-200))"
          vertical={false}
        />
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: 'rgb(var(--ops-text-tertiary))', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: 'rgb(var(--ops-text-tertiary))', fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[180px]"
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="allocated"
          fill="rgb(var(--metric-blue-main))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="spent"
          fill="rgb(var(--metric-mint-main))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartContainer>
  )
}
