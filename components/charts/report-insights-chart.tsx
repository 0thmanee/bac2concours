"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { EXPENSE_STATUS } from "@/lib/constants"
import { useMemo } from "react"
import type { ExpenseWithRelations } from "@/lib/types/prisma"

const chartConfig = {
  expenses: {
    label: "Expenses",
    color: "rgb(var(--metric-orange-main))",
  },
  approvals: {
    label: "Approvals",
    color: "rgb(var(--metric-blue-main))",
  },
}

function groupExpensesByMonth(expenses: ExpenseWithRelations[]) {
  const monthlyData: Record<string, { month: string; expenses: number; approvals: number; date: Date }> = {}
  
  expenses.forEach(expense => {
    const date = new Date(expense.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthLabel, expenses: 0, approvals: 0, date: date }
    }
    
    monthlyData[monthKey].expenses += expense.amount
    monthlyData[monthKey].approvals += 1
  })
  
  // Sort by date and get last 6 months
  return Object.values(monthlyData)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6)
    .map(item => ({ month: item.month, expenses: item.expenses, approvals: item.approvals }))
}

export function ReportInsightsChart() {
  const { data: expensesData, isLoading } = useExpenses({
    status: EXPENSE_STATUS.APPROVED,
  })
  
  const chartData = useMemo(() => {
    if (!expensesData?.data) return []
    return groupExpensesByMonth(expensesData.data as ExpenseWithRelations[])
  }, [expensesData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-ops-tertiary">Loading chart data...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-ops-tertiary">No data available</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="rgb(var(--neutral-200))"
          vertical={false}
        />
        <XAxis
          dataKey="month"
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
              formatter={(value, name) => 
                name === 'expenses' 
                  ? `$${Number(value).toLocaleString()}` 
                  : `${value} requests`
              }
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="expenses"
          fill="rgb(var(--metric-orange-main))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <Bar
          dataKey="approvals"
          fill="rgb(var(--metric-blue-main))"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ChartContainer>
  )
}
