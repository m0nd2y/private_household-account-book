"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface MonthlyData {
  month: number
  income: number
  expense: number
}

interface MonthlyLineChartProps {
  data: MonthlyData[]
  title?: string
}

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
]

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string; name: string }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="mb-1 text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function MonthlyLineChart({ data, title }: MonthlyLineChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: MONTH_LABELS[d.month - 1],
  }))

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">데이터가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) =>
              value >= 10000
                ? `${Math.round(value / 10000)}만`
                : value.toLocaleString()
            }
            className="text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-sm">{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="수입"
            stroke="#22C55E"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="지출"
            stroke="#EF4444"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
