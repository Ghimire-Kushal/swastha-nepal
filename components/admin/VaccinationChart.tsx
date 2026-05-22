'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

interface Props {
  data: { vaccine: string; covered: number; target: number }[]
}

export default function VaccinationChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="vaccine" tick={{ fontSize: 11, fill: '#64748b' }} angle={-35} textAnchor="end" />
        <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <Tooltip formatter={(v) => [`${v}%`, 'Coverage']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
        <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target 80%', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
        <Bar dataKey="covered" fill="#10b981" radius={[4, 4, 0, 0]} name="Coverage %" />
      </BarChart>
    </ResponsiveContainer>
  )
}
