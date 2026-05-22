import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { anthropic, AI_MODEL } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

async function getPatientContext(userId: string): Promise<string> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true } },
        emergencyInfo: { select: { criticalConditions: true, currentMedications: true, bloodType: true } },
        allergies: { where: { isActive: true }, select: { allergenName: true, severity: true } },
      },
    })
    if (!patient) return ''

    const dob = patient.dateOfBirth
    const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null

    const lines = [
      `Patient: ${patient.user.name}`,
      age ? `Age: ${age}` : null,
      patient.gender ? `Gender: ${patient.gender}` : null,
      patient.emergencyInfo?.bloodType ? `Blood type: ${patient.emergencyInfo.bloodType.replace('_', ' ')}` : null,
      patient.district ? `District: ${patient.district}, Nepal` : null,
      patient.emergencyInfo?.criticalConditions?.length
        ? `Active conditions: ${patient.emergencyInfo.criticalConditions.join(', ')}`
        : 'No recorded conditions',
      patient.emergencyInfo?.currentMedications?.length
        ? `Current medications: ${patient.emergencyInfo.currentMedications.join(', ')}`
        : 'No current medications',
      patient.allergies.length
        ? `Allergies: ${patient.allergies.map((a) => `${a.allergenName} (${a.severity})`).join(', ')}`
        : 'No known allergies',
    ]
    return lines.filter(Boolean).join('\n')
  } catch {
    return ''
  }
}

const CHAT_SYSTEM = (context: string) => `You are Swastha Nepal AI — a medical assistant specializing in Nepal's healthcare context.
${context ? `\nCurrent patient context:\n${context}\n` : ''}
Guidelines:
- Answer health questions clearly and simply, in the patient's language level
- Keep responses concise (under 200 words) unless a detailed explanation is genuinely needed
- Always recommend seeing a doctor for diagnosis, prescriptions, or serious concerns
- Consider Nepal-specific health context: altitude, seasonal diseases (dengue, typhoid), common deficiencies (Vitamin D, Iron, B12), air quality in Kathmandu
- If a question suggests emergency (chest pain, severe bleeding, stroke signs, difficulty breathing), say so clearly and immediately
- Do not diagnose conditions or recommend specific medications
- Be empathetic and supportive

Respond conversationally, not as a list unless listing is the clearest format.`

