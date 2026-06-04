/**
 * Demo seed: 10 entries per module for Swastha Nepal AI
 * Run: npx tsx db/seed-demo.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Use DIRECT_URL for seeding (bypasses pgBouncer/Neon pooler)
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString: url })
const prisma = new PrismaClient({ adapter })

const PASS = 'Demo@1234'
const SALT = 12

const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Butwal', 'Dharan', 'Biratnagar', 'Birgunj', 'Janakpur']
const provinces = ['Bagmati', 'Gandaki', 'Lumbini', 'Koshi', 'Madhesh', 'Sudurpashchim', 'Karnali']
const bloodTypes = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG'] as const
const genders = ['male', 'female'] as const
const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry', 'Ophthalmology', 'ENT', 'General Medicine']
const hospitals = ['Bir Hospital', 'Patan Hospital', 'TU Teaching Hospital', 'KIST Medical College', 'Nepal Mediciti', 'Grande Hospital', 'B&B Hospital', 'Star Hospital', 'Norvic Hospital', 'Om Hospital']
const diagnosisList = ['Hypertension', 'Diabetes Type 2', 'Acute Bronchitis', 'Dengue Fever', 'Typhoid', 'Anemia', 'Gastritis', 'Urinary Tract Infection', 'Pneumonia', 'Migraine']
const icdCodes = ['I10', 'E11', 'J20', 'A90', 'A01', 'D64', 'K29', 'N39', 'J18', 'G43']
const vaccines = ['COVID-19 (Covishield)', 'Hepatitis B', 'Typhoid Vi', 'MMR', 'Polio OPV', 'BCG', 'DPT', 'Rabies', 'Influenza', 'Meningococcal']
const medicineNames = ['Amlodipine', 'Metformin', 'Amoxicillin', 'Paracetamol', 'Ciprofloxacin', 'Ferrous Sulfate', 'Omeprazole', 'Nitrofurantoin', 'Azithromycin', 'Sumatriptan']
const labTests = ['Complete Blood Count', 'Blood Glucose (Fasting)', 'Liver Function Test', 'Dengue NS1 Antigen', 'Widal Test', 'Serum Ferritin', 'H. Pylori Antigen', 'Urine Culture', 'Chest X-Ray', 'MRI Brain']
const labCategories = ['hematology', 'biochemistry', 'biochemistry', 'microbiology', 'microbiology', 'biochemistry', 'microbiology', 'microbiology', 'imaging', 'imaging']

async function seedUsers() {
  console.log('\n🌱 Seeding users...')
  const hash = await bcrypt.hash(PASS, SALT)

  for (let i = 1; i <= 10; i++) {
    // Doctor
    const dEmail = `doctor${i}@demo.swastha.np`
    if (!await prisma.user.findUnique({ where: { email: dEmail } })) {
      const u = await prisma.user.create({
        data: { name: `Dr. Demo${i} Sharma`, email: dEmail, phone: `980000${String(i).padStart(4, '0')}`, passwordHash: hash, role: 'doctor', isActive: true, emailVerifiedAt: new Date() },
      })
      await prisma.doctor.create({
        data: {
          userId: u.id,
          licenseNumber: `NMC-2024-${1000 + i}`,
          specialization: specializations[i - 1],
          qualifications: ['MBBS', 'MD'],
          experienceYears: 5 + i,
          consultationFee: 500 + i * 100,
          isVerified: true,
          bio: `Experienced ${specializations[i - 1]} specialist at ${hospitals[i - 1]}.`,
        },
      })
      console.log(`  ✓ doctor ${i}`)
    } else { console.log(`  skip doctor ${i}`) }

    // Patient
    const pEmail = `patient${i}@demo.swastha.np`
    if (!await prisma.user.findUnique({ where: { email: pEmail } })) {
      const u = await prisma.user.create({
        data: { name: `Patient Demo${i} Thapa`, email: pEmail, phone: `981000${String(i).padStart(4, '0')}`, passwordHash: hash, role: 'patient', isActive: true, emailVerifiedAt: new Date() },
      })
      await prisma.patient.create({
        data: {
          userId: u.id,
          dateOfBirth: new Date(1990 + i, i % 12, (i * 3) % 28 + 1),
          gender: genders[i % 2],
          bloodType: bloodTypes[i % 8],
          address: `${i} Demo Marg, ${districts[i - 1]}`,
          district: districts[i - 1],
          province: provinces[(i - 1) % provinces.length],
          citizenshipNumber: `${110000 + i}-DEMO`,
        },
      }).catch(() => {})
      console.log(`  ✓ patient ${i}`)
    } else { console.log(`  skip patient ${i}`) }

    // Lab tech
    const lEmail = `lab${i}@demo.swastha.np`
    if (!await prisma.user.findUnique({ where: { email: lEmail } })) {
      await prisma.user.create({ data: { name: `Lab Tech Demo${i} KC`, email: lEmail, phone: `982000${String(i).padStart(4, '0')}`, passwordHash: hash, role: 'lab_technician', isActive: true, emailVerifiedAt: new Date() } })
      console.log(`  ✓ lab tech ${i}`)
    }

    // Pharmacist
    const phEmail = `pharma${i}@demo.swastha.np`
    if (!await prisma.user.findUnique({ where: { email: phEmail } })) {
      await prisma.user.create({ data: { name: `Pharmacist Demo${i} Rai`, email: phEmail, phone: `983000${String(i).padStart(4, '0')}`, passwordHash: hash, role: 'pharmacist', isActive: true, emailVerifiedAt: new Date() } })
      console.log(`  ✓ pharmacist ${i}`)
    }
  }
}

async function seedMedicalData() {
  console.log('\n🌱 Seeding medical records, prescriptions, lab reports, vaccinations, allergies...')
  const patients = await prisma.patient.findMany({ take: 10, include: { user: { select: { name: true } } } })
  const doctors = await prisma.doctor.findMany({ take: 10 })
  if (!patients.length || !doctors.length) { console.log('  ⚠ No patients/doctors. Run seed first.'); return }

  for (let i = 0; i < Math.min(10, patients.length); i++) {
    const p = patients[i]
    const d = doctors[i % doctors.length]

    // Medical record
    const mr = await prisma.medicalRecord.create({
      data: {
        patientId: p.id,
        doctorId: d.id,
        recordType: 'diagnosis',
        title: diagnosisList[i],
        diagnosis: diagnosisList[i],
        icdCode: icdCodes[i],
        symptoms: [`Symptom A for ${diagnosisList[i]}`, `Symptom B`],
        notes: `Follow-up in 2 weeks.`,
        visitDate: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
      },
    })

    // Prescription + item
    const rx = await prisma.prescription.create({
      data: {
        patientId: p.id,
        doctorId: d.id,
        medicalRecordId: mr.id,
        status: 'active',
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        pharmacyNotes: `Take as prescribed for ${diagnosisList[i]}`,
      },
    })
    await prisma.prescriptionItem.create({
      data: {
        prescriptionId: rx.id,
        medicineName: medicineNames[i],
        dosage: '500mg',
        frequency: 'twice daily',
        duration: '7 days',
        instructions: 'Take after meals',
      },
    })

    // Lab report
    await prisma.labReport.create({
      data: {
        patientId: p.id,
        orderedById: d.id,
        testName: labTests[i],
        category: labCategories[i],
        sampleType: 'Blood',
        result: 'Within normal range',
        resultValue: 80 + i * 2,
        referenceRange: '65-100',
        unit: 'mg/dL',
        status: 'completed',
        isAbnormal: false,
        completedAt: new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000),
        notes: `Results normal. No action required.`,
      },
    })

    // Vaccination
    await prisma.vaccination.create({
      data: {
        patientId: p.id,
        vaccineName: vaccines[i],
        vaccineBrand: `Brand-${i + 1}`,
        lotNumber: `LOT-${2024000 + i}`,
        doseNumber: 1,
        totalDoses: 2,
        administeredAt: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        site: 'Left arm (deltoid)',
        route: 'Intramuscular',
        facility: hospitals[i],
        notes: 'No adverse reactions observed.',
      },
    })

    // Allergy
    await prisma.allergy.create({
      data: {
        patientId: p.id,
        allergenType: 'drug',
        allergenName: `Allergen-Demo-${i + 1}`,
        reaction: 'Mild rash and itching',
        severity: 'mild',
        onsetDate: new Date(Date.now() - i * 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    })

    console.log(`  ✓ medical data for ${p.user.name}`)
  }
}

async function seedEmergencyInfo() {
  console.log('\n🌱 Seeding emergency info...')
  const patients = await prisma.patient.findMany({ take: 10 })
  for (let i = 0; i < patients.length; i++) {
    const p = patients[i]
    if (await prisma.emergencyInfo.findUnique({ where: { patientId: p.id } })) { console.log(`  skip ${i + 1}`); continue }
    const qrHash = crypto.createHash('sha256').update(p.id + i).digest('hex').slice(0, 32)
    await prisma.emergencyInfo.create({
      data: {
        patientId: p.id,
        bloodType: bloodTypes[i % 8],
        organDonor: i % 3 === 0,
        criticalConditions: i % 2 === 0 ? ['Hypertension'] : [],
        currentMedications: i % 2 === 0 ? ['Amlodipine 5mg'] : [],
        emergencyContacts: [{ name: `Guardian${i + 1}`, relationship: 'Parent', phone: `984${i}000000`, isPrimary: true }],
        insuranceProvider: i % 2 === 0 ? 'Sagarmatha Insurance' : null,
        qrHash,
      },
    })
    console.log(`  ✓ emergency info ${i + 1}`)
  }
}

async function seedAppointments() {
  console.log('\n🌱 Seeding appointments...')
  const patients = await prisma.patient.findMany({ take: 10 })
  const doctors = await prisma.doctor.findMany({ take: 10 })
  if (!patients.length || !doctors.length) return
  const statuses = ['scheduled', 'confirmed', 'completed', 'completed', 'scheduled'] as const
  const types = ['in_person', 'telemedicine', 'in_person'] as const
  for (let i = 0; i < 10; i++) {
    await prisma.appointment.create({
      data: {
        patientId: patients[i % patients.length].id,
        doctorId: doctors[i % doctors.length].id,
        status: statuses[i % statuses.length],
        type: types[i % types.length],
        reason: `Routine checkup - ${diagnosisList[i]}`,
        scheduledAt: new Date(Date.now() + (i - 4) * 24 * 60 * 60 * 1000),
        durationMinutes: 30,
        location: hospitals[i],
      },
    })
    console.log(`  ✓ appointment ${i + 1}`)
  }
}

async function seedBirthDeathRecords() {
  console.log('\n🌱 Seeding birth records...')
  for (let i = 1; i <= 10; i++) {
    const certNum = `BC-2024-${1000 + i}`
    if (await prisma.birthRecord.findUnique({ where: { birthCertificateNumber: certNum } })) { console.log(`  skip birth ${i}`); continue }
    await prisma.birthRecord.create({
      data: {
        birthCertificateNumber: certNum,
        childName: `Baby Demo${i}`,
        dateOfBirth: new Date(2024, i % 12, (i * 2) % 28 + 1),
        placeOfBirth: hospitals[i - 1],
        hospitalFacility: hospitals[i - 1],
        gender: genders[i % 2],
        weightKg: 3.0 + i * 0.1,
        heightCm: 48 + i * 0.5,
        apgarScore: 8 + (i % 2),
        deliveryType: i % 3 === 0 ? 'cesarean' : 'normal',
        fatherName: `Father Demo${i}`,
        motherName: `Mother Demo${i}`,
        district: districts[i - 1],
        province: provinces[(i - 1) % provinces.length],
        isRegistered: true,
        registrationDate: new Date(2024, i % 12, (i * 2) % 28 + 7),
      },
    })
    console.log(`  ✓ birth ${certNum}`)
  }

  console.log('\n🌱 Seeding death records...')
  const causes = ['Cardiac Arrest', 'Respiratory Failure', 'Sepsis', 'Cancer', 'Stroke']
  for (let i = 1; i <= 10; i++) {
    const certNum = `DC-2024-${2000 + i}`
    if (await prisma.deathRecord.findUnique({ where: { deathCertificateNumber: certNum } })) { console.log(`  skip death ${i}`); continue }
    await prisma.deathRecord.create({
      data: {
        deathCertificateNumber: certNum,
        deceasedName: `Deceased Demo${i}`,
        dateOfDeath: new Date(2024, i % 12, (i * 2) % 28 + 1),
        placeOfDeath: hospitals[i - 1],
        hospitalFacility: hospitals[i - 1],
        primaryCause: causes[i % 5],
        secondaryCauses: i % 2 === 0 ? ['Hypertension'] : ['Diabetes'],
        mannerOfDeath: 'natural',
        ageAtDeath: 60 + i,
        gender: genders[i % 2],
        district: districts[i - 1],
        province: provinces[(i - 1) % provinces.length],
        isRegistered: true,
        registrationDate: new Date(2024, i % 12, (i * 2) % 28 + 7),
      },
    })
    console.log(`  ✓ death ${certNum}`)
  }
}

async function main() {
  console.log('🚀 Swastha Nepal AI — Demo Seed')
  try {
    await seedUsers()
    await seedMedicalData()
    await seedEmergencyInfo()
    await seedAppointments()
    await seedBirthDeathRecords()
    console.log('\n✅ Demo seed complete!')
    console.log('\nDemo credentials (password: Demo@1234):')
    console.log('  Doctors:     doctor1@demo.swastha.np → doctor10@demo.swastha.np')
    console.log('  Patients:    patient1@demo.swastha.np → patient10@demo.swastha.np')
    console.log('  Lab techs:   lab1@demo.swastha.np → lab10@demo.swastha.np')
    console.log('  Pharmacists: pharma1@demo.swastha.np → pharma10@demo.swastha.np\n')
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
