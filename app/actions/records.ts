'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  const d = result.data
  const certNumber = `BC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  let dob: Date
  try {
    dob = d.timeOfBirth
      ? new Date(`${d.dateOfBirth}T${d.timeOfBirth}`)
      : new Date(d.dateOfBirth)
  } catch {
    return { success: false, error: 'Invalid date of birth' }
  }

  await prisma.birthRecord.create({
    data: {
      registeredById: session.sub,
      birthCertificateNumber: certNumber,
      childName: d.childName,
      dateOfBirth: dob,
      placeOfBirth: d.birthPlace,
      gender: d.gender,
      weightKg: d.birthWeight ? parseFloat(d.birthWeight) : null,
      deliveryType: d.deliveryType,
      fatherName: d.fatherName,
      motherName: d.motherName,
      notes: d.notes ?? null,
      isRegistered: true,
      registrationDate: new Date(),
    },
  })

  return {
    success: true,
    data: {
      childName: d.childName,
      dateOfBirth: d.dateOfBirth,
      gender: d.gender,
      birthPlace: d.birthPlace,
      motherName: d.motherName,
      fatherName: d.fatherName,
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

  const d = result.data
  const certNumber = `DC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`

  let dod: Date
  try {
    dod = d.timeOfDeath
      ? new Date(`${d.dateOfDeath}T${d.timeOfDeath}`)
      : new Date(d.dateOfDeath)
  } catch {
    return { success: false, error: 'Invalid date of death' }
  }

  const mannerMap: Record<string, 'natural' | 'accident' | 'suicide' | 'homicide' | 'undetermined'> = {
    natural: 'natural',
    accident: 'accident',
    homicide: 'homicide',
    suicide: 'suicide',
    unknown: 'undetermined',
  }

  await prisma.deathRecord.create({
    data: {
      registeredById: session.sub,
      deathCertificateNumber: certNumber,
      deceasedName: d.deceasedName,
      dateOfDeath: dod,
      placeOfDeath: d.placeOfDeath,
      primaryCause: d.causeOfDeath,
      secondaryCauses: [],
      mannerOfDeath: mannerMap[d.mannerOfDeath],
      ageAtDeath: parseInt(d.age, 10) || null,
      gender: d.gender,
      attendingDoctor: d.attendingDoctor ?? null,
      notes: d.notes ?? null,
      isRegistered: true,
      registrationDate: new Date(),
    },
  })

  return {
    success: true,
    data: {
      deceasedName: d.deceasedName,
      dateOfDeath: d.dateOfDeath,
      causeOfDeath: d.causeOfDeath,
      placeOfDeath: d.placeOfDeath,
      certNumber,
      issuedDate: new Date().toISOString().slice(0, 10),
    },
  }
}