const MOCK_RESPONSES: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ['hello', 'hi', 'namaste', 'hey'],
    response: "Namaste! I'm Swastha Nepal AI, your health assistant. I can answer general health questions, explain symptoms, help you understand your lab results, or discuss Nepal-specific health topics. How can I help you today?",
  },
  {
    keywords: ['vitamin d', 'vitamin d deficiency', 'sunshine'],
    response: "Vitamin D deficiency is very common in Nepal, especially in Kathmandu where air pollution and tall buildings limit sun exposure. Symptoms include fatigue, bone pain, muscle weakness, and mood changes. Treatment typically involves supplementation (60,000 IU weekly for 8–12 weeks) and getting 15–20 minutes of direct sunlight daily. Please get a blood test (25-OH Vitamin D) to confirm your levels before starting supplements.",
  },
  {
    keywords: ['blood pressure', 'hypertension', 'high bp'],
    response: "Hypertension affects about 30% of urban Nepali adults. Key lifestyle changes include reducing salt (especially in pickles, papad, processed foods), regular exercise (30 min daily walk), stress management, and avoiding tobacco. Normal BP is below 120/80 mmHg. If your BP is consistently above 140/90, please see a doctor — medication may be needed alongside lifestyle changes.",
  },
  {
    keywords: ['diabetes', 'blood sugar', 'glucose'],
    response: "Type 2 diabetes is increasing rapidly in urban Nepal. Key management tips: limit white rice, bread, and sweets; increase vegetables and protein; walk 30–45 minutes daily; check blood sugar regularly. Fasting glucose above 126 mg/dL on two tests indicates diabetes. HbA1c below 7% is the target for most patients on treatment. Always work with your doctor to adjust medications.",
  },
  {
    keywords: ['dengue', 'fever', 'mosquito'],
    response: "Dengue fever peaks in Nepal during monsoon (July–October). Warning signs: high fever (39–40°C), severe headache, pain behind eyes, joint/muscle pain, rash. Danger signs requiring immediate hospital care: bleeding gums, severe abdominal pain, persistent vomiting, rapid breathing. Stay hydrated, use paracetamol (not ibuprofen or aspirin) for fever, and rest under a mosquito net.",
  },
  {
    keywords: ['headache', 'migraine', 'head pain'],
    response: "Headaches in Nepal can be triggered by dehydration (very common), air pollution, altitude, stress, or eye strain. For tension headaches: drink water, rest in a quiet dark room, apply a cold/warm compress. See a doctor urgently if: the headache is the worst of your life, comes with fever and stiff neck, vision changes, or weakness on one side of the body.",
  },
  {
    keywords: ['sleep', 'insomnia', 'can\'t sleep'],
    response: "Good sleep hygiene tips: keep a consistent sleep/wake time, avoid screens 1 hour before bed, keep your bedroom cool and dark, avoid tea/coffee after 4 PM. In Nepal, power cuts and noise can disrupt sleep — use earplugs or a fan for white noise. If insomnia persists for more than 3 weeks or affects your daily life significantly, consult a doctor.",
  },
  {
    keywords: ['depression', 'anxiety', 'mental health', 'stress', 'sad'],
    response: "Mental health is just as important as physical health. In Nepal, resources include the Mental Health Helpline: 1660-01-11111 (Transcultural Psychosocial Organization Nepal). Signs of depression: persistent sadness, loss of interest, sleep changes, fatigue lasting 2+ weeks. Anxiety: excessive worry, racing heart, difficulty concentrating. Please speak to a doctor or counselor — these conditions are treatable and there is no shame in seeking help.",
  },
  {
    keywords: ['pregnancy', 'pregnant', 'prenatal'],
    response: "Key prenatal care in Nepal: register at your nearest health post or hospital early (first trimester). Take folic acid 400 mcg daily before conception and during first trimester. Iron + folic acid supplements are available free at government health posts. Attend all 4+ ANC visits. Deliver at a health facility — Nepal has reduced maternal mortality significantly through facility births. Avoid certain traditional herbal remedies during pregnancy.",
  },
]

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  for (const item of MOCK_RESPONSES) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item.response + '\n\n*(Demo mode — add ANTHROPIC_API_KEY for full AI responses)*'
    }
  }
  return "That's a great health question. For accurate, personalized advice I'd recommend consulting a qualified doctor in Nepal. You can find certified doctors through the Nepal Medical Council directory or visit your nearest government hospital or health post.\n\n*(Demo mode — add ANTHROPIC_API_KEY for full AI-powered responses)*"
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let userId: string
  try {
    const payload = await verifyToken(token)
    userId = payload.sub
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let messages: Message[], lastMessage: string
  try {
    const body = await request.json()
    messages = body.messages ?? []
    lastMessage = messages[messages.length - 1]?.content ?? ''
    if (!lastMessage) return Response.json({ error: 'Empty message' }, { status: 400 })
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Mock mode — no API key configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-YOUR_KEY_HERE') {
    const mockText = getMockResponse(lastMessage)
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const words = mockText.split(' ')
        for (const word of words) {
          controller.enqueue(encoder.encode(word + ' '))
          await new Promise((r) => setTimeout(r, 25))
        }
        controller.close()
      },
    })
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const patientContext = await getPatientContext(userId)
  const systemPrompt = CHAT_SYSTEM(patientContext)

  const anthropicMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const stream = await anthropic.messages.stream({
    model: AI_MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: anthropicMessages,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
