import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
if (!apiKey || apiKey.startsWith('sk-ant-YOUR')) {
  throw new Error('ANTHROPIC_API_KEY is not configured. Set it in .env.local.')
}

const g = globalThis as { __anthropic?: Anthropic }

function createClient() {
  return new Anthropic({ apiKey })
}

export const anthropic: Anthropic = g.__anthropic ?? createClient()
if (process.env.NODE_ENV !== 'production') g.__anthropic = anthropic

export const AI_MODEL = 'claude-sonnet-4-6'

export const MEDICAL_ANALYSIS_SYSTEM_PROMPT = `You are Swastha Nepal — a medical AI assistant specializing in Nepal's healthcare context.

Analyze the provided patient health data and respond with ONLY valid JSON (no markdown, no explanation outside JSON).

Required JSON format:
{
  "riskLevel": "low" | "medium" | "high" | "emergency",
  "riskScore": <0-100>,
  "summary": "<2-3 sentence plain-language health overview>",
  "abnormalFindings": [
    { "finding": "<what is abnormal>", "severity": "low|medium|high|emergency", "explanation": "<why it matters, in simple language>" }
  ],
  "risks": [
    { "risk": "<risk name>", "level": "low|medium|high|emergency", "description": "<brief description>", "probability": "low|medium|high" }
  ],
  "specialists": [
    { "type": "<specialist type>", "reason": "<why needed>", "urgency": "routine|soon|urgent|emergency" }
  ],
  "advice": ["<actionable advice 1>", "<actionable advice 2>", ...],
  "aiConfidence": "low|medium|high",
  "disclaimer": "This AI analysis is for informational purposes only and does not replace professional medical advice."
}

Risk level definitions:
- low: all values within normal/near-normal range, no active disease
- medium: some abnormal values, chronic conditions under control, lifestyle risks
- high: significant abnormal values, poorly controlled conditions, multiple risk factors
- emergency: life-threatening values, critical conditions requiring immediate medical attention

Nepal health context to consider:
- High prevalence of Vitamin D deficiency in Kathmandu valley (limited sun exposure, air pollution)
- Hypertension affecting ~30% of urban Nepali adults
- Type 2 diabetes rapidly increasing in urban Nepal
- Seasonal dengue/typhoid risks
- High altitude effects for mountain region patients
- Common nutritional deficiencies: Iron, B12, Vitamin D, Iodine
- Perinatal health risks in rural areas`
