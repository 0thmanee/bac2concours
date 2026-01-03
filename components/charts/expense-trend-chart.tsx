"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useExpenses } from "@/lib/hooks/use-expenses"
import { EXPENSE_STATUS } from "@/lib/constants"
import { useMemo } from "react"

const chartConfig = {
  amount: {
    label: "Monthly Expenses",
    color: "rgb(var(--metric-orange-main))",
  },
}

function groupExpensesByMonth(expenses: Array<{ date: Date | string; amount: number }>) {
  const monthlyData: Record<string, { month: string; amount: number; date: Date }> = {}
  
  expenses.forEach(expense => {
      const date = new Date(expense.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, amount: 0, date: date }
      }
      monthlyData[monthKey].amount += expense.amount
    })
  
  // Sort by date and get last 6 months
  return Object.values(monthlyData)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-6)
    .map(item => ({ month: item.month, amount: item.amount }))
}

export function ExpenseTrendChart({ startupId }: { startupId?: string } = {}) {
  const { data: expensesData, isLoading } = useExpenses({
    status: EXPENSE_STATUS.APPROVED,
    ...(startupId && { startupId }),
  })
  
  const chartData = useMemo(() => {
    if (!expensesData?.data) return []
    return groupExpensesByMonth(expensesData.data as Array<{ date: Date | string; amount: number }>)
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
    <ChartContainer config={chartConfig} className="h-[300px] w-full min-w-0">
      <LineChart
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
              className="w-[150px]"
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="rgb(var(--metric-orange-main))"
          strokeWidth={2}
          dot={{
            fill: "rgb(var(--metric-orange-main))",
            r: 4,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ChartContainer>
  )
}
