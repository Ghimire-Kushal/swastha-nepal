'use client'

import { useState, useRef, useEffect } from 'react'
import { Brain, Send, Trash2, AlertTriangle, Info } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Props {
  patientName: string
  conditions: string[]
  medications: string[]
}

export default function MedicalChatWidget({ patientName, conditions, medications }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste ${patientName}! I'm your Swastha Nepal AI health assistant. I can answer general health questions, explain symptoms, or help you understand medical information in the context of Nepal's healthcare system.\n\nPlease remember: I provide general health information only — always consult a qualified doctor for diagnosis and treatment.`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    timestamp: new Date(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get response')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setStreamingText(fullText)
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setStreamingText('')
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errMsg])
      setStreamingText('')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function clearChat() {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Namaste ${patientName}! How can I help you today?`,
        timestamp: new Date(),
      },
    ])
  }

  const QUICK_QUESTIONS = [
    'What are symptoms of dengue fever?',
    'How can I manage my blood pressure?',
    'What foods are good for Vitamin D?',
    'How much water should I drink daily?',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">Swastha Nepal AI Chat</div>
            <div className="text-blue-100 text-xs">Medical health assistant · Nepal context</div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Patient context badge */}
      {(conditions.length > 0 || medications.length > 0) && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700">
          <Info className="w-3.5 h-3.5 shrink-0" />
          AI knows your context: {conditions.slice(0, 2).join(', ')}
          {conditions.length > 2 ? ` +${conditions.length - 2} more` : ''}
          {medications.length > 0 ? ` · ${medications.length} medication${medications.length > 1 ? 's' : ''}` : ''}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <Brain className="w-3.5 h-3.5 text-white animate-pulse" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-slate-100 text-slate-800">
              {streamingText ? (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {streamingText}
                  <span className="inline-block w-1.5 h-4 bg-blue-500 ml-0.5 animate-pulse rounded-sm" />
                </p>
              ) : (
                <div className="flex gap-1 items-center h-5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick questions — only show when 1 message (welcome only) */}
      {messages.length === 1 && !loading && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-400 mb-2 font-medium">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full hover:bg-blue-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700">For informational purposes only. Not a substitute for professional medical advice.</p>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask a health question…"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-300 transition-all disabled:opacity-60"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
