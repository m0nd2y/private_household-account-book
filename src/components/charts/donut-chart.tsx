"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface DonutChartData {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutChartData[]
  title?: string
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: DonutChartData }>
}) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="text-sm font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(item.value)}
        </p>
      </div>
    )
  }
  return null
}

export function DonutChart({ data, title }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

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
      <div className="relative">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">합계</p>
            <p className="text-lg font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-muted-foreground">{item.name}</span>
            <span className="ml-auto shrink-0 font-medium">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
