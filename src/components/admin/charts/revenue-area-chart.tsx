'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Point = { date: string; revenue: number }

function formatDateShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })
}

function formatNGNCompact(amount: number): string {
  if (amount >= 1_000_000) return '₦' + (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (amount >= 1_000) return '₦' + (amount / 1_000).toFixed(1).replace('.0', '') + 'k'
  return '₦' + Math.round(amount).toLocaleString('en-NG')
}

export function RevenueAreaChart({ data }: { data: Point[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontSize: 11, fill: '#6b6963' }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={formatNGNCompact}
            tick={{ fontSize: 11, fill: '#6b6963' }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e7e5e0',
              borderRadius: 8,
              fontSize: 12,
              color: '#0a0a0a',
            }}
            labelFormatter={(label) => formatDateShort(String(label))}
            formatter={(value: number) => [formatNGNCompact(value), 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0a0a0a"
            strokeWidth={2}
            fill="url(#revGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#0a0a0a' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
