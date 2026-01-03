"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useStartups } from "@/lib/hooks/use-startups"
import { StartupWithRelations } from "@/lib/types/prisma"
import { calculateSpentBudget } from "@/lib/utils/startup.utils"

const chartConfig = {
  allocated: {
    label: "Allocated",
    color: "rgb(var(--metric-purple-main))",
  },
  spent: {
    label: "Spent",
    color: "rgb(var(--metric-mint-main))",
  },
}

export function BudgetUtilizationChart() {
  const { data: startupsData, isLoading } = useStartups()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-ops-tertiary">Loading chart data...</p>
      </div>
    )
  }

  const startups = (startupsData?.data as StartupWithRelations[]) || []
  
  const chartData = startups.map((startup) => ({
    startup: startup.name,
    allocated: startup.totalBudget,
    spent: 0, // Spent budget calculation moved to services - this chart should use metrics
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-ops-tertiary">No data available</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-0">
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
          dataKey="startup"
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
              className="w-[160px]"
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          }
          />
        <Bar
          dataKey="allocated"
          fill="rgb(var(--metric-purple-main))"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="spent"
          fill="rgb(var(--metric-mint-main))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
      </ChartContainer>
  )
}
