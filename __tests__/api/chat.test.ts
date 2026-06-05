/**
 * @jest-environment node
 *
 * Tests for POST /api/ai/chat
 *
 * Runs in mock mode (no real Anthropic key) to verify:
 * - Auth guard: missing/invalid token → 401
 * - Validation: empty message → 400
 * - Happy path: returns a streaming text response with keyword-matched content
 */

import { POST } from '@/app/api/ai/chat/route'
import { NextRequest } from 'next/server'
import { signToken } from '@/lib/auth'

// Prevent real Anthropic client from initializing (no API key in test env)
jest.mock('@/lib/ai', () => ({
  AI_MODEL: 'claude-sonnet-4-6',
  anthropic: null, // chat route uses mock mode when key is placeholder — never reached in these tests
  MEDICAL_ANALYSIS_SYSTEM_PROMPT: '',
}))

// Isolate from real DB and Next.js cookie store
jest.mock('@/lib/prisma', () => ({
  prisma: {
    patient: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

const TEST_SECRET = 'test-secret-for-api-tests-at-least-32-chars!!'

async function makeRequest(body: unknown, token?: string): Promise<NextRequest> {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (token) headers.set('Cookie', `auth-token=${token}`)
  return new NextRequest('http://localhost:3000/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

describe('POST /api/ai/chat', () => {
  let validToken: string

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_SECRET
    // Force mock mode
    process.env.ANTHROPIC_API_KEY = 'sk-ant-YOUR_KEY_HERE'
    validToken = await signToken({ sub: 'u1', email: 'a@b.com', name: 'Alice', role: 'patient' })
  })

  afterAll(() => {
    delete process.env.JWT_SECRET
    delete process.env.ANTHROPIC_API_KEY
  })

  it('returns 401 when no auth cookie is present', async () => {
    const req = await makeRequest({ messages: [{ role: 'user', content: 'hello' }] })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 for a malformed/tampered token', async () => {
    const req = await makeRequest(
      { messages: [{ role: 'user', content: 'hello' }] },
      'not.a.valid.jwt'
    )
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 for an empty message', async () => {
    const req = await makeRequest({ messages: [{ role: 'user', content: '' }] }, validToken)
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for malformed JSON body', async () => {
    const headers = new Headers({ 'Content-Type': 'application/json', Cookie: `auth-token=${validToken}` })
    const req = new NextRequest('http://localhost:3000/api/ai/chat', {
      method: 'POST',
      headers,
      body: 'not json at all',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('streams a text response for a valid request', async () => {
    const req = await makeRequest(
      { messages: [{ role: 'user', content: 'hello' }] },
      validToken
    )
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')

    // Drain the stream
    const text = await res.text()
    expect(text.length).toBeGreaterThan(10)
  })

  it('returns dengue-related content when asked about dengue', async () => {
    const req = await makeRequest(
      { messages: [{ role: 'user', content: 'What should I do if I have dengue fever?' }] },
      validToken
    )
    const res = await POST(req)
    const text = await res.text()
    expect(text.toLowerCase()).toContain('dengue')
  })
})
