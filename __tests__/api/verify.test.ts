/**
 * @jest-environment node
 *
 * Identity verification actions — submitVerification, adminVerifyPatient
 */

import { submitVerification, adminVerifyPatient } from '@/app/actions/verify'

const mockPatientFindUnique = jest.fn()
const mockPatientUpdate = jest.fn()
const mockGetSession = jest.fn()

jest.mock('@/lib/auth', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
  signToken: jest.fn(),
  verifyToken: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    patient: {
      findUnique: (...args: unknown[]) => mockPatientFindUnique(...args),
      update: (...args: unknown[]) => mockPatientUpdate(...args),
    },
  },
}))

jest.mock('@/lib/audit', () => ({ writeAuditLog: jest.fn() }))

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(), set: jest.fn() }),
}))

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  Object.entries(fields).forEach(([k, v]) => fd.set(k, v))
  return fd
}

// ── submitVerification ────────────────────────────────────────────────────────
describe('submitVerification', () => {
  beforeEach(() => {
    mockPatientFindUnique.mockResolvedValue({ id: 'p1', verificationStatus: 'unverified' })
    mockPatientUpdate.mockResolvedValue({})
  })
  afterEach(() => jest.clearAllMocks())

  it('returns error when not logged in', async () => {
    mockGetSession.mockResolvedValue(null)
    const result = await submitVerification(undefined, formData({ documentType: 'citizenship', documentNumber: '01-01-80-00001', documentUrl: 'https://cdn/doc.jpg' }))
    expect(result?.success).toBe(false)
  })

  it('returns error when non-patient calls it (doctor)', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'dr@b.com', name: 'Dr', role: 'doctor' })
    const result = await submitVerification(undefined, formData({ documentType: 'citizenship', documentNumber: '01-01-80-00001', documentUrl: 'https://cdn/doc.jpg' }))
    expect(result?.success).toBe(false)
  })

  it('rejects invalid document type', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    const result = await submitVerification(undefined, formData({ documentType: 'passport', documentNumber: 'AB123', documentUrl: 'https://cdn/doc.jpg' }))
    expect(result?.success).toBe(false)
    expect(result && 'errors' in result && result.errors?.documentType).toBeDefined()
  })

  it('rejects document number shorter than 3 chars', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    const result = await submitVerification(undefined, formData({ documentType: 'citizenship', documentNumber: 'AB', documentUrl: 'https://cdn/doc.jpg' }))
    expect(result?.success).toBe(false)
  })

  it('rejects when no document URL provided', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    const result = await submitVerification(undefined, formData({ documentType: 'citizenship', documentNumber: '01-01-80-00001', documentUrl: '' }))
    expect(result?.success).toBe(false)
  })

  it('succeeds with valid patient submission', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    const result = await submitVerification(undefined, formData({ documentType: 'citizenship', documentNumber: '01-01-80-00001', documentUrl: 'https://cdn/doc.jpg' }))
    expect(result?.success).toBe(true)
    expect(mockPatientUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ verificationStatus: 'pending' }),
    }))
  })

  it('returns already-verified message without updating', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    mockPatientFindUnique.mockResolvedValue({ id: 'p1', verificationStatus: 'verified' })
    const result = await submitVerification(undefined, formData({ documentType: 'citizenship', documentNumber: '01-01-80-00001', documentUrl: 'https://cdn/doc.jpg' }))
    expect(result?.success).toBe(true)
    expect(result && 'status' in result && result.status).toBe('verified')
    expect(mockPatientUpdate).not.toHaveBeenCalled()
  })
})

// ── adminVerifyPatient ────────────────────────────────────────────────────────
describe('adminVerifyPatient', () => {
  beforeEach(() => {
    mockPatientFindUnique.mockResolvedValue({
      id: 'p1',
      verificationDocNumber: '01-01-80-00001',
      verificationDocType: 'citizenship',
      citizenshipNumber: null,
    })
    mockPatientUpdate.mockResolvedValue({})
  })
  afterEach(() => jest.clearAllMocks())

  it('returns error when not logged in', async () => {
    mockGetSession.mockResolvedValue(null)
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'p1', action: 'approve' }))
    expect(result?.success).toBe(false)
  })

  it('returns error when patient tries to approve (IDOR check)', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'p@b.com', name: 'P', role: 'patient' })
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'p1', action: 'approve' }))
    expect(result?.success).toBe(false)
  })

  it('returns error when doctor tries to approve', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'd@b.com', name: 'D', role: 'doctor' })
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'p1', action: 'approve' }))
    expect(result?.success).toBe(false)
  })

  it('rejects invalid action value', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'hospital_admin' })
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'p1', action: 'delete' }))
    expect(result?.success).toBe(false)
  })

  it('hospital_admin can approve patient verification', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'hospital_admin' })
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'p1', action: 'approve' }))
    expect(result?.success).toBe(true)
    expect(mockPatientUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ verificationStatus: 'verified' }),
    }))
  })

  it('government_admin can reject patient verification', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'g@b.com', name: 'G', role: 'government_admin' })
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'p1', action: 'reject', note: 'Blurry image' }))
    expect(result?.success).toBe(true)
    expect(mockPatientUpdate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ verificationStatus: 'rejected' }),
    }))
  })

  it('returns error when patient ID does not exist', async () => {
    mockGetSession.mockResolvedValue({ sub: 'u1', email: 'a@b.com', name: 'A', role: 'hospital_admin' })
    mockPatientFindUnique.mockResolvedValue(null)
    const result = await adminVerifyPatient(undefined, formData({ patientId: 'nonexistent', action: 'approve' }))
    expect(result?.success).toBe(false)
  })
})
