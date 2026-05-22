'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'

export type RecordActionState =
  | { success: true; data: Record<string, string> }
  | { success: false; error: string }
  | undefined

const BirthSchema = z.object({
  childName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  timeOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  birthWeight: z.string().optional(),
  birthPlace: z.string().min(1),
  motherName: z.string().min(1),
  fatherName: z.string().min(1),
  address: z.string().min(1),
  deliveryType: z.enum(['normal', 'cesarean', 'assisted']),
  notes: z.string().optional(),
})

const DeathSchema = z.object({
  deceasedName: z.string().min(1),
  dateOfDeath: z.string().min(1),
  timeOfDeath: z.string().optional(),
  age: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(1),
  causeOfDeath: z.string().min(1),
  mannerOfDeath: z.enum(['natural', 'accident', 'homicide', 'suicide', 'unknown']),
  placeOfDeath: z.string().min(1),
  attendingDoctor: z.string().optional(),
  notes: z.string().optional(),
})

export async function registerBirth(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const session = await getSession()
  if (!session || session.role !== 'doctor') {
    return { success: false, error: 'Unauthorized — doctor access required' }
  }

  const result = BirthSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' }
  }

  // TODO: insert into Birth table in database
  const certNumber = `BC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  return {
    success: true,
    data: {
      ...result.data,
      certNumber,
      issuedDate: new Date().toISOString().slice(0, 10),
    },
  }
}

export async function registerDeath(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const session = await getSession()
  if (!session || session.role !== 'doctor') {
    return { success: false, error: 'Unauthorized — doctor access required' }
  }

  const result = DeathSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? 'Validation failed' }
  }

  // TODO: insert into Death table in database
  const certNumber = `DC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  return {
    success: true,
    data: {
      ...result.data,
      certNumber,
      issuedDate: new Date().toISOString().slice(0, 10),
    },
  }
}
