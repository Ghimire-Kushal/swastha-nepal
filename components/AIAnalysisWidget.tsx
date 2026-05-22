'use client'

import { useState } from 'react'
import type { AIAnalysis, AIAnalysisRequest, RiskLevel } from '@/types/ai'
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Users,
} from 'lucide-react'

// ─── Risk level display config ─────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskLevel, { label: string; bg: string; border: string; text: string; badge: string; icon: React.ReactNode }> = {
  low: {
    label: 'Low Risk',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
  },
  medium: {
    label: 'Medium Risk',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
  },
  high: {
    label: 'High Risk',
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
  },
  emergency: {
    label: 'EMERGENCY',
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
    badge: 'bg-red-100 text-red-700 border-red-300',
    icon: <Zap className="w-5 h-5 text-red-600 animate-pulse" />,
  },
}

const URGENCY_CONFIG = {
  routine: 'bg-slate-100 text-slate-600',
  soon: 'bg-amber-100 text-amber-700',
  urgent: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
}

// ─── Main widget ───────────────────────────────────────────────────────────────

interface Props {
  patientData: AIAnalysisRequest
  title?: string
}

export default function AIAnalysisWidget({ patientData, title = 'AI Health Analysis' }: Props) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    findings: true,
    risks: true,
    specialists: true,
    advice: true,
  })

  function toggleSection(key: keyof typeof expandedSections) {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }))
  }

  async function runAnalysis() {
    setLoading(true)
    setAnalysis(null)
    setError(null)
    setStreaming('')

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientData }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Analysis failed')
      }

      // Stream the response text
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreaming(fullText)
      }

      // Parse JSON from complete streamed text
      const jsonMatch = fullText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Could not parse analysis response')

      const parsed: AIAnalysis = JSON.parse(jsonMatch[0])
      setAnalysis(parsed)
      setStreaming('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const riskCfg = analysis ? RISK_CONFIG[analysis.riskLevel] : null

  return (
    <div className="space-y-4">
      {/* Trigger */}
      {!analysis && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-blue-100 flex items-center justify-center mx-auto mb-3">
            <Brain className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">{title}</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-sm mx-auto">
            Claude AI will analyze your health data and generate a personalized risk assessment with specialist recommendations.
          </p>
          <button
            onClick={runAnalysis}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Brain className="w-4 h-4" />
            Analyze My Health
          </button>
        </div>
      )}

      {/* Streaming / loading state */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">AI is analyzing your health data…</div>
              <div className="text-xs text-slate-400">Powered by Claude AI · Nepal Health Context</div>
            </div>
          </div>

          {streaming ? (
            <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs text-slate-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
              {streaming}
              <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-0.5 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-2">
              {[80, 60, 90, 50, 70].map((w, i) => (
                <div key={i} className={`h-3 bg-slate-100 rounded animate-pulse`} style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium text-red-800">{error}</div>
            {error.includes('ANTHROPIC_API_KEY') && (
              <div className="text-xs text-red-600 mt-1 font-mono">
                Add ANTHROPIC_API_KEY=sk-ant-... to .env.local
              </div>
            )}
          </div>
          <button onClick={runAnalysis} className="text-xs text-red-700 hover:text-red-800 font-medium flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Analysis result */}
      {analysis && riskCfg && (
        <div className="space-y-4">
          {/* Risk header */}
          <div className={`rounded-2xl border-2 p-5 ${riskCfg.bg} ${riskCfg.border}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {riskCfg.icon}
                <div>
                  <div className={`font-black text-xl ${riskCfg.text}`}>{riskCfg.label}</div>
                  <div className={`text-sm mt-0.5 ${riskCfg.text} opacity-80`}>{analysis.summary}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-4xl font-black ${riskCfg.text}`}>{analysis.riskScore}</div>
                <div className={`text-xs ${riskCfg.text} opacity-60`}>risk score</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full border font-medium flex items-center gap-1 ${riskCfg.badge}`}>
                {riskCfg.icon}
                {riskCfg.label}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                AI Confidence: <span className="font-semibold capitalize">{analysis.aiConfidence}</span>
              </span>
              <button
                onClick={runAnalysis}
                className="ml-auto text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Re-analyze
              </button>
            </div>
          </div>

          {/* Abnormal findings */}
          {analysis.abnormalFindings.length > 0 && (
            <Section
              title="Abnormal Findings"
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              count={analysis.abnormalFindings.length}
              expanded={expandedSections.findings}
              onToggle={() => toggleSection('findings')}
            >
              <div className="space-y-2">
                {analysis.abnormalFindings.map((f, i) => {
                  const cfg = RISK_CONFIG[f.severity]
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 mt-0.5">{cfg.icon}</div>
                        <div>
                          <div className={`font-semibold text-sm ${cfg.text}`}>{f.finding}</div>
                          <div className={`text-xs mt-0.5 ${cfg.text} opacity-80`}>{f.explanation}</div>
                        </div>
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0 ${cfg.badge}`}>
                          {f.severity}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Health risks */}
          {analysis.risks.length > 0 && (
            <Section
              title="Predicted Health Risks"
              icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
              count={analysis.risks.length}
              expanded={expandedSections.risks}
              onToggle={() => toggleSection('risks')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.risks.map((r, i) => {
                  const cfg = RISK_CONFIG[r.level]
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`font-semibold text-sm ${cfg.text}`}>{r.risk}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0 ${cfg.badge}`}>
                          {r.level}
                        </span>
                      </div>
                      <p className={`text-xs ${cfg.text} opacity-80`}>{r.description}</p>
                      <div className={`text-xs mt-1.5 ${cfg.text} opacity-60`}>
                        Probability: <span className="font-medium capitalize">{r.probability}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Specialist recommendations */}
          {analysis.specialists.length > 0 && (
            <Section
              title="Recommended Specialists"
              icon={<Users className="w-4 h-4 text-blue-500" />}
              count={analysis.specialists.length}
              expanded={expandedSections.specialists}
              onToggle={() => toggleSection('specialists')}
            >
              <div className="space-y-2">
                {analysis.specialists.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm">{s.type}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.reason}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize shrink-0 ${URGENCY_CONFIG[s.urgency]}`}>
                      {s.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Advice */}
          {analysis.advice.length > 0 && (
            <Section
              title="AI Recommendations"
              icon={<CheckCircle className="w-4 h-4 text-emerald-500" />}
              count={analysis.advice.length}
              expanded={expandedSections.advice}
              onToggle={() => toggleSection('advice')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analysis.advice.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-emerald-800">{a}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">{analysis.disclaimer}</p>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="ml-auto text-xs text-slate-400 hover:text-slate-600 shrink-0"
            >
              {showRaw ? 'Hide' : 'Raw JSON'}
            </button>
          </div>

          {showRaw && (
            <pre className="bg-slate-900 text-green-400 text-xs p-4 rounded-xl overflow-auto max-h-64">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Section accordion ─────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-slate-900 text-sm">{title}</span>
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {expanded && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}
