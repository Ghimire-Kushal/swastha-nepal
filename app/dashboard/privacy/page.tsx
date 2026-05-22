'use client'

import { useState } from 'react'
import { Shield, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'

interface PrivacySetting {
  id: string
  label: string
  description: string
  category: 'sharing' | 'access' | 'emergency'
  enabled: boolean
}

const DEFAULT_SETTINGS: PrivacySetting[] = [
  {
    id: 'share_doctor',
    label: 'Share records with assigned doctor',
    description: 'Allow your assigned doctor to view your full medical history, prescriptions, and lab reports.',
    category: 'sharing',
    enabled: true,
  },
  {
    id: 'share_lab',
    label: 'Share records with lab technicians',
    description: 'Allow lab technicians to view your relevant health data when processing lab orders.',
    category: 'sharing',
    enabled: true,
  },
  {
    id: 'share_pharmacy',
    label: 'Share prescriptions with pharmacists',
    description: 'Allow pharmacists to verify and dispense your digital prescriptions.',
    category: 'sharing',
    enabled: true,
  },
  {
    id: 'share_hospital_admin',
    label: 'Include in hospital analytics',
    description: 'Allow anonymized health data to be included in hospital-level statistics (no personally identifiable information).',
    category: 'sharing',
    enabled: true,
  },
  {
    id: 'national_registry',
    label: 'Include in national health registry',
    description: 'Contribute anonymized data to Nepal national health statistics for public health research.',
    category: 'sharing',
    enabled: false,
  },
  {
    id: 'emergency_qr_public',
    label: 'Enable Emergency QR public access',
    description: 'Allow anyone with your QR code to view critical emergency health info (blood type, allergies, emergency contacts). Disabling this may affect emergency care.',
    category: 'emergency',
    enabled: true,
  },
  {
    id: 'emergency_show_meds',
    label: 'Show medications on emergency page',
    description: 'Display your current medications on the public emergency QR page.',
    category: 'emergency',
    enabled: true,
  },
  {
    id: 'two_factor',
    label: 'Require login notification',
    description: 'Get notified via email when your account is accessed from a new device.',
    category: 'access',
    enabled: false,
  },
  {
    id: 'audit_access',
    label: 'Show who viewed my records',
    description: 'Enable access logging so you can see which providers viewed your records.',
    category: 'access',
    enabled: true,
  },
]

const CATEGORY_META = {
  sharing:   { label: 'Data Sharing',     color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200' },
  emergency: { label: 'Emergency Access', color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' },
  access:    { label: 'Account Security', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
}

export default function PrivacyPage() {
  const [settings, setSettings] = useState<PrivacySetting[]>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  function toggle(id: string) {
    setSettings((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s))
    setSaved(false)
  }

  function save() {
    // TODO: persist via server action to database
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const grouped = (['sharing', 'emergency', 'access'] as const).map((cat) => ({
    category: cat,
    meta: CATEGORY_META[cat],
    items: settings.filter((s) => s.category === cat),
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" />
          Privacy &amp; Security
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Control who can access your health data and how it is used
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Privacy settings saved successfully
        </div>
      )}

      {grouped.map(({ category, meta, items }) => (
        <div key={category} className={`rounded-xl border ${meta.border} overflow-hidden`}>
          <div className={`${meta.bg} px-5 py-3 border-b ${meta.border}`}>
            <h2 className={`font-semibold text-sm ${meta.color}`}>{meta.label}</h2>
          </div>
          <div className="bg-white divide-y divide-slate-50">
            {items.map((s) => (
              <div key={s.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {s.enabled
                      ? <Eye className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      : <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    }
                    <span className="font-medium text-slate-900 text-sm">{s.label}</span>
                    {s.id === 'emergency_qr_public' && (
                      <Lock className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-5">{s.description}</p>
                </div>
                <button
                  onClick={() => toggle(s.id)}
                  className={`relative shrink-0 w-10 h-5 rounded-full transition-colors focus:outline-none ${
                    s.enabled ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-label={s.enabled ? 'Disable' : 'Enable'}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      s.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={save}
          className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
        >
          Save Settings
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Your data is encrypted at rest and in transit · Swastha Nepal AI complies with Nepal health data regulations
      </p>
    </div>
  )
}
