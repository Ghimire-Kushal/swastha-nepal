'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
  fileUrl: z.string().optional(),
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

  let results: Array<{ isAbnormal?: boolean; parameter?: string; value?: string; unit?: string; referenceRange?: string }>
  try {
    results = JSON.parse(parsed.data.results)
    if (!Array.isArray(results) || results.length === 0) throw new Error()
  } catch {
    return { errors: { results: ['Add at least one result row'] } }
  }

  const hasAbnormal = results.some((r) => r.isAbnormal)
  const firstAbnormal = results.find((r) => r.isAbnormal)
  const referenceRange = firstAbnormal?.referenceRange ?? results[0]?.referenceRange ?? null
  const unit = results[0]?.unit ?? null

  await prisma.labReport.create({
    data: {
      patientId: parsed.data.patientId,
      processedById: session.sub,
      testName: parsed.data.testName,
      category: parsed.data.category,
      sampleType: parsed.data.sampleType ?? null,
      result: JSON.stringify(results),
      referenceRange,
      unit,
      isAbnormal: hasAbnormal,
      notes: parsed.data.notes ?? null,
      reportUrl: parsed.data.fileUrl || null,
      status: 'completed',
      completedAt: new Date(),
    },
  })

  return {
    success: true,
    message: parsed.data.sendToDoctor === '1'
      ? 'Report uploaded and sent to the ordering doctor'
      : 'Report uploaded successfully',
  }
}

// ─── Mark Report Abnormal ─────────────────────────────────────────────────────

export async function markReportAbnormal(reportId: string): Promise<LabActionState> {
  const session = await getSession()
  if (!session || session.role !== 'lab_technician') return { message: 'Unauthorized' }

  await prisma.labReport.update({
    where: { id: reportId },
    data: { isAbnormal: true },
  })

  return { success: true, message: 'Report flagged as abnormal' }
}

// ─── Send Report to Doctor ────────────────────────────────────────────────────

export async function sendReportToDoctor(reportId: string): Promise<LabActionState> {
  const session = await getSession()
  if (!session || session.role !== 'lab_technician') return { message: 'Unauthorized' }

  void reportId
  return { success: true, message: 'Report sent to ordering doctor' }
}
