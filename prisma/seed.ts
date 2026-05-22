import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { USER_ROLES } from '../types/auth'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? (() => { throw new Error('SEED_PASSWORD env var is required') })()

async function main() {
  console.log('🌱 Seeding database...')
  const hash = await bcrypt.hash(SEED_PASSWORD, 12)

  let patientUserId = ''
  let doctorUserId = ''

  // ── Seed one test account per role ───────────────────────────────────────
  for (const role of USER_ROLES) {
    const email = `${role.replace('_', '.')}@test.swasthanepal.ai`
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: `Test ${role.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')}`,
        email,
        phone: '+977-9800000001',
        passwordHash: hash,
        role,
        isActive: true,
      },
    })
    console.log(`  ✓ ${role}: ${email}`)

    if (role === 'patient') patientUserId = user.id
    if (role === 'doctor') doctorUserId = user.id

    if (role === 'patient') {
      await prisma.patient.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          dateOfBirth: new Date('1992-04-15'),
          gender: 'male',
          bloodType: 'O_POS',
          address: 'Baneshwor, Ward No. 10',
          district: 'Kathmandu',
          province: 'Bagmati',
          citizenshipNumber: '01-01-92-00001',
          guardianName: 'Shanti Devi Thapa',
          guardianPhone: '+977-9812345678',
        },
      })
    }

    if (role === 'doctor') {
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          licenseNumber: 'NMC-2024-001',
          specialization: 'General Medicine',
          subspecialization: 'Internal Medicine',
          qualifications: ['MBBS', 'MD'],
          experienceYears: 8,
          consultationFee: 800,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableFrom: '09:00',
          availableTo: '17:00',
          bio: 'Specialist in general and internal medicine with 8 years of experience.',
          isVerified: true,
        },
      })
    }
  }

  // ── Enrich patient with clinical data ────────────────────────────────────
  const patient = await prisma.patient.findUnique({ where: { userId: patientUserId } })
  const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } })
  if (!patient || !doctor) {
    console.log('⚠️  Patient or doctor not found, skipping clinical seed')
    return
  }

  // Emergency info
  await prisma.emergencyInfo.upsert({
    where: { patientId: patient.id },
    update: {
      criticalConditions: ['Hypertension', 'Vitamin D Deficiency'],
      currentMedications: ['Amlodipine 5mg OD', 'Telmisartan 40mg OD', 'Cholecalciferol 60,000 IU Weekly'],
    },
    create: {
      patientId: patient.id,
      bloodType: 'O_POS',
      organDonor: false,
      criticalConditions: ['Hypertension', 'Vitamin D Deficiency'],
      currentMedications: ['Amlodipine 5mg OD', 'Telmisartan 40mg OD', 'Cholecalciferol 60,000 IU Weekly'],
      emergencyContacts: [
        { name: 'Shanti Devi Thapa', relationship: 'Mother', phone: '+977-9812345678', isPrimary: true },
        { name: 'Bikash Thapa', relationship: 'Brother', phone: '+977-9867890123', isPrimary: false },
      ],
      insuranceProvider: 'National Insurance Company',
      insurancePolicyNum: 'NIC-2024-00123',
      qrHash: patient.id,
    },
  })
  console.log('  ✓ Emergency info seeded')

  // Allergies
  const existingAllergies = await prisma.allergy.count({ where: { patientId: patient.id } })
  if (existingAllergies === 0) {
    await prisma.allergy.createMany({
      data: [
        {
          patientId: patient.id,
          recordedById: doctorUserId,
          allergenType: 'drug',
          allergenName: 'Penicillin',
          reaction: 'Anaphylaxis — severe breathing difficulty, hives',
          severity: 'life_threatening',
          onsetDate: new Date('2015-06-10'),
          isActive: true,
        },
        {
          patientId: patient.id,
          recordedById: doctorUserId,
          allergenType: 'food',
          allergenName: 'Shellfish',
          reaction: 'Urticaria, nausea, mild swelling',
          severity: 'moderate',
          onsetDate: new Date('2018-03-22'),
          isActive: true,
        },
        {
          patientId: patient.id,
          recordedById: doctorUserId,
          allergenType: 'environmental',
          allergenName: 'House Dust Mite',
          reaction: 'Rhinitis, sneezing, watery eyes',
          severity: 'mild',
          isActive: true,
        },
      ],
    })
    console.log('  ✓ Allergies seeded')
  }

  // Medical records
  const existingRecords = await prisma.medicalRecord.count({ where: { patientId: patient.id } })
  if (existingRecords === 0) {
    await prisma.medicalRecord.createMany({
      data: [
        {
          patientId: patient.id,
          doctorId: doctor.id,
          recordType: 'diagnosis',
          title: 'Annual Checkup — Hypertension Diagnosed',
          diagnosis: 'Essential Hypertension',
          icdCode: 'I10',
          symptoms: ['headache', 'mild dizziness', 'fatigue'],
          notes: 'BP consistently elevated over 3 visits. Starting antihypertensive therapy.',
          visitDate: new Date('2024-11-20'),
        },
        {
          patientId: patient.id,
          doctorId: doctor.id,
          recordType: 'visit_note',
          title: 'Hypertension Follow-up + Vitamin D Deficiency',
          diagnosis: 'Vitamin D Deficiency',
          icdCode: 'E55.9',
          symptoms: ['fatigue', 'muscle weakness', 'bone pain'],
          notes: 'Vitamin D level 12.5 ng/mL — severely deficient. Starting supplementation.',
          visitDate: new Date('2024-08-10'),
        },
        {
          patientId: patient.id,
          doctorId: doctor.id,
          recordType: 'procedure',
          title: 'ECG & Cardiac Baseline Assessment',
          diagnosis: 'Normal Sinus Rhythm',
          symptoms: [],
          notes: 'ECG normal. Cardiac function assessed as part of hypertension workup.',
          visitDate: new Date('2024-03-05'),
        },
      ],
    })
    console.log('  ✓ Medical records seeded')
  }

  // Prescriptions
  const existingRx = await prisma.prescription.count({ where: { patientId: patient.id } })
  if (existingRx === 0) {
    await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        status: 'active',
        prescribedAt: new Date('2024-11-20'),
        validUntil: new Date('2025-11-20'),
        pharmacyNotes: 'Take antihypertensives at same time each day. Monitor BP weekly.',
        items: {
          createMany: {
            data: [
              {
                medicineName: 'Amlodipine',
                genericName: 'Amlodipine Besylate',
                dosage: '5mg',
                frequency: 'Once daily (morning)',
                duration: '90 days',
                route: 'Oral',
                instructions: 'Take with or without food. Do not crush.',
                quantity: 90,
              },
              {
                medicineName: 'Telmisartan',
                genericName: 'Telmisartan',
                dosage: '40mg',
                frequency: 'Once daily (morning)',
                duration: '90 days',
                route: 'Oral',
                instructions: 'Take with a glass of water. Avoid potassium supplements.',
                quantity: 90,
              },
              {
                medicineName: 'Cholecalciferol',
                genericName: 'Vitamin D3',
                dosage: '60,000 IU',
                frequency: 'Once weekly',
                duration: '12 weeks',
                route: 'Oral',
                instructions: 'Take with a fatty meal for better absorption.',
                quantity: 12,
              },
            ],
          },
        },
      },
    })
    console.log('  ✓ Prescriptions seeded')
  }

  // Lab reports
  const existingLab = await prisma.labReport.count({ where: { patientId: patient.id } })
  if (existingLab === 0) {
    await prisma.labReport.createMany({
      data: [
        {
          patientId: patient.id,
          orderedById: doctor.id,
          processedById: doctorUserId,
          testName: 'Complete Blood Count',
          category: 'hematology',
          sampleType: 'Whole Blood',
          result: JSON.stringify([
            { parameter: 'Haemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5–17.5', isAbnormal: false },
            { parameter: 'WBC', value: '7.8', unit: '×10⁹/L', referenceRange: '4.5–11.0', isAbnormal: false },
            { parameter: 'Platelets', value: '210', unit: '×10⁹/L', referenceRange: '150–400', isAbnormal: false },
            { parameter: 'Haematocrit', value: '42', unit: '%', referenceRange: '41–53', isAbnormal: false },
          ]),
          isAbnormal: false,
          status: 'completed',
          completedAt: new Date('2024-11-20'),
          notes: 'All parameters within normal range.',
        },
        {
          patientId: patient.id,
          orderedById: doctor.id,
          processedById: doctorUserId,
          testName: 'Lipid Profile',
          category: 'biochemistry',
          sampleType: 'Serum (fasting)',
          result: JSON.stringify([
            { parameter: 'Total Cholesterol', value: '210', unit: 'mg/dL', referenceRange: '<200', isAbnormal: true },
            { parameter: 'LDL Cholesterol', value: '135', unit: 'mg/dL', referenceRange: '<130', isAbnormal: true },
            { parameter: 'HDL Cholesterol', value: '48', unit: 'mg/dL', referenceRange: '>40', isAbnormal: false },
            { parameter: 'Triglycerides', value: '142', unit: 'mg/dL', referenceRange: '<150', isAbnormal: false },
          ]),
          isAbnormal: true,
          status: 'completed',
          completedAt: new Date('2024-11-20'),
          notes: 'Total cholesterol and LDL mildly elevated. Consider dietary changes.',
        },
        {
          patientId: patient.id,
          orderedById: doctor.id,
          processedById: doctorUserId,
          testName: 'Vitamin D (25-OH)',
          category: 'biochemistry',
          sampleType: 'Serum',
          result: JSON.stringify([
            { parameter: 'Vitamin D (25-OH)', value: '12.5', unit: 'ng/mL', referenceRange: '30–100', isAbnormal: true },
          ]),
          isAbnormal: true,
          status: 'completed',
          completedAt: new Date('2024-11-20'),
          notes: 'Severely deficient. Supplementation initiated.',
        },
      ],
    })
    console.log('  ✓ Lab reports seeded')
  }

  // Vaccinations
  const existingVacc = await prisma.vaccination.count({ where: { patientId: patient.id } })
  if (existingVacc === 0) {
    await prisma.vaccination.createMany({
      data: [
        {
          patientId: patient.id,
          administeredById: doctorUserId,
          vaccineName: 'COVID-19',
          vaccineBrand: 'COVAXIN (BBV152)',
          lotNumber: 'CV-2021-LT-001',
          doseNumber: 2,
          totalDoses: 2,
          administeredAt: new Date('2021-07-15'),
          site: 'Left deltoid',
          route: 'Intramuscular',
          facility: 'Patan Hospital, Lalitpur',
          notes: 'Second dose. No adverse reactions.',
        },
        {
          patientId: patient.id,
          administeredById: doctorUserId,
          vaccineName: 'Hepatitis B',
          vaccineBrand: 'Engerix-B',
          lotNumber: 'HB-2022-LT-045',
          doseNumber: 3,
          totalDoses: 3,
          administeredAt: new Date('2022-02-10'),
          site: 'Right deltoid',
          route: 'Intramuscular',
          facility: 'Grande International Hospital, Kathmandu',
        },
        {
          patientId: patient.id,
          administeredById: doctorUserId,
          vaccineName: 'Typhoid',
          vaccineBrand: 'Typherix',
          lotNumber: 'TY-2023-LT-012',
          doseNumber: 1,
          totalDoses: 1,
          administeredAt: new Date('2023-05-20'),
          nextDoseDue: new Date('2026-05-20'),
          site: 'Left deltoid',
          route: 'Intramuscular',
          facility: 'OM Hospital, Kathmandu',
          notes: 'Booster due in 3 years.',
        },
      ],
    })
    console.log('  ✓ Vaccinations seeded')
  }

  // Upcoming appointment
  const existingApt = await prisma.appointment.count({ where: { patientId: patient.id } })
  if (existingApt === 0) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)
    futureDate.setHours(10, 30, 0, 0)

    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        status: 'confirmed',
        type: 'in_person',
        reason: 'Blood pressure follow-up + lipid profile review',
        scheduledAt: futureDate,
        durationMinutes: 30,
        location: 'Grande International Hospital, OPD Room 12',
      },
    })
    console.log('  ✓ Appointment seeded')
  }

  console.log(`\n✅ Seed complete. Login password for all accounts: ${SEED_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
