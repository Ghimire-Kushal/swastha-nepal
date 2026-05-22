export type RiskLevel = 'low' | 'medium' | 'high' | 'emergency'
export type Urgency = 'routine' | 'soon' | 'urgent' | 'emergency'
export type Confidence = 'low' | 'medium' | 'high'

export interface AIAbnormalFinding {
  finding: string
  severity: RiskLevel
  explanation: string
}

export interface AIRisk {
  risk: string
  level: RiskLevel
  description: string
  probability: 'low' | 'medium' | 'high'
}

export interface AISpecialist {
  type: string
  reason: string
  urgency: Urgency
}

export interface AIAnalysis {
  riskLevel: RiskLevel
  riskScore: number
  summary: string
  abnormalFindings: AIAbnormalFinding[]
  risks: AIRisk[]
  specialists: AISpecialist[]
  advice: string[]
  aiConfidence: Confidence
  disclaimer: string
}

export interface AIAnalysisRequest {
  patientInfo: {
    name: string
    age: number
    gender: string
    bloodType: string
  }
  vitalSigns?: Record<string, string>
  currentMedications?: string[]
  allergies?: Array<{ allergen: string; severity: string; reaction: string }>
  labResults?: Array<{
    testName: string
    date: string
    results: Array<{ parameter: string; value: number | string; unit: string; referenceRange: string; isAbnormal: boolean }>
  }>
  medicalHistory?: Array<{ date: string; title: string; type: string; diagnosis?: string }>
  recentDiagnoses?: string[]
}
