/**
 * @jest-environment node
 */
// Doctor module: diagnosis, prescription, role enforcement

import { signToken } from '@/lib/auth'

const TEST_SECRET = 'test-secret-doctor-tests-at-least-32-chars!!!'

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue(undefined),
    set: jest.fn(),
  }),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    doctor: { findUnique: jest.fn().mockResolvedValue({ id: 'd1' }) },
    medicalRecord: { create: jest.fn().mockResolvedValue({ id: 'mr1' }) },
    prescription: { create: jest.fn().mockResolvedValue({ id: 'rx1' }) },
    prescriptionItem: { create: jest.fn().mockResolvedValue({ id: 'pi1' }) },
    labReport: { create: jest.fn().mockResolvedValue({ id: 'lr1' }) },
    auditLog: { create: jest.fn() },
  },
}))

jest.mock('@/lib/audit', () => ({ writeAuditLog: jest.fn() }))

import { addDiagnosis } from '@/app/actions/doctor'

beforeAll(() => { process.env.JWT_SECRET = TEST_SECRET })
afterAll(() => { delete process.env.JWT_SECRET })

async function mockCookieWithRole(role: string) {
  const { cookies } = await import('next/headers')
  const token = await signToken({ sub: 'u1', email: 'd@d.com', name: 'Dr', role: role as any })
  ;(cookies as jest.Mock).mockResolvedValue({ get: jest.fn().mockReturnValue({ value: token }), set: jest.fn() })
}

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => fd.append(k, v))
  return fd
}

describe('addDiagnosis server action', () => {
  it('returns Unauthorized for non-doctor role', async () => {
    await mockCookieWithRole('patient')
    const result = await addDiagnosis(undefined, makeFormData({ patientId: 'p1', recordType: 'diagnosis', title: 'Test', diagnosis: 'Test diagnosis' }))
    expect(result?.message).toBe('Unauthorized')
  })

  it('returns validation errors for missing required fields', async () => {
    await mockCookieWithRole('doctor')
    const result = await addDiagnosis(undefined, makeFormData({ patientId: '', recordType: 'diagnosis', title: '', diagnosis: '' }))
    expect(result?.errors).toBeDefined()
  })

  it('creates a medical record for valid doctor input', async () => {
    await mockCookieWithRole('doctor')
    const result = await addDiagnosis(undefined, makeFormData({
      patientId: 'p1',
      recordType: 'diagnosis',
      title: 'Hypertension Assessment',
      diagnosis: 'Stage 2 Hypertension',
      icdCode: 'I10',
      symptoms: 'Headache, dizziness',
      notes: 'Monitor BP daily',
    }))
    expect(result?.success).toBe(true)
  })
})

describe('Doctor role enforcement', () => {
  it('nurse cannot add diagnosis', async () => {
    await mockCookieWithRole('nurse')
    const result = await addDiagnosis(undefined, makeFormData({ patientId: 'p1', recordType: 'diagnosis', title: 'Test', diagnosis: 'Test' }))
    expect(result?.message).toBe('Unauthorized')
  })

  it('pharmacist cannot add diagnosis', async () => {
    await mockCookieWithRole('pharmacist')
    const result = await addDiagnosis(undefined, makeFormData({ patientId: 'p1', recordType: 'diagnosis', title: 'Test', diagnosis: 'Test' }))
    expect(result?.message).toBe('Unauthorized')
  })
})
