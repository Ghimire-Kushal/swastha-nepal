/**
 * @jest-environment node
 *
 * Service layer unit tests — doctor, patient, pharmacy, lab services
 * All DB calls are mocked; tests verify business logic and data transformation.
 */

// Define mock fns at module scope so tests can control them via mockResolvedValue
const mockDoctorFindUnique      = jest.fn()
const mockPatientFindMany       = jest.fn()
const mockPatientFindUnique     = jest.fn()
const mockAppointmentFindMany   = jest.fn()
const mockPrescriptionFindMany  = jest.fn()
const mockPrescriptionFindUnique= jest.fn()
const mockLabReportFindMany     = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    doctor:       { findUnique: (...a: unknown[]) => mockDoctorFindUnique(...a) },
    patient:      { findMany:   (...a: unknown[]) => mockPatientFindMany(...a),
                    findUnique: (...a: unknown[]) => mockPatientFindUnique(...a) },
    appointment:  { findMany:   (...a: unknown[]) => mockAppointmentFindMany(...a) },
    prescription: { findMany:   (...a: unknown[]) => mockPrescriptionFindMany(...a),
                    findUnique: (...a: unknown[]) => mockPrescriptionFindUnique(...a) },
    labReport:    { findMany:   (...a: unknown[]) => mockLabReportFindMany(...a) },
  },
}))
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(), set: jest.fn() }),
}))

import { searchPatients } from '@/services/doctor'
import { getPatientProfile } from '@/services/patient'
import { getAllPrescriptions } from '@/services/pharmacy'
import { getAllLabReports } from '@/services/lab'

afterEach(() => jest.clearAllMocks())

// ── Doctor service — searchPatients ──────────────────────────────────────────
describe('searchPatients', () => {
  it('returns mapped patient list with defaults for null fields', async () => {
    mockPatientFindMany.mockResolvedValue([{
      id: 'p1',
      citizenshipNumber: null,
      dateOfBirth: null,
      gender: null,
      bloodType: null,
      district: null,
      province: null,
      address: null,
      user: { name: 'Aarav Sharma', phone: null },
      appointments: [],
      emergencyInfo: null,
    }])

    const result = await searchPatients('u1', 'Aarav')
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Aarav Sharma')
    expect(result[0].citizenshipNumber).toBe('')
    expect(result[0].dateOfBirth).toBe('')
    expect(result[0].gender).toBe('male')        // default
    expect(result[0].bloodType).toBe('O_POS')    // default
    expect(result[0].conditions).toEqual([])
  })

  it('returns empty array for no matches', async () => {
    mockPatientFindMany.mockResolvedValue([])
    const result = await searchPatients('u1', 'Nonexistent')
    expect(result).toEqual([])
  })

  it('formats dateOfBirth as YYYY-MM-DD', async () => {
    mockPatientFindMany.mockResolvedValue([{
      id: 'p1',
      citizenshipNumber: '01-01-85-01000',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'female',
      bloodType: 'B_POS',
      district: 'Kathmandu',
      province: 'Bagmati',
      address: 'Baneshwor',
      user: { name: 'Sita Thapa', phone: '+977-9841234567' },
      appointments: [{ scheduledAt: new Date('2026-01-10') }],
      emergencyInfo: { criticalConditions: ['Hypertension'] },
    }])

    const result = await searchPatients('u1', 'Sita')
    expect(result[0].dateOfBirth).toBe('1985-06-15')
    expect(result[0].lastVisit).toBe('2026-01-10')
    expect(result[0].conditions).toEqual(['Hypertension'])
  })
})

