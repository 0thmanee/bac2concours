"use client"

import { Label, PieChart, Pie, Cell } from "recharts"
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
    label: "Amount",
  },
}

const CATEGORY_COLORS = [
  "rgb(var(--metric-blue-main))",
  "rgb(var(--metric-orange-main))",
  "rgb(var(--metric-cyan-main))",
  "rgb(var(--metric-purple-main))",
  "rgb(var(--metric-mint-main))",
  "rgb(var(--metric-rose-main))",
  "rgb(var(--metric-yellow-main))",
  "rgb(var(--metric-teal-main))",
]

function groupExpensesByCategory(expenses: Array<{ category?: { name: string }; amount: number }>) {
  const categoryData: Record<string, number> = {}
  
  expenses
    .filter(exp => exp.category?.name)
    .forEach(expense => {
      const categoryName = expense.category!.name
      categoryData[categoryName] = (categoryData[categoryName] || 0) + expense.amount
    })
  
  return Object.entries(categoryData)
    .map(([category, amount], index) => ({
      category,
      amount,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function YearlyBreakdownChart() {
  const { data: expensesData, isLoading } = useExpenses({
    status: EXPENSE_STATUS.APPROVED,
  })
  
  const chartData = useMemo(() => {
    if (!expensesData?.data) return []
    return groupExpensesByCategory(expensesData.data as Array<{ category?: { name: string }; amount: number }>)
  }, [expensesData])

  const totalAmount = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [chartData])

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
    <div className="flex flex-col gap-4">
      <ChartContainer config={chartConfig} className="mx-auto aspect-square h-62.5 w-full max-w-[300px] min-w-0">
        <PieChart
          width={undefined}
          height={undefined}
        >
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-45"
                nameKey="category"
                formatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            innerRadius={60}
            outerRadius={90}
            strokeWidth={2}
            stroke="rgb(var(--ops-surface))"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="text-3xl font-bold"
                        fill="rgb(var(--ops-text-primary))"
                      >
                        ${(totalAmount / 1000).toFixed(0)}K
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="text-sm"
                        fill="rgb(var(--ops-text-tertiary))"
                      >
                        Total Spent
                      </tspan>
                    </text>
                  )
                }
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm shrink-0 legend-indicator"
              style={{ '--legend-color': item.fill } as React.CSSProperties}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate text-ops-secondary">
                {item.category}
              </p>
              <p className="text-sm font-semibold text-ops-primary">
                ${(item.amount / 1000).toFixed(1)}K
              </p>
            </div>
            <span className="text-xs font-medium text-ops-tertiary">
              {((item.amount / totalAmount) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

