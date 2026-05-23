import { prisma } from '@/lib/prisma'

export async function getPharmacistProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true },
  })
  if (!user) return null
  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    pharmacyName: '',
    licenseNumber: '',
    address: '',
  }
}

export async function getPharmacyStats(_userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pending, dispensedToday, totalDispensed, expired] = await Promise.all([
    prisma.prescription.count({ where: { status: 'active' } }),
    prisma.prescription.count({
      where: { status: 'dispensed', dispensedAt: { gte: today } },
    }),
    prisma.prescription.count({ where: { status: 'dispensed' } }),
    prisma.prescription.count({ where: { status: 'expired' } }),
  ])

  return { pending, dispensedToday, totalDispensed, expired }
}

export async function getAllPrescriptions(_userId: string) {
  const rows = await prisma.prescription.findMany({
    orderBy: { prescribedAt: 'desc' },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      items: true,
    },
  })

  return rows.map((p) => ({
    id: p.id,
    prescriptionDate: p.prescribedAt.toISOString().slice(0, 10),
    patientName: p.patient.user.name,
    patientDob: p.patient.dateOfBirth?.toISOString().slice(0, 10) ?? '',
    patientPhone: p.patient.user.phone ?? '',
    doctorName: p.doctor.user.name,
    doctorLicense: p.doctor.licenseNumber,
    hospital: '',
    items: p.items.map((i) => ({
      medicine: i.medicineName,
      dose: i.dosage,
      frequency: i.frequency,
      duration: i.duration ?? '',
      quantity: i.quantity ? String(i.quantity) : '',
    })),
    notes: p.pharmacyNotes ?? '',
    status: p.status as 'active' | 'dispensed' | 'expired' | 'cancelled',
    dispensedAt: p.dispensedAt?.toISOString().slice(0, 10),
  }))
}

export async function getPrescriptionById(_userId: string, id: string) {
  const p = await prisma.prescription.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
      items: true,
    },
  })
  if (!p) throw new Error('Prescription not found')

  return {
    id: p.id,
    prescriptionDate: p.prescribedAt.toISOString().slice(0, 10),
    patientName: p.patient.user.name,
    patientDob: p.patient.dateOfBirth?.toISOString().slice(0, 10) ?? '',
    patientPhone: p.patient.user.phone ?? '',
    doctorName: p.doctor.user.name,
    doctorLicense: p.doctor.licenseNumber,
    hospital: '',
    items: p.items.map((i) => ({
      medicine: i.medicineName,
      dose: i.dosage,
      frequency: i.frequency,
      duration: i.duration ?? '',
      quantity: i.quantity ? String(i.quantity) : '',
    })),
    notes: p.pharmacyNotes ?? '',
    status: p.status as 'active' | 'dispensed' | 'expired' | 'cancelled',
    dispensedAt: p.dispensedAt?.toISOString().slice(0, 10),
  }
}
