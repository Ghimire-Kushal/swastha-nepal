'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface Props {
  data: { name: string; count: number; trend: number }[]
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff']

export default function DiseaseChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 120, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          width={120}
        />
        <Tooltip
          formatter={(v) => [typeof v === 'number' ? v.toLocaleString() : v, 'Patients']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
