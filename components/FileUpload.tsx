'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, X, FileText, Image, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export interface UploadedFile {
  url: string
  publicId: string
  format: string
  bytes: number
  name: string
}

interface Props {
  fileType?: 'lab_report' | 'scan' | 'prescription' | 'document'
  accept?: string
  maxSizeMB?: number
  onUpload: (file: UploadedFile) => void
  label?: string
}

export default function FileUpload({
  fileType = 'document',
  accept = '.pdf,.jpg,.jpeg,.png,.webp',
  maxSizeMB = 20,
  onUpload,
  label = 'Upload file',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFile = useCallback(async (file: File) => {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`File must be under ${maxSizeMB} MB`)
      setStatus('error')
      return
    }

    setStatus('uploading')
    setError(null)
    setProgress(10)

    const form = new FormData()
    form.append('file', file)
    form.append('type', fileType)

    try {
      // Fake incremental progress during upload
      const ticker = setInterval(() => setProgress((p) => Math.min(p + 15, 85)), 400)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      clearInterval(ticker)
      setProgress(100)

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(body.error ?? 'Upload failed')
      }

      const data = await res.json()
      const result: UploadedFile = { ...data, name: file.name }
      setUploaded(result)
      setStatus('success')
      onUpload(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }
  }, [fileType, maxSizeMB, onUpload])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function reset() {
    setStatus('idle')
    setUploaded(null)
    setError(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isImage = uploaded?.format && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(uploaded.format)

  if (status === 'success' && uploaded) {
    return (
      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        {isImage
          ? <Image className="w-5 h-5 text-emerald-600 shrink-0" />
          : <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-emerald-800 truncate">{uploaded.name}</div>
          <div className="text-xs text-emerald-600">
            {(uploaded.bytes / 1024).toFixed(1)} KB · {uploaded.format.toUpperCase()}
          </div>
        </div>
        <a
          href={uploaded.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-700 hover:underline font-medium shrink-0"
        >
          View
        </a>
        <button onClick={reset} className="text-emerald-500 hover:text-emerald-700 shrink-0">
          <X className="w-4 h-4" />
        </button>
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => status === 'idle' && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          dragging
            ? 'border-blue-400 bg-blue-50'
            : status === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40'
        }`}
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-slate-600">Uploading…</p>
            <div className="w-full max-w-xs h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className={`w-7 h-7 ${status === 'error' ? 'text-red-400' : 'text-slate-400'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Drag & drop or click · {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} · max {maxSizeMB} MB
              </p>
            </div>
          </>
        )}
      </div>

      {status === 'error' && error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
          <button onClick={reset} className="ml-auto text-red-500 hover:underline">Retry</button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onInputChange}
        className="hidden"
      />
    </div>
  )
}
