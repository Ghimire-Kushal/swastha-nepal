import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { anthropic, AI_MODEL, MEDICAL_ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai'
import type { AIAnalysisRequest } from '@/types/ai'

export async function POST(request: NextRequest) {
  // Auth check
  const token = request.cookies.get('auth-token')?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await verifyToken(token)
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'AI service not configured — add ANTHROPIC_API_KEY to .env.local' },
      { status: 503 }
    )
  }

  let patientData: AIAnalysisRequest
  try {
    const body = await request.json()
    patientData = body.patientData
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const userMessage = `Analyze this patient's health data and return JSON analysis:

${JSON.stringify(patientData, null, 2)}`

  // Stream Claude's response directly to the client
  const stream = await anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: 2048,
    system: MEDICAL_ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
