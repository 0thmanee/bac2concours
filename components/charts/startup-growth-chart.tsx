"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useStartups } from "@/lib/hooks/use-startups"
import { STARTUP_STATUS } from "@/lib/constants"
import { useMemo } from "react"

const chartConfig = {
  active: {
    label: "Active Startups",
    color: "rgb(var(--metric-blue-main))",
  },
}

function calculateActiveStartupsOverTime(startups: Array<{ createdAt: Date | string }>) {
  const monthlyData: Record<string, { month: string; active: number; date: Date }> = {}
  const now = new Date()
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = date.toLocaleDateString('en-US', { month: 'short' })
    monthlyData[monthKey] = { month: monthLabel, active: 0, date: date }
  }
  
  // Count startups created before each month end (already filtered by status in API)
  startups.forEach(startup => {
      const createdAt = new Date(startup.createdAt)
      Object.keys(monthlyData).forEach(monthKey => {
        const monthEnd = new Date(monthlyData[monthKey].date)
        monthEnd.setMonth(monthEnd.getMonth() + 1)
        if (createdAt < monthEnd) {
          monthlyData[monthKey].active += 1
        }
      })
    })
  
  return Object.values(monthlyData)
    .map(item => ({ month: item.month, active: item.active }))
}

export function StartupGrowthChart() {
  const { data: startupsData, isLoading } = useStartups({
    status: STARTUP_STATUS.ACTIVE,
  })
  
  const chartData = useMemo(() => {
    if (!startupsData?.data) return []
    return calculateActiveStartupsOverTime(startupsData.data as Array<{ createdAt: Date | string }>)
  }, [startupsData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-ops-tertiary">Loading chart data...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-sm text-ops-tertiary">No data available</p>
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillActive" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="rgb(var(--metric-blue-main))"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="rgb(var(--metric-blue-main))"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
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
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              className="w-[150px]"
              formatter={(value) => `${value} startups`}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="active"
          stroke="rgb(var(--metric-blue-main))"
          strokeWidth={2}
          fill="url(#fillActive)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
