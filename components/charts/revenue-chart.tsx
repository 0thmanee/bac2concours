"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { date: "16/08", earnings: 3500, expenses: 2800 },
  { date: "17/08", earnings: 4200, expenses: 3100 },
  { date: "18/08", earnings: 3800, expenses: 2900 },
  { date: "19/08", earnings: 5200, expenses: 3800 },
  { date: "20/08", earnings: 4500, expenses: 3200 },
  { date: "21/08", earnings: 4800, expenses: 3500 },
  { date: "22/08", earnings: 5000, expenses: 3700 },
]

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "rgb(var(--metric-blue-main))",
  },
  expenses: {
    label: "Expenses",
    color: "rgb(var(--metric-cyan-main))",
  },
}

export function RevenueChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
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
          <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="rgb(var(--metric-cyan-main))"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="rgb(var(--metric-cyan-main))"
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
          dataKey="date"
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
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="rgb(var(--metric-blue-main))"
          strokeWidth={2}
          fill="url(#fillEarnings)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stroke="rgb(var(--metric-cyan-main))"
          strokeWidth={2}
          fill="url(#fillExpenses)"
        />
      </AreaChart>
    </ChartContainer>
  )
}
