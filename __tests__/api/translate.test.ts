/**
 * @jest-environment node
 * POST /api/translate — input validation, fallback on external failure, XSS in input
 */

import { POST } from '@/app/api/translate/route'

function makeReq(body: unknown) {
  return new Request('http://localhost:3000/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// Stub global fetch so tests never hit the real mymemory API
const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockResolvedValue({
    json: async () => ({ responseData: { translatedText: 'नमस्ते' } }),
  })
})
afterEach(() => mockFetch.mockReset())

describe('POST /api/translate', () => {
  it('returns 400 when text is missing', async () => {
    const res = await POST(makeReq({ from: 'en', to: 'np' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when text is not a string', async () => {
    const res = await POST(makeReq({ text: 123 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when text is empty string', async () => {
    const res = await POST(makeReq({ text: '' }))
    expect(res.status).toBe(400)
  })

  it('returns translated text on success', async () => {
    const res = await POST(makeReq({ text: 'Hello', from: 'en', to: 'np' }))
    expect(res.status).toBe(200)
    const body = await res.json() as { translated: string }
    expect(body.translated).toBe('नमस्ते')
  })

  it('falls back to original text when external API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network error'))
    const res = await POST(makeReq({ text: 'Fallback text', from: 'en', to: 'np' }))
    expect(res.status).toBe(200)
    const body = await res.json() as { translated: string }
    expect(body.translated).toBe('Fallback text')
  })

  it('truncates text to 500 chars before sending to API (no crash on huge input)', async () => {
    const longText = 'A'.repeat(2000)
    const res = await POST(makeReq({ text: longText }))
    expect(res.status).toBe(200)
    const calledUrl: string = mockFetch.mock.calls[0][0] as string
    const q = new URL(calledUrl).searchParams.get('q')!
    expect(q.length).toBeLessThanOrEqual(500)
  })

  it('encodes special chars (XSS attempt) safely in URL', async () => {
    const res = await POST(makeReq({ text: '<script>alert(1)</script>' }))
    expect(res.status).toBe(200)
    const calledUrl: string = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).not.toContain('<script>')
    expect(calledUrl).toContain('%3Cscript%3E')
  })

  it('defaults from=en to=np when not provided', async () => {
    await POST(makeReq({ text: 'Test' }))
    const calledUrl: string = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('langpair=en%7Cnp')
  })
})
