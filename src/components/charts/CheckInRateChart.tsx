'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface CheckInRateChartProps {
  data: { label: string; value: number; color: string }[]
  title: string
  className?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; payload: { label: string; color: string } }>
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const item = payload[0]
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{item.payload.label}</p>
      <p className="text-sm font-bold" style={{ color: item.payload.color }}>
        {item.value.toLocaleString('id-ID')}
      </p>
    </div>
  )
}

export function CheckInRateChart({ data, title, className }: CheckInRateChartProps) {
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
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.3)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
