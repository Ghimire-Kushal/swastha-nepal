import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { text, from = 'en', to = 'np' } = await req.json()
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  const langPair = `${from}|${to}`
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${langPair}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    const translated: string = data?.responseData?.translatedText ?? text
    return NextResponse.json({ translated })
  } catch {
    return NextResponse.json({ translated: text })
  }
}
