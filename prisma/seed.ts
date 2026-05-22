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

    // Create patient profile for patient role
    if (role === 'patient') {
      await prisma.patient.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          gender: 'male',
          bloodType: 'O_POS',
          district: 'Kathmandu',
          province: 'Bagmati',
        },
      })

      // Seed emergency info
      await prisma.emergencyInfo.upsert({
        where: { patientId: (await prisma.patient.findUnique({ where: { userId: user.id } }))!.id },
        update: {},
        create: {
          patientId: (await prisma.patient.findUnique({ where: { userId: user.id } }))!.id,
          bloodType: 'O_POS',
          organDonor: false,
          criticalConditions: [],
          currentMedications: [],
          emergencyContacts: [
            { name: 'Emergency Contact', relationship: 'Family', phone: '+977-9800000002', isPrimary: true },
          ],
        },
      })
    }

    // Create doctor profile for doctor role
    if (role === 'doctor') {
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          licenseNumber: 'NMC-2024-001',
          specialization: 'General Medicine',
          experienceYears: 5,
          consultationFee: 500,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          availableFrom: '09:00',
          availableTo: '17:00',
          isVerified: true,
        },
      })
    }
  }

  console.log(`\n✅ Seed complete. Login password for all accounts: ${SEED_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
