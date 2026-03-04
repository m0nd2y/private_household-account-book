"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface BarChartData {
  name: string
  income?: number
  expense?: number
  total?: number
  [key: string]: string | number | undefined
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
  bars?: Array<{
    dataKey: string
    name: string
    color: string
  }>
}

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

const DEFAULT_BARS = [
  { dataKey: "income", name: "수입", color: "#22C55E" },
  { dataKey: "expense", name: "지출", color: "#EF4444" },
]

export function MonthlyBarChart({ data, title, bars = DEFAULT_BARS }: BarChartProps) {
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
      <ResponsiveContainer width="100%" height={350}>
        <RechartsBarChart
          data={data}
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
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
