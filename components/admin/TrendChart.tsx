'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface Props {
  data: { month: string; patients: number; prescriptions: number; labTests: number }[]
}

export default function TrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="patients" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Patients" />
        <Line type="monotone" dataKey="prescriptions" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Prescriptions" />
        <Line type="monotone" dataKey="labTests" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Lab Tests" />
      </LineChart>
    </ResponsiveContainer>
  )
}