// ── Patient service ───────────────────────────────────────────────────────────
describe('getPatientProfile', () => {
  it('returns null when patient does not exist', async () => {
    mockPatientFindUnique.mockResolvedValue(null)
    const result = await getPatientProfile('no-such-user')
    expect(result).toBeNull()
  })

  it('returns profile with correct shape', async () => {
    mockPatientFindUnique.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      dateOfBirth: new Date('1990-03-20'),
      gender: 'male',
      bloodType: 'O_POS',
      district: 'Lalitpur',
      province: 'Bagmati',
      address: 'Patan',
      citizenshipNumber: '03-06-90-01234',
      verificationStatus: 'verified',
      guardianName: null,
      guardianPhone: null,
      profilePhotoUrl: null,
      user: { name: 'Ramesh Basnet', email: 'r@b.com', phone: '+977-9812345678' },
    })

    const result = await getPatientProfile('u1')
    expect(result).not.toBeNull()
    expect(result?.name).toBe('Ramesh Basnet')
    expect(result?.citizenshipNumber).toBe('03-06-90-01234')
    expect(result?.verificationStatus).toBe('verified')
  })

  it('uses defaults for null optional fields', async () => {
    mockPatientFindUnique.mockResolvedValue({
      id: 'p1', userId: 'u1',
      dateOfBirth: null, gender: null, bloodType: null,
      district: null, province: null, address: null,
      citizenshipNumber: null, guardianName: null, guardianPhone: null, profilePhotoUrl: null,
      verificationStatus: 'unverified',
      user: { name: 'No Data', email: 'n@b.com', phone: null },
    })

    const result = await getPatientProfile('u1')
    expect(result?.gender).toBe('male')
    expect(result?.bloodType).toBe('O_POS')
    expect(result?.citizenshipNumber).toBe('')
    expect(result?.phone).toBe('')
  })
})

// ── Pharmacy service ──────────────────────────────────────────────────────────
describe('getAllPrescriptions', () => {
  it('returns empty array when no prescriptions exist', async () => {
    mockPrescriptionFindMany.mockResolvedValue([])
    const result = await getAllPrescriptions('u1')
    expect(result).toEqual([])
  })

  it('maps prescription fields correctly', async () => {
    mockPrescriptionFindMany.mockResolvedValue([{
      id: 'rx1',
      status: 'active',
      prescribedAt: new Date('2026-05-01'),
      dispensedAt: null,
      pharmacyNotes: 'Take with food',
      patient: {
        id: 'p1',
        dateOfBirth: null,
        user: { name: 'Patient One', phone: null },
      },
      doctor: { user: { name: 'Dr. Smith' }, licenseNumber: 'NMC-001' },
      items: [{ medicineName: 'Amlodipine', dosage: '5mg', frequency: 'OD', duration: '90 days', quantity: 90 }],
    }])

    const result = await getAllPrescriptions('u1')
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('active')
    expect(result[0].patientName).toBe('Patient One')
    expect(result[0].doctorName).toBe('Dr. Smith')
    expect(result[0].items).toHaveLength(1)
    expect(result[0].items[0].medicine).toBe('Amlodipine')
  })
})

// ── Lab service ───────────────────────────────────────────────────────────────
describe('getAllLabReports', () => {
  it('returns empty array when no lab reports', async () => {
    mockLabReportFindMany.mockResolvedValue([])
    const result = await getAllLabReports('u1')
    expect(result).toEqual([])
  })

  it('includes abnormal flag in returned reports', async () => {
    mockLabReportFindMany.mockResolvedValue([{
      id: 'lr1',
      patientId: 'p1',
      testName: 'CBC',
      category: 'hematology',
      status: 'completed',
      isAbnormal: true,
      orderedById: 'd1',
      createdAt: new Date('2026-03-01'),
      completedAt: new Date('2026-03-01'),
      reportUrl: null,
      patient: { user: { name: 'Test Patient' } },
      orderedBy: { user: { name: 'Dr. Singh' } },
      processedBy: { name: 'Lab Tech' },
    }])

    const result = await getAllLabReports('u1')
    expect(result[0].hasAbnormal).toBe(true)   // service maps isAbnormal → hasAbnormal
    expect(result[0].testName).toBe('CBC')
    expect(result[0].patientName).toBe('Test Patient')
  })
})
