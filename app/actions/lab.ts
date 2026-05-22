'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'

export type LabActionState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined

// ─── Upload Lab Report ────────────────────────────────────────────────────────

const LabUploadSchema = z.object({
  patientId: z.string().min(1, { error: 'Patient is required' }),
  testName: z.string().min(2, { error: 'Test name is required' }),
  category: z.enum(
    ['hematology', 'biochemistry', 'microbiology', 'imaging', 'pathology', 'other'],
    { error: 'Select a category' }
  ),
  sampleType: z.string().optional(),
  results: z.string().min(2, { error: 'Add at least one result row' }),
  notes: z.string().optional(),
  sendToDoctor: z.string().optional(),
  orderId: z.string().optional(),
})

export async function uploadLabReport(
  _prevState: LabActionState,
  formData: FormData
): Promise<LabActionState> {
  const session = await getSession()
  if (!session || session.role !== 'lab_technician') return { message: 'Unauthorized' }

  const parsed = LabUploadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let results: unknown[]
  try {
    results = JSON.parse(parsed.data.results)
    if (!Array.isArray(results) || results.length === 0) throw new Error()
  } catch {
    return { errors: { results: ['Add at least one result row'] } }
  }

  const hasAbnormal = (results as Array<{ isAbnormal?: boolean }>).some((r) => r.isAbnormal)
  const file = formData.get('file') as File | null

  // TODO: if file, upload to storage and get fileUrl
  // TODO: prisma.labReport.create({
  //   data: {
  //     patientId: parsed.data.patientId,
  //     processedById: session.sub,
  //     testName: parsed.data.testName,
  //     category: parsed.data.category,
  //     sampleType: parsed.data.sampleType ?? null,
  //     result: JSON.stringify(results),
  //     isAbnormal: hasAbnormal,
  //     notes: parsed.data.notes ?? null,
  //     reportUrl: fileUrl ?? null,
  //     status: 'completed',
  //     completedAt: new Date(),
  //   }
  // })
  // TODO: if sendToDoctor, create notification record
  void hasAbnormal
  void file

  return {
    success: true,
    message: parsed.data.sendToDoctor
      ? `Report uploaded and sent to the ordering doctor`
      : 'Report uploaded successfully',
  }
}

// ─── Mark Report Abnormal ─────────────────────────────────────────────────────

export async function markReportAbnormal(reportId: string): Promise<LabActionState> {
  const session = await getSession()
  if (!session || session.role !== 'lab_technician') return { message: 'Unauthorized' }

  // TODO: prisma.labReport.update({ where: { id: reportId }, data: { isAbnormal: true } })
  void reportId

  return { success: true, message: 'Report flagged as abnormal' }
}

// ─── Send Report to Doctor ────────────────────────────────────────────────────

export async function sendReportToDoctor(reportId: string): Promise<LabActionState> {
  const session = await getSession()
  if (!session || session.role !== 'lab_technician') return { message: 'Unauthorized' }

  // TODO: create notification, update a sentToDoctor flag on the report
  void reportId

  return { success: true, message: 'Report sent to ordering doctor' }
}
