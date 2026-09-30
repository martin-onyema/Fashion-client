'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function truncate(s: string, n: number) {
  if (s.length <= n) return s
  return s.slice(0, n).trim() + '…'
}

export function TopProductsBarChart({
  data,
}: {
  data: { productName: string; _sum: { quantity: number; totalPrice: number }; _count: number }[]
}) {
  const chartData = data.map((d) => ({
    name: truncate(d.productName, 18),
    units: d._sum.quantity,
    revenue: d._sum.totalPrice,
  }))
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#6b6963' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b6963' }}
            tickLine={false}
            axisLine={false}
            width={140}
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
              name === 'units' ? value : '₦' + value.toLocaleString('en-NG'),
              name === 'units' ? 'Units sold' : 'Revenue',
            ]}
          />
          <Bar dataKey="units" fill="#0a0a0a" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
