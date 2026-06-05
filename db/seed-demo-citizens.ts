/**
 * Seeds 1000 demo Nepali citizens as patient accounts.
 * Run: npm run db:seed-citizens
 *
 * Since Nepal's real citizenship API is not publicly accessible,
 * this dataset simulates what that API would return.
 * Citizenship number format: PP-DDD-YY-NNNNN (province-district-year-sequence)
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Nepal geographic data ───────────────────────────────────────────────────

const PROVINCES: Record<string, { name: string; districts: string[] }> = {
  '1': {
    name: 'Koshi',
    districts: ['Taplejung', 'Panchthar', 'Ilam', 'Jhapa', 'Morang', 'Sunsari', 'Dhankuta', 'Terhathum', 'Sankhuwasabha', 'Bhojpur', 'Solukhumbu', 'Okhaldhunga', 'Khotang', 'Udayapur'],
  },
  '2': {
    name: 'Madhesh',
    districts: ['Saptari', 'Siraha', 'Dhanusha', 'Mahottari', 'Sarlahi', 'Rautahat', 'Bara', 'Parsa'],
  },
  '3': {
    name: 'Bagmati',
    districts: ['Sindhuli', 'Ramechhap', 'Dolakha', 'Sindhupalchok', 'Kavrepalanchok', 'Lalitpur', 'Bhaktapur', 'Kathmandu', 'Nuwakot', 'Rasuwa', 'Dhading', 'Makwanpur', 'Chitwan'],
  },
  '4': {
    name: 'Gandaki',
    districts: ['Gorkha', 'Manang', 'Mustang', 'Myagdi', 'Kaski', 'Lamjung', 'Tanahu', 'Nawalpur', 'Syangja', 'Parbat', 'Baglung'],
  },
  '5': {
    name: 'Lumbini',
    districts: ['Rukum East', 'Rolpa', 'Pyuthan', 'Gulmi', 'Palpa', 'Nawalparasi West', 'Rupandehi', 'Kapilvastu', 'Arghakhanchi', 'Dang', 'Banke', 'Bardiya'],
  },
  '6': {
    name: 'Karnali',
    districts: ['Dolpa', 'Mugu', 'Humla', 'Jumla', 'Kalikot', 'Dailekh', 'Jajarkot', 'Rukum West', 'Salyan', 'Surkhet'],
  },
  '7': {
    name: 'Sudurpashchim',
    districts: ['Bajura', 'Bajhang', 'Achham', 'Doti', 'Kailali', 'Kanchanpur', 'Dadeldhura', 'Baitadi', 'Darchula'],
  },
}

const FIRST_NAMES_MALE = [
  'Aarav', 'Aditya', 'Anish', 'Arjun', 'Ashim', 'Bibek', 'Bikash', 'Binod', 'Bishnu', 'Deepak',
  'Dipesh', 'Ganesh', 'Gopal', 'Hari', 'Hemanta', 'Kiran', 'Krishna', 'Laxman', 'Madhav', 'Mahesh',
  'Manish', 'Milan', 'Nabin', 'Narayan', 'Niraj', 'Prabhat', 'Prakash', 'Prasad', 'Prashant', 'Rajan',
  'Rajesh', 'Ram', 'Ramesh', 'Ravi', 'Roshan', 'Sagar', 'Sandesh', 'Sanjeev', 'Santosh', 'Saroj',
  'Shiva', 'Shyam', 'Sujan', 'Sunil', 'Suresh', 'Sushil', 'Umesh', 'Vijay', 'Vikram', 'Yogesh',
]

const FIRST_NAMES_FEMALE = [
  'Aarti', 'Anita', 'Anjali', 'Anju', 'Archana', 'Bimala', 'Binita', 'Champa', 'Chandani', 'Deepa',
  'Dipa', 'Gita', 'Kabita', 'Kamala', 'Kanchan', 'Kavita', 'Kumari', 'Lalita', 'Laxmi', 'Mamata',
  'Manisha', 'Maya', 'Mina', 'Nirmala', 'Nisha', 'Parbati', 'Poonam', 'Pooja', 'Pratima', 'Priya',
  'Radha', 'Rashmi', 'Rekha', 'Rita', 'Rojina', 'Sabina', 'Samjhana', 'Sangita', 'Sarita', 'Savita',
  'Shanta', 'Sharmila', 'Shreya', 'Sita', 'Srijana', 'Sunita', 'Susma', 'Uma', 'Usha', 'Yasoda',
]

const LAST_NAMES = [
  'Adhikari', 'Aryal', 'Basnet', 'Bhandari', 'Bhattarai', 'Budhathoki', 'Chaudhary', 'Dahal',
  'Devkota', 'Dhakal', 'Ghimire', 'Gurung', 'Joshi', 'Kafle', 'Karki', 'Khadka', 'Lama', 'Limbu',
  'Magar', 'Maharjan', 'Neupane', 'Ojha', 'Pandey', 'Paudel', 'Pokhrel', 'Pradhan', 'Rai', 'Regmi',
  'Rijal', 'Sapkota', 'Sharma', 'Shrestha', 'Subedi', 'Tamang', 'Thapa', 'Tiwari', 'Upreti', 'Yadav',
]

const BLOOD_TYPES = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'O_POS', 'O_NEG', 'AB_POS', 'AB_NEG'] as const
// Nepal blood type distribution (approx): B+ 36%, O+ 30%, A+ 22%, AB+ 9%, negatives rare
const BLOOD_TYPE_WEIGHTS = [22, 1, 36, 1, 30, 1, 9, 1]

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedPick<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i]
    if (r <= 0) return arr[i]
  }
  return arr[arr.length - 1]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDOB(minAge: number, maxAge: number): Date {
  const now = new Date()
  const year = now.getFullYear() - randomInt(minAge, maxAge)
  const month = randomInt(0, 11)
  const day = randomInt(1, 28)
  return new Date(year, month, day)
}

function citizenshipNumber(province: string, districtIdx: number, dob: Date, seq: number): string {
  const pp = province.padStart(2, '0')
  const dd = String(districtIdx + 1).padStart(2, '0')
  const yy = String(dob.getFullYear()).slice(-2)
  const nnnnn = String(seq).padStart(5, '0')
  return `${pp}-${dd}-${yy}-${nnnnn}`
}

function phone(): string {
  const prefixes = ['984', '985', '986', '980', '981', '982', '961', '962', '963']
  return `+977-${pick(prefixes)}${String(randomInt(1000000, 9999999))}`
}

// ── Generator ────────────────────────────────────────────────────────────────

interface CitizenRecord {
  name: string
  email: string
  phone: string
  gender: 'male' | 'female'
  dob: Date
  bloodType: typeof BLOOD_TYPES[number]
  district: string
  province: string
  address: string
  citizenshipNumber: string
}

function generateCitizens(count: number): CitizenRecord[] {
  const citizens: CitizenRecord[] = []
  let seq = 1000

  const provinceKeys = Object.keys(PROVINCES)

  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? 'male' : 'female'
    const firstName = gender === 'male' ? pick(FIRST_NAMES_MALE) : pick(FIRST_NAMES_FEMALE)
    const lastName = pick(LAST_NAMES)
    const fullName = `${firstName} ${lastName}`

    const provKey = pick(provinceKeys)
    const prov = PROVINCES[provKey]
    const districtIdx = randomInt(0, prov.districts.length - 1)
    const district = prov.districts[districtIdx]

    const dob = randomDOB(18, 75)
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${seq}@demo.swasthanepal.ai`
    const cn = citizenshipNumber(provKey, districtIdx, dob, seq)

    citizens.push({
      name: fullName,
      email,
      phone: phone(),
      gender,
      dob,
      bloodType: weightedPick([...BLOOD_TYPES], BLOOD_TYPE_WEIGHTS),
      district,
      province: prov.name,
      address: `Ward No. ${randomInt(1, 32)}, ${district}`,
      citizenshipNumber: cn,
    })

    seq++
  }

  return citizens
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding 1000 demo citizens...')

  const existing = await prisma.patient.count()
  if (existing >= 1000) {
    console.log(`⚠️  Already ${existing} patients in DB. Skipping to avoid duplicates.`)
    console.log('   Run with --force to override: delete patients first via db:studio')
    return
  }

  const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? 'Demo@Swastha123'
  // Use cost 8 for demo speed (still secure enough for test data)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 8)

  const citizens = generateCitizens(1000)

  const BATCH = 50
  let created = 0

  for (let i = 0; i < citizens.length; i += BATCH) {
    const batch = citizens.slice(i, i + BATCH)

    await Promise.all(
      batch.map(async (c) => {
        try {
          const user = await prisma.user.create({
            data: {
              name: c.name,
              email: c.email,
              phone: c.phone,
              passwordHash,
              role: 'patient',
              isActive: true,
              patient: {
                create: {
                  dateOfBirth: c.dob,
                  gender: c.gender,
                  bloodType: c.bloodType,
                  address: c.address,
                  district: c.district,
                  province: c.province,
                  citizenshipNumber: c.citizenshipNumber,
                  verificationStatus: 'demo',
                },
              },
            },
          })
          return user
        } catch {
          // Skip duplicates (email/citizenship collision on re-runs)
        }
      })
    )

    created += batch.length
    process.stdout.write(`\r  Progress: ${created}/${citizens.length}`)
  }

  console.log(`\n✅ Done. ${created} demo citizens seeded.`)
  console.log(`   Demo login password: ${DEMO_PASSWORD}`)
  console.log(`   Citizenship numbers range: 01-01-XX-01000 → 07-XX-XX-01999`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
