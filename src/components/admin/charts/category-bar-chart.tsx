'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#0a0a0a', '#3a3a3a', '#6b6963', '#9b978d', '#b8b3a8', '#d6d3cb']

function formatNGNCompact(amount: number): string {
  if (amount >= 1_000_000) return '₦' + (amount / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (amount >= 1_000) return '₦' + (amount / 1_000).toFixed(1).replace('.0', '') + 'k'
  return '₦' + Math.round(amount).toLocaleString('en-NG')
}

export function CategoryBarChart({
  data,
}: {
  data: { name: string; revenue: number; quantity: number }[]
}) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b6963' }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-12}
            textAnchor="end"
            height={48}
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
            formatter={(value: number, name: string) => [
              name === 'revenue' ? formatNGNCompact(value) : value,
              name === 'revenue' ? 'Revenue' : 'Units',
            ]}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
