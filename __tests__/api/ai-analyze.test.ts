/**
 * @jest-environment node
 *
 * POST /api/ai/analyze — auth guard, missing API key, input validation
 */

import { POST } from '@/app/api/ai/analyze/route'
import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'

const SECRET = 'test-secret-analyze-tests-at-least-32-chars!!'

jest.mock('@/lib/ai', () => {
  const analysisResponse = JSON.stringify({
    riskLevel: 'low', riskScore: 20, summary: 'All values normal.',
    abnormalFindings: [], risks: [], specialists: [],
    advice: ['Stay hydrated'], aiConfidence: 'high',
    disclaimer: 'For informational purposes only.',
  })
  const chunks = [
    { type: 'content_block_delta', delta: { type: 'text_delta', text: analysisResponse } },
  ]
  const stream = {
    [Symbol.asyncIterator]() {
      let i = 0
      return { next: async () => i < chunks.length ? { value: chunks[i++], done: false } : { done: true as const, value: undefined } }
    },
  }
  return {
    AI_MODEL: 'claude-sonnet-4-6',
    MEDICAL_ANALYSIS_SYSTEM_PROMPT: 'You are a medical AI.',
    anthropic: {
      messages: {
        stream: jest.fn().mockReturnValue(stream),
        create: jest.fn(),
      },
    },
  }
})

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn().mockReturnValue(undefined), set: jest.fn() }),
}))

function makeReq(body: unknown, cookie?: string): NextRequest {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (cookie) headers.set('Cookie', `auth-token=${cookie}`)
  return new NextRequest('http://localhost:3000/api/ai/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

const SAMPLE_PATIENT = {
  name: 'Test Patient',
  age: 35,
  gender: 'male',
  bloodType: 'O_POS',
  conditions: [],
  medications: [],
  allergies: [],
  labResults: [{ test: 'Haemoglobin', value: '14', unit: 'g/dL', referenceRange: '13.5-17.5', isAbnormal: false }],
}

describe('POST /api/ai/analyze', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = SECRET
    process.env.ANTHROPIC_API_KEY = 'sk-ant-real-key'
  })
  afterEach(() => {
    delete process.env.JWT_SECRET
    delete process.env.ANTHROPIC_API_KEY
  })

  it('returns 401 with no auth cookie', async () => {
    const res = await POST(makeReq({ patientData: SAMPLE_PATIENT }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with tampered token', async () => {
    const res = await POST(makeReq({ patientData: SAMPLE_PATIENT }, 'bad.token.here'))
    expect(res.status).toBe(401)
  })

  it('returns 503 when ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const token = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'doctor' })
    const res = await POST(makeReq({ patientData: SAMPLE_PATIENT }, token))
    expect(res.status).toBe(503)
  })

  it('returns 400 for invalid JSON body', async () => {
    const token = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'doctor' })
    const headers = new Headers({ 'Content-Type': 'application/json', Cookie: `auth-token=${token}` })
    const req = new NextRequest('http://localhost:3000/api/ai/analyze', {
      method: 'POST', headers, body: 'not json',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with valid request and mocked AI', async () => {
    const token = await signToken({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'doctor' })
    const res = await POST(makeReq({ patientData: SAMPLE_PATIENT }, token))
    expect(res.status).toBe(200)
    const body = await res.json() as { riskLevel: string }
    expect(body.riskLevel).toBe('low')
  })

  it('allows patient role to call analyze', async () => {
    const token = await signToken({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    const res = await POST(makeReq({ patientData: SAMPLE_PATIENT }, token))
    expect(res.status).toBe(200)
  })
})
