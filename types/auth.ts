export const USER_ROLES = [
  'patient',
  'doctor',
  'nurse',
  'lab_technician',
  'pharmacist',
  'hospital_admin',
  'government_admin',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  nurse: 'Nurse',
  lab_technician: 'Lab Technician',
  pharmacist: 'Pharmacist',
  hospital_admin: 'Hospital Admin',
  government_admin: 'Government Admin',
}

export const ROLE_META: Record<UserRole, { icon: string; description: string }> = {
  patient: { icon: '🏥', description: 'Access health records and consultations' },
  doctor: { icon: '👨‍⚕️', description: 'Provide medical consultations' },
  nurse: { icon: '👩‍⚕️', description: 'Assist in patient care' },
  lab_technician: { icon: '🔬', description: 'Manage laboratory reports' },
  pharmacist: { icon: '💊', description: 'Manage digital prescriptions' },
  hospital_admin: { icon: '🏨', description: 'Manage hospital operations' },
  government_admin: { icon: '🏛️', description: 'Oversee national health data' },
}

export interface SessionPayload {
  sub: string
  email: string
  name: string
  role: UserRole
  iat?: number
  exp?: number
}

export type AuthFormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        phone?: string[]
        role?: string[]
        password?: string[]
        confirmPassword?: string[]
      }
      message?: string
    }
  | undefined
