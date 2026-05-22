import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { uploadFile, type UploadFolder } from '@/lib/storage'
import { writeAuditLog } from '@/lib/audit'

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'image/dicom', 'application/dicom',
])
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

const FOLDER_BY_TYPE: Record<string, UploadFolder> = {
  lab_report:   'lab-reports',
  scan:         'scans',
  prescription: 'prescriptions',
  document:     'documents',
}

export async function POST(request: NextRequest) {
  // Auth
  const token = request.cookies.get('auth-token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let userId: string
  let userEmail: string
  let userRole: string
  try {
    const session = await verifyToken(token)
    userId = session.sub
    userEmail = session.email
    userRole = session.role
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse multipart form
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const fileType = (formData.get('type') as string) ?? 'document'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: `File type ${file.type} not allowed` }, { status: 415 })
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File exceeds 20 MB limit' }, { status: 413 })
  }

  const folder: UploadFolder = FOLDER_BY_TYPE[fileType] ?? 'documents'

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, folder, file.name)

    writeAuditLog({
      userId,
      userEmail,
      userRole,
      action: fileType === 'lab_report' ? 'lab.upload' : 'patient.update',
      resourceId: result.publicId,
      details: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      success: true,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
