'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface PaymentStatusChartProps {
  data: { name: string; value: number; color: string }[]
  title: string
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { color: string } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-sm font-medium" style={{ color: item.payload.color }}>
        {item.name}
      </p>
      <p className="text-sm text-muted-foreground">
        {item.value.toLocaleString('id-ID')} data
      </p>
    </div>
  )
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string; type?: string }>
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload || payload.length === 0) return null

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function PaymentStatusChart({ data, title, className }: PaymentStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className ?? ''}`}>
        <p className="text-sm text-muted-foreground">Belum ada data</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
