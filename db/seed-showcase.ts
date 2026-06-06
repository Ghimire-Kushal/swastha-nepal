/**
 * Showcase seed — 7 realistic Nepali patients + 2 doctors
 * with full medical history, lab reports, prescriptions, appointments, allergies, vaccinations.
 * Run: npm run db:seed-showcase
 */

import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
let HASH: string

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function daysFromNow(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  HASH = await bcrypt.hash('Demo@1234', 10)
  console.log('🌱  Seeding showcase data…')

  // ── 1. Skip if already seeded ──────────────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email: 'dr.rajesh@showcase.dev' } })
  if (existing) {
    console.log('✅  Showcase data already exists. Skipping.')
    return
  }

  // ── 2. Doctor 1 — Dr. Rajesh Kumar Sharma (Cardiologist) ─────────────────
  const drRajeshUser = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Kumar Sharma',
      email: 'dr.rajesh@showcase.dev',
      phone: '+977-9841000001',
      passwordHash: HASH,
      role: 'doctor',
    },
  })
  const drRajesh = await prisma.doctor.create({
    data: {
      userId: drRajeshUser.id,
      licenseNumber: 'NMC-SC-001',
      specialization: 'Cardiology',
      subspecialization: 'Interventional Cardiology',
      qualifications: ['MBBS', 'MD (Internal Medicine)', 'DM (Cardiology)'],
      experienceYears: 18,
      consultationFee: 1500,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableFrom: '09:00',
      availableTo: '17:00',
      bio: 'Senior cardiologist with 18 years of experience at Bir Hospital, Kathmandu. Specialises in interventional procedures and heart failure management.',
      isVerified: true,
    },
  })

  // ── 3. Doctor 2 — Dr. Sunita Poudel (General Medicine) ────────────────────
  const drSunitaUser = await prisma.user.create({
    data: {
      name: 'Dr. Sunita Poudel',
      email: 'dr.sunita@showcase.dev',
      phone: '+977-9841000002',
      passwordHash: HASH,
      role: 'doctor',
    },
  })
  const drSunita = await prisma.doctor.create({
    data: {
      userId: drSunitaUser.id,
      licenseNumber: 'NMC-SC-002',
      specialization: 'General Medicine',
      qualifications: ['MBBS', 'MD (General Medicine)'],
      experienceYears: 10,
      consultationFee: 800,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
      availableFrom: '08:00',
      availableTo: '16:00',
      bio: 'General physician with special interest in diabetes and hypertension management in the Nepali context.',
      isVerified: true,
    },
  })

  // ── 4. Patient definitions ─────────────────────────────────────────────────

  type PatientDef = {
    user: { name: string; email: string; phone: string }
    profile: {
      dob: Date; gender: 'male' | 'female'; bloodType: string
      district: string; province: string; address: string
      citizenshipNumber: string
      guardianName?: string; guardianPhone?: string
    }
    emergency: {
      criticalConditions: string[]; currentMedications: string[]
      contacts: Array<{ name: string; relationship: string; phone: string; isPrimary: boolean }>
    }
    allergies: Array<{ type: string; name: string; reaction: string; severity: string }>
    vaccinations: Array<{ name: string; brand?: string; doseNumber: number; totalDoses: number; daysAgo: number; facility: string }>
    records: Array<{
      type: string; title: string; diagnosis: string; icdCode?: string
      symptoms: string[]; notes: string; daysAgo: number
      prescriptions?: Array<{
        items: Array<{ medicine: string; generic?: string; dosage: string; frequency: string; duration: string; instructions?: string }>
        notes?: string
      }>
      labs?: Array<{ test: string; category: string; result: string; value?: number; unit?: string; range?: string; abnormal: boolean; daysAgo: number }>
    }>
    appointments: Array<{ reason: string; type: 'in_person' | 'telemedicine'; status: string; daysOffset: number; doctorKey: 'rajesh' | 'sunita' }>
  }

  const PATIENTS: PatientDef[] = [
    // ── Patient 1: Ram Bahadur Thapa — Hypertension + Diabetes ──────────────
    {
      user: { name: 'Ram Bahadur Thapa', email: 'ram.thapa@showcase.dev', phone: '+977-9841100001' },
      profile: {
        dob: new Date('1968-03-15'), gender: 'male', bloodType: 'B_POS',
        district: 'Kathmandu', province: 'Bagmati', address: 'Baluwatar, Kathmandu',
        citizenshipNumber: '03-08-68-10001',
      },
      emergency: {
        criticalConditions: ['Hypertension', 'Type 2 Diabetes'],
        currentMedications: ['Amlodipine 5mg', 'Metformin 500mg', 'Losartan 50mg'],
        contacts: [
          { name: 'Sita Thapa', relationship: 'Wife', phone: '+977-9841100011', isPrimary: true },
          { name: 'Bikash Thapa', relationship: 'Son', phone: '+977-9841100012', isPrimary: false },
        ],
      },
      allergies: [
        { type: 'drug', name: 'Penicillin', reaction: 'Rash and urticaria', severity: 'moderate' },
        { type: 'food', name: 'Shellfish', reaction: 'Anaphylaxis', severity: 'life_threatening' },
      ],
      vaccinations: [
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 1, totalDoses: 2, daysAgo: 730, facility: 'Bir Hospital' },
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 2, totalDoses: 2, daysAgo: 674, facility: 'Bir Hospital' },
        { name: 'Influenza', brand: 'Vaxigrip', doseNumber: 1, totalDoses: 1, daysAgo: 180, facility: 'TUTH, Kathmandu' },
      ],
      records: [
        {
          type: 'consultation', title: 'Hypertension Follow-up', diagnosis: 'Hypertension Stage 2',
          icdCode: 'I10', symptoms: ['Headache', 'Dizziness', 'Fatigue'],
          notes: 'BP measured 158/96 mmHg. Patient reports poor dietary compliance. Increased Amlodipine dose to 10mg. Advised DASH diet and salt restriction.',
          daysAgo: 14,
          prescriptions: [{
            items: [
              { medicine: 'Amlodipine', generic: 'Amlodipine Besylate', dosage: '10mg', frequency: 'Once daily', duration: '3 months', instructions: 'Take in the morning' },
              { medicine: 'Losartan', generic: 'Losartan Potassium', dosage: '50mg', frequency: 'Once daily', duration: '3 months', instructions: 'Take with or without food' },
            ],
            notes: 'Monitor BP daily. Return if BP > 160/100',
          }],
          labs: [
            { test: 'HbA1c', category: 'Diabetes', result: '8.2%', value: 8.2, unit: '%', range: '< 7.0%', abnormal: true, daysAgo: 14 },
            { test: 'Fasting Blood Sugar', category: 'Diabetes', result: '162 mg/dL', value: 162, unit: 'mg/dL', range: '70-100 mg/dL', abnormal: true, daysAgo: 14 },
            { test: 'Serum Creatinine', category: 'Renal Function', result: '1.1 mg/dL', value: 1.1, unit: 'mg/dL', range: '0.7-1.2 mg/dL', abnormal: false, daysAgo: 14 },
          ],
        },
        {
          type: 'consultation', title: 'Diabetes Annual Review', diagnosis: 'Type 2 Diabetes Mellitus, poorly controlled',
          icdCode: 'E11', symptoms: ['Polyuria', 'Polydipsia', 'Blurred vision'],
          notes: 'Annual diabetes review. HbA1c 8.2% indicating poor control. Ophthalmology referral for diabetic retinopathy screening. Added Metformin 1g BD.',
          daysAgo: 90,
          labs: [
            { test: 'Lipid Profile (Total Cholesterol)', category: 'Lipid', result: '218 mg/dL', value: 218, unit: 'mg/dL', range: '< 200 mg/dL', abnormal: true, daysAgo: 90 },
            { test: 'LDL Cholesterol', category: 'Lipid', result: '142 mg/dL', value: 142, unit: 'mg/dL', range: '< 100 mg/dL', abnormal: true, daysAgo: 90 },
            { test: 'Urine Microalbumin', category: 'Renal', result: '42 mg/g', value: 42, unit: 'mg/g', range: '< 30 mg/g', abnormal: true, daysAgo: 90 },
          ],
        },
      ],
      appointments: [
        { reason: 'Blood pressure review and medication adjustment', type: 'in_person', status: 'completed', daysOffset: -14, doctorKey: 'rajesh' },
        { reason: 'Follow-up HbA1c and diabetes management', type: 'in_person', status: 'scheduled', daysOffset: 7, doctorKey: 'sunita' },
      ],
    },

    // ── Patient 2: Priya Shrestha — Young woman, Anaemia + PCOS ─────────────
    {
      user: { name: 'Priya Shrestha', email: 'priya.shrestha@showcase.dev', phone: '+977-9841200001' },
      profile: {
        dob: new Date('1995-07-22'), gender: 'female', bloodType: 'O_POS',
        district: 'Lalitpur', province: 'Bagmati', address: 'Patan Dhoka, Lalitpur',
        citizenshipNumber: '03-06-95-10002',
      },
      emergency: {
        criticalConditions: ['Iron Deficiency Anaemia', 'PCOS'],
        currentMedications: ['Ferrous Sulphate 200mg', 'Metformin 500mg', 'Folic Acid 5mg'],
        contacts: [
          { name: 'Ramesh Shrestha', relationship: 'Father', phone: '+977-9841200011', isPrimary: true },
        ],
      },
      allergies: [
        { type: 'drug', name: 'Ibuprofen', reaction: 'Gastric bleeding', severity: 'severe' },
      ],
      vaccinations: [
        { name: 'COVID-19 (Moderna)', brand: 'Spikevax', doseNumber: 1, totalDoses: 2, daysAgo: 700, facility: 'Patan Hospital' },
        { name: 'COVID-19 (Moderna)', brand: 'Spikevax', doseNumber: 2, totalDoses: 2, daysAgo: 640, facility: 'Patan Hospital' },
        { name: 'HPV', brand: 'Gardasil 9', doseNumber: 1, totalDoses: 3, daysAgo: 365, facility: 'Patan Hospital' },
        { name: 'HPV', brand: 'Gardasil 9', doseNumber: 2, totalDoses: 3, daysAgo: 180, facility: 'Patan Hospital' },
      ],
      records: [
        {
          type: 'consultation', title: 'Anaemia Management', diagnosis: 'Iron Deficiency Anaemia',
          icdCode: 'D50', symptoms: ['Fatigue', 'Pallor', 'Palpitations', 'Shortness of breath on exertion'],
          notes: 'Haemoglobin 8.2 g/dL. Serum ferritin very low at 4 ng/mL. Started on IV iron infusion course. Dietary counselling given — include green leafy vegetables, lentils, jaggery.',
          daysAgo: 30,
          prescriptions: [{
            items: [
              { medicine: 'Ferrous Sulphate', generic: 'Iron II Sulphate', dosage: '200mg', frequency: 'Twice daily', duration: '3 months', instructions: 'Take with Vitamin C, avoid tea/coffee within 1 hour' },
              { medicine: 'Folic Acid', dosage: '5mg', frequency: 'Once daily', duration: '3 months' },
            ],
            notes: 'Repeat CBC after 6 weeks',
          }],
          labs: [
            { test: 'Haemoglobin', category: 'CBC', result: '8.2 g/dL', value: 8.2, unit: 'g/dL', range: '12.0-16.0 g/dL', abnormal: true, daysAgo: 30 },
            { test: 'Serum Ferritin', category: 'Iron Studies', result: '4 ng/mL', value: 4, unit: 'ng/mL', range: '12-150 ng/mL', abnormal: true, daysAgo: 30 },
            { test: 'Serum Iron', category: 'Iron Studies', result: '35 µg/dL', value: 35, unit: 'µg/dL', range: '60-170 µg/dL', abnormal: true, daysAgo: 30 },
            { test: 'MCV', category: 'CBC', result: '68 fL', value: 68, unit: 'fL', range: '80-100 fL', abnormal: true, daysAgo: 30 },
          ],
        },
        {
          type: 'consultation', title: 'PCOS Evaluation', diagnosis: 'Polycystic Ovary Syndrome',
          icdCode: 'E28.2', symptoms: ['Irregular periods', 'Weight gain', 'Acne', 'Hirsutism'],
          notes: 'USG shows polycystic ovaries. Testosterone mildly elevated. LH:FSH ratio 3:1. Started Metformin for insulin resistance. Lifestyle modification and weight loss advised.',
          daysAgo: 60,
          labs: [
            { test: 'LH (Luteinising Hormone)', category: 'Hormones', result: '12.4 mIU/mL', value: 12.4, unit: 'mIU/mL', range: '1.8-11.8 mIU/mL (follicular)', abnormal: true, daysAgo: 60 },
            { test: 'Free Testosterone', category: 'Hormones', result: '2.8 pg/mL', value: 2.8, unit: 'pg/mL', range: '0.1-1.7 pg/mL', abnormal: true, daysAgo: 60 },
            { test: 'Fasting Insulin', category: 'Diabetes', result: '18 µIU/mL', value: 18, unit: 'µIU/mL', range: '2.6-24.9 µIU/mL', abnormal: false, daysAgo: 60 },
          ],
        },
      ],
      appointments: [
        { reason: 'Anaemia follow-up — repeat CBC', type: 'in_person', status: 'completed', daysOffset: -30, doctorKey: 'sunita' },
        { reason: 'PCOS and hormonal review', type: 'in_person', status: 'scheduled', daysOffset: 5, doctorKey: 'sunita' },
      ],
    },

    // ── Patient 3: Bikram Rai — Asthma + Allergic Rhinitis ───────────────────
    {
      user: { name: 'Bikram Rai', email: 'bikram.rai@showcase.dev', phone: '+977-9841300001' },
      profile: {
        dob: new Date('1988-11-08'), gender: 'male', bloodType: 'A_POS',
        district: 'Bhaktapur', province: 'Bagmati', address: 'Suryabinayak, Bhaktapur',
        citizenshipNumber: '03-09-88-10003',
      },
      emergency: {
        criticalConditions: ['Bronchial Asthma', 'Allergic Rhinitis'],
        currentMedications: ['Salbutamol Inhaler (PRN)', 'Fluticasone Inhaler', 'Cetirizine 10mg'],
        contacts: [
          { name: 'Maya Rai', relationship: 'Wife', phone: '+977-9841300011', isPrimary: true },
        ],
      },
      allergies: [
        { type: 'environmental', name: 'House Dust Mites', reaction: 'Wheezing, bronchospasm', severity: 'severe' },
        { type: 'environmental', name: 'Pollen', reaction: 'Rhinitis, sneezing, eye irritation', severity: 'moderate' },
        { type: 'food', name: 'Peanuts', reaction: 'Urticaria, angioedema', severity: 'severe' },
      ],
      vaccinations: [
        { name: 'COVID-19 (Pfizer)', brand: 'Comirnaty', doseNumber: 1, totalDoses: 2, daysAgo: 720, facility: 'Bhaktapur Hospital' },
        { name: 'COVID-19 (Pfizer)', brand: 'Comirnaty', doseNumber: 2, totalDoses: 2, daysAgo: 660, facility: 'Bhaktapur Hospital' },
        { name: 'Pneumococcal (PCV13)', doseNumber: 1, totalDoses: 1, daysAgo: 400, facility: 'Bhaktapur Hospital' },
        { name: 'Influenza', brand: 'Vaxigrip', doseNumber: 1, totalDoses: 1, daysAgo: 200, facility: 'Bhaktapur Hospital' },
      ],
      records: [
        {
          type: 'emergency', title: 'Acute Asthma Exacerbation', diagnosis: 'Acute severe asthma',
          icdCode: 'J45.51', symptoms: ['Severe dyspnoea', 'Wheezing', 'Unable to complete sentences', 'SpO2 88%'],
          notes: 'Presented with acute exacerbation triggered by dust exposure at construction site. Nebulised Salbutamol 3 doses, IV Hydrocortisone 200mg. SpO2 improved to 97%. Admitted for observation 24h. Trigger avoidance counselled strongly.',
          daysAgo: 45,
          prescriptions: [{
            items: [
              { medicine: 'Salbutamol Inhaler', dosage: '100mcg/puff', frequency: '2 puffs PRN (max 8 puffs/day)', duration: 'Ongoing', instructions: 'Use spacer device' },
              { medicine: 'Fluticasone/Salmeterol', generic: 'Fluticasone propionate + Salmeterol', dosage: '250/25 mcg', frequency: 'Twice daily', duration: '3 months', instructions: 'Rinse mouth after use' },
              { medicine: 'Prednisolone', dosage: '40mg', frequency: 'Once daily (tapering)', duration: '7 days', instructions: 'Take with food, taper as instructed' },
            ],
            notes: 'Return immediately if dyspnoea at rest',
          }],
          labs: [
            { test: 'Peak Flow Rate', category: 'Pulmonary', result: '220 L/min', value: 220, unit: 'L/min', range: '> 450 L/min (predicted)', abnormal: true, daysAgo: 45 },
            { test: 'SpO2', category: 'Vitals', result: '88%', value: 88, unit: '%', range: '> 95%', abnormal: true, daysAgo: 45 },
            { test: 'Total IgE', category: 'Allergy', result: '485 IU/mL', value: 485, unit: 'IU/mL', range: '< 100 IU/mL', abnormal: true, daysAgo: 45 },
            { test: 'Eosinophil Count', category: 'CBC', result: '620/µL', value: 620, unit: '/µL', range: '50-400/µL', abnormal: true, daysAgo: 45 },
          ],
        },
        {
          type: 'consultation', title: 'Asthma Control Review', diagnosis: 'Partially controlled asthma',
          icdCode: 'J45.40', symptoms: ['Nocturnal cough', 'Exercise-induced wheeze'],
          notes: 'ACT score 17 (partially controlled). Step up to ICS/LABA combination. Spirometry scheduled. Allergen avoidance strategies reinforced. Air purifier recommended.',
          daysAgo: 20,
          labs: [
            { test: 'Spirometry FEV1', category: 'Pulmonary', result: '72% predicted', value: 72, unit: '% predicted', range: '> 80%', abnormal: true, daysAgo: 20 },
            { test: 'FEV1/FVC Ratio', category: 'Pulmonary', result: '0.68', value: 0.68, unit: 'ratio', range: '> 0.70', abnormal: true, daysAgo: 20 },
          ],
        },
      ],
      appointments: [
        { reason: 'Acute asthma attack — emergency review', type: 'in_person', status: 'completed', daysOffset: -45, doctorKey: 'rajesh' },
        { reason: 'Asthma control review and spirometry results', type: 'in_person', status: 'completed', daysOffset: -20, doctorKey: 'rajesh' },
        { reason: 'Pulmonology follow-up — step-up therapy review', type: 'in_person', status: 'scheduled', daysOffset: 10, doctorKey: 'rajesh' },
      ],
    },

    // ── Patient 4: Sushila Maharjan — Pregnant, Anaemia ─────────────────────
    {
      user: { name: 'Sushila Maharjan', email: 'sushila.maharjan@showcase.dev', phone: '+977-9841400001' },
      profile: {
        dob: new Date('1992-05-30'), gender: 'female', bloodType: 'AB_POS',
        district: 'Kathmandu', province: 'Bagmati', address: 'Kirtipur, Kathmandu',
        citizenshipNumber: '03-08-92-10004',
        guardianName: 'Suresh Maharjan', guardianPhone: '+977-9841400011',
      },
      emergency: {
        criticalConditions: ['G2P1 — 28 weeks gestation', 'Gestational Anaemia'],
        currentMedications: ['Ferrous Sulphate 200mg', 'Folic Acid 5mg', 'Calcium 1g', 'Vitamin D 60000 IU weekly'],
        contacts: [
          { name: 'Suresh Maharjan', relationship: 'Husband', phone: '+977-9841400011', isPrimary: true },
          { name: 'Bimala Maharjan', relationship: 'Mother-in-law', phone: '+977-9841400012', isPrimary: false },
        ],
      },
      allergies: [],
      vaccinations: [
        { name: 'Tetanus Toxoid (TT)', doseNumber: 1, totalDoses: 2, daysAgo: 120, facility: 'Kirtipur Hospital' },
        { name: 'Tetanus Toxoid (TT)', doseNumber: 2, totalDoses: 2, daysAgo: 60, facility: 'Kirtipur Hospital' },
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 1, totalDoses: 2, daysAgo: 800, facility: 'Kirtipur Hospital' },
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 2, totalDoses: 2, daysAgo: 740, facility: 'Kirtipur Hospital' },
      ],
      records: [
        {
          type: 'consultation', title: 'ANC Visit — 28 weeks', diagnosis: 'G2P1 28 weeks, Gestational Anaemia',
          icdCode: 'O99.01', symptoms: ['Fatigue', 'Oedema of feet', 'Mild breathlessness'],
          notes: 'BP 118/76. FHR 148 bpm. Fundal height 28cm. Haemoglobin 9.4 g/dL — gestational anaemia. IV iron sucrose scheduled. Growth scan normal. Glucose tolerance test done. GDM screening negative.',
          daysAgo: 7,
          prescriptions: [{
            items: [
              { medicine: 'Ferrous Sulphate', dosage: '200mg', frequency: 'Three times daily', duration: 'Until delivery', instructions: 'Take with orange juice, avoid milk/tea within 1 hour' },
              { medicine: 'Folic Acid', dosage: '5mg', frequency: 'Once daily', duration: 'Until delivery' },
              { medicine: 'Calcium Carbonate', dosage: '1g', frequency: 'Twice daily', duration: 'Until delivery', instructions: 'Take separately from iron by at least 2 hours' },
            ],
            notes: 'Next ANC in 4 weeks. Refer to Patan Hospital for delivery',
          }],
          labs: [
            { test: 'Haemoglobin', category: 'CBC', result: '9.4 g/dL', value: 9.4, unit: 'g/dL', range: '11.0-16.0 g/dL', abnormal: true, daysAgo: 7 },
            { test: 'Platelet Count', category: 'CBC', result: '198,000/µL', value: 198000, unit: '/µL', range: '150,000-400,000/µL', abnormal: false, daysAgo: 7 },
            { test: 'OGTT (1hr)', category: 'Diabetes Screen', result: '138 mg/dL', value: 138, unit: 'mg/dL', range: '< 140 mg/dL', abnormal: false, daysAgo: 7 },
            { test: 'Urine Protein', category: 'Urine', result: 'Trace', unit: '', range: 'Negative', abnormal: false, daysAgo: 7 },
          ],
        },
      ],
      appointments: [
        { reason: 'ANC visit 28 weeks — routine check', type: 'in_person', status: 'completed', daysOffset: -7, doctorKey: 'sunita' },
        { reason: 'ANC visit 32 weeks — growth scan review', type: 'in_person', status: 'scheduled', daysOffset: 21, doctorKey: 'sunita' },
      ],
    },

    // ── Patient 5: Dipendra Karki — Post-MI recovery ─────────────────────────
    {
      user: { name: 'Dipendra Karki', email: 'dipendra.karki@showcase.dev', phone: '+977-9841500001' },
      profile: {
        dob: new Date('1960-01-20'), gender: 'male', bloodType: 'O_NEG',
        district: 'Chitwan', province: 'Bagmati', address: 'Bharatpur-10, Chitwan',
        citizenshipNumber: '04-06-60-10005',
      },
      emergency: {
        criticalConditions: ['Post-STEMI (6 months ago)', 'Hypertension', 'Hyperlipidaemia'],
        currentMedications: ['Aspirin 75mg', 'Atorvastatin 40mg', 'Bisoprolol 5mg', 'Ramipril 5mg', 'Clopidogrel 75mg'],
        contacts: [
          { name: 'Kamala Karki', relationship: 'Wife', phone: '+977-9841500011', isPrimary: true },
          { name: 'Sujan Karki', relationship: 'Son', phone: '+977-9841500012', isPrimary: false },
        ],
      },
      allergies: [
        { type: 'drug', name: 'ACE Inhibitor (Enalapril)', reaction: 'Persistent dry cough', severity: 'mild' },
      ],
      vaccinations: [
        { name: 'COVID-19 (Pfizer)', brand: 'Comirnaty', doseNumber: 1, totalDoses: 2, daysAgo: 750, facility: 'Bharatpur Hospital' },
        { name: 'COVID-19 (Pfizer)', brand: 'Comirnaty', doseNumber: 2, totalDoses: 2, daysAgo: 690, facility: 'Bharatpur Hospital' },
        { name: 'Influenza', doseNumber: 1, totalDoses: 1, daysAgo: 160, facility: 'Bharatpur Hospital' },
        { name: 'Pneumococcal (PPSV23)', doseNumber: 1, totalDoses: 1, daysAgo: 180, facility: 'Bharatpur Hospital' },
      ],
      records: [
        {
          type: 'emergency', title: 'STEMI — Anterior Wall MI', diagnosis: 'ST-Elevation Myocardial Infarction (Anterior)',
          icdCode: 'I21.0', symptoms: ['Crushing chest pain', 'Radiation to left arm and jaw', 'Diaphoresis', 'Nausea', 'Dyspnoea'],
          notes: 'Presented with 3 hours of chest pain. ECG: ST elevation in V1-V4. Troponin I 48 ng/mL (very elevated). Thrombolysis with Streptokinase given (PCI not available). Admitted ICCU for 7 days. Echocardiography: EF 38%, anterior wall hypokinesia.',
          daysAgo: 180,
          prescriptions: [{
            items: [
              { medicine: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: 'Lifelong', instructions: 'Take with food' },
              { medicine: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', duration: '12 months', instructions: 'Do not stop without consulting doctor' },
              { medicine: 'Atorvastatin', dosage: '40mg', frequency: 'Once at night', duration: 'Lifelong' },
              { medicine: 'Bisoprolol', dosage: '5mg', frequency: 'Once daily', duration: 'Lifelong', instructions: 'Do not stop suddenly' },
              { medicine: 'Ramipril', dosage: '5mg', frequency: 'Once daily', duration: 'Lifelong' },
            ],
            notes: 'Cardiac rehabilitation programme enrolled. Strict lifestyle modification. Return to OPD monthly.',
          }],
          labs: [
            { test: 'Troponin I', category: 'Cardiac', result: '48 ng/mL', value: 48, unit: 'ng/mL', range: '< 0.04 ng/mL', abnormal: true, daysAgo: 180 },
            { test: 'CK-MB', category: 'Cardiac', result: '186 U/L', value: 186, unit: 'U/L', range: '< 25 U/L', abnormal: true, daysAgo: 180 },
            { test: 'Echocardiography EF', category: 'Cardiac', result: '38%', value: 38, unit: '%', range: '55-70%', abnormal: true, daysAgo: 180 },
          ],
        },
        {
          type: 'consultation', title: 'Post-MI 6-Month Review', diagnosis: 'Post-STEMI — improving EF',
          icdCode: 'I25.2', symptoms: ['Mild exertional dyspnoea', 'Ankle oedema'],
          notes: 'Repeat echo EF improved to 48%. BP well controlled at 124/78. Total cholesterol 162 mg/dL on statin — excellent response. Continue all medications. Cardiac rehabilitation completed. TMT negative. Good recovery.',
          daysAgo: 3,
          labs: [
            { test: 'Echocardiography EF (Follow-up)', category: 'Cardiac', result: '48%', value: 48, unit: '%', range: '55-70%', abnormal: true, daysAgo: 3 },
            { test: 'Total Cholesterol', category: 'Lipid', result: '162 mg/dL', value: 162, unit: 'mg/dL', range: '< 200 mg/dL', abnormal: false, daysAgo: 3 },
            { test: 'LDL Cholesterol', category: 'Lipid', result: '82 mg/dL', value: 82, unit: 'mg/dL', range: '< 70 mg/dL (post-MI target)', abnormal: true, daysAgo: 3 },
            { test: 'NT-proBNP', category: 'Cardiac', result: '380 pg/mL', value: 380, unit: 'pg/mL', range: '< 125 pg/mL', abnormal: true, daysAgo: 3 },
          ],
        },
      ],
      appointments: [
        { reason: 'STEMI emergency admission', type: 'in_person', status: 'completed', daysOffset: -180, doctorKey: 'rajesh' },
        { reason: 'Post-MI 6-month cardiology review', type: 'in_person', status: 'completed', daysOffset: -3, doctorKey: 'rajesh' },
        { reason: 'Cardiology follow-up — 9-month review', type: 'in_person', status: 'scheduled', daysOffset: 90, doctorKey: 'rajesh' },
      ],
    },

    // ── Patient 6: Anita Gurung — Thyroid disorder + Vitamin D deficiency ────
    {
      user: { name: 'Anita Gurung', email: 'anita.gurung@showcase.dev', phone: '+977-9841600001' },
      profile: {
        dob: new Date('1982-09-14'), gender: 'female', bloodType: 'B_NEG',
        district: 'Pokhara', province: 'Gandaki', address: 'Lakeside, Pokhara-6',
        citizenshipNumber: '04-38-82-10006',
      },
      emergency: {
        criticalConditions: ['Hypothyroidism', 'Vitamin D Deficiency'],
        currentMedications: ['Levothyroxine 75mcg', 'Vitamin D 60000 IU (weekly)'],
        contacts: [
          { name: 'Deepak Gurung', relationship: 'Husband', phone: '+977-9841600011', isPrimary: true },
        ],
      },
      allergies: [
        { type: 'food', name: 'Dairy products', reaction: 'Bloating, diarrhoea', severity: 'mild' },
      ],
      vaccinations: [
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 1, totalDoses: 2, daysAgo: 760, facility: 'Western Regional Hospital, Pokhara' },
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 2, totalDoses: 2, daysAgo: 700, facility: 'Western Regional Hospital, Pokhara' },
      ],
      records: [
        {
          type: 'consultation', title: 'Thyroid Function Review', diagnosis: 'Primary Hypothyroidism',
          icdCode: 'E03.9', symptoms: ['Fatigue', 'Weight gain', 'Cold intolerance', 'Hair loss', 'Constipation', 'Brain fog'],
          notes: 'TSH elevated at 12.4 mIU/L. Free T4 low at 0.6 ng/dL. Increased Levothyroxine from 50mcg to 75mcg. Recheck TFT in 6 weeks. Anti-TPO antibodies positive — Hashimoto\'s thyroiditis.',
          daysAgo: 21,
          prescriptions: [{
            items: [
              { medicine: 'Levothyroxine', generic: 'L-Thyroxine', dosage: '75mcg', frequency: 'Once daily (morning, empty stomach)', duration: 'Lifelong', instructions: 'Take 30-60 min before breakfast. Do not take with calcium, iron or antacids' },
            ],
            notes: 'Recheck TFT after 6 weeks. Aim TSH 1-2.5 mIU/L',
          }],
          labs: [
            { test: 'TSH', category: 'Thyroid', result: '12.4 mIU/L', value: 12.4, unit: 'mIU/L', range: '0.4-4.0 mIU/L', abnormal: true, daysAgo: 21 },
            { test: 'Free T4', category: 'Thyroid', result: '0.6 ng/dL', value: 0.6, unit: 'ng/dL', range: '0.8-1.8 ng/dL', abnormal: true, daysAgo: 21 },
            { test: 'Anti-TPO Antibodies', category: 'Thyroid', result: '284 IU/mL', value: 284, unit: 'IU/mL', range: '< 35 IU/mL', abnormal: true, daysAgo: 21 },
            { test: 'Vitamin D (25-OH)', category: 'Vitamins', result: '11 ng/mL', value: 11, unit: 'ng/mL', range: '30-100 ng/mL', abnormal: true, daysAgo: 21 },
          ],
        },
      ],
      appointments: [
        { reason: 'Thyroid function and fatigue evaluation', type: 'in_person', status: 'completed', daysOffset: -21, doctorKey: 'sunita' },
        { reason: 'TFT recheck — Levothyroxine dose adjustment', type: 'in_person', status: 'scheduled', daysOffset: 21, doctorKey: 'sunita' },
      ],
    },

    // ── Patient 7: Sanjay Tamang — Tuberculosis treatment ────────────────────
    {
      user: { name: 'Sanjay Tamang', email: 'sanjay.tamang@showcase.dev', phone: '+977-9841700001' },
      profile: {
        dob: new Date('1998-04-03'), gender: 'male', bloodType: 'A_NEG',
        district: 'Sindhupalchok', province: 'Bagmati', address: 'Chautara, Sindhupalchok',
        citizenshipNumber: '03-25-98-10007',
      },
      emergency: {
        criticalConditions: ['Pulmonary Tuberculosis (DOTS — Month 3)', 'Malnutrition'],
        currentMedications: ['HRZE (Isoniazid 300mg + Rifampicin 600mg + Pyrazinamide 1500mg + Ethambutol 1200mg)', 'Pyridoxine 50mg', 'Vitamin B-Complex'],
        contacts: [
          { name: 'Dhan Bahadur Tamang', relationship: 'Father', phone: '+977-9841700011', isPrimary: true },
        ],
      },
      allergies: [],
      vaccinations: [
        { name: 'BCG', doseNumber: 1, totalDoses: 1, daysAgo: 9125, facility: 'Chautara Health Post' },
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 1, totalDoses: 2, daysAgo: 700, facility: 'Sindhupalchok DHO' },
        { name: 'COVID-19 (AstraZeneca)', brand: 'Covishield', doseNumber: 2, totalDoses: 2, daysAgo: 640, facility: 'Sindhupalchok DHO' },
      ],
      records: [
        {
          type: 'consultation', title: 'TB Diagnosis — Sputum AFB Positive', diagnosis: 'Pulmonary Tuberculosis (Smear Positive)',
          icdCode: 'A15.0', symptoms: ['Productive cough > 3 weeks', 'Haemoptysis', 'Night sweats', 'Weight loss 8kg', 'Evening fever', 'Fatigue'],
          notes: 'Sputum smear AFB 3+ (both samples). CXR: right upper lobe infiltrates with cavitation. Enrolled in DOTS programme at Chautara Health Post. Intensive phase: HRZE x 2 months. Nutritional support provided. Contact tracing initiated for household members.',
          daysAgo: 90,
          prescriptions: [{
            items: [
              { medicine: 'HRZE Fixed-Dose Combination', generic: 'Isoniazid + Rifampicin + Pyrazinamide + Ethambutol', dosage: 'Weight-based dose', frequency: 'Once daily (DOT supervised)', duration: '2 months intensive phase, then 4 months continuation', instructions: 'Take on empty stomach. Urine may turn orange — normal.' },
              { medicine: 'Pyridoxine (Vitamin B6)', dosage: '50mg', frequency: 'Once daily', duration: '6 months', instructions: 'Prevents peripheral neuropathy from Isoniazid' },
            ],
            notes: 'DOTS card issued. Strict adherence essential. Report any visual changes immediately (Ethambutol side effect).',
          }],
          labs: [
            { test: 'Sputum AFB Smear', category: 'Microbiology', result: 'AFB 3+ (Positive)', unit: '', range: 'Negative', abnormal: true, daysAgo: 90 },
            { test: 'Chest X-Ray Findings', category: 'Radiology', result: 'Right upper lobe infiltrates with cavitation', unit: '', range: 'Normal', abnormal: true, daysAgo: 90 },
            { test: 'Haemoglobin', category: 'CBC', result: '10.2 g/dL', value: 10.2, unit: 'g/dL', range: '13.5-17.5 g/dL', abnormal: true, daysAgo: 90 },
            { test: 'Serum Albumin', category: 'Nutrition', result: '2.8 g/dL', value: 2.8, unit: 'g/dL', range: '3.5-5.0 g/dL', abnormal: true, daysAgo: 90 },
          ],
        },
        {
          type: 'consultation', title: 'TB Month 2 Review — Sputum Conversion', diagnosis: 'Pulmonary TB — Converting',
          icdCode: 'A15.0', symptoms: ['Improving cough', 'Weight gain 2kg', 'Less night sweats'],
          notes: 'End of intensive phase. Sputum smear converting — 1+ (improved from 3+). Clinical improvement noted. Weight gain 2kg. Transitioning to continuation phase: HR (Isoniazid + Rifampicin) x 4 months. Liver function normal.',
          daysAgo: 30,
          labs: [
            { test: 'Sputum AFB (Month 2)', category: 'Microbiology', result: 'AFB 1+ (Improving)', unit: '', range: 'Negative', abnormal: true, daysAgo: 30 },
            { test: 'ALT (Liver Function)', category: 'Liver', result: '38 U/L', value: 38, unit: 'U/L', range: '7-56 U/L', abnormal: false, daysAgo: 30 },
            { test: 'AST', category: 'Liver', result: '32 U/L', value: 32, unit: 'U/L', range: '10-40 U/L', abnormal: false, daysAgo: 30 },
          ],
        },
      ],
      appointments: [
        { reason: 'TB diagnosis confirmation and DOTS enrolment', type: 'in_person', status: 'completed', daysOffset: -90, doctorKey: 'sunita' },
        { reason: 'TB month 2 review — sputum conversion check', type: 'in_person', status: 'completed', daysOffset: -30, doctorKey: 'sunita' },
        { reason: 'TB month 5 review — continuation phase progress', type: 'in_person', status: 'scheduled', daysOffset: 60, doctorKey: 'sunita' },
      ],
    },
  ]

  // ── 5. Create each patient ─────────────────────────────────────────────────
  for (const def of PATIENTS) {
    console.log(`  Creating ${def.user.name}…`)

    // User
    const user = await prisma.user.create({
      data: {
        name: def.user.name,
        email: def.user.email,
        phone: def.user.phone,
        passwordHash: HASH,
        role: 'patient',
      },
    })

    // Patient profile
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: def.profile.dob,
        gender: def.profile.gender as never,
        bloodType: def.profile.bloodType as never,
        district: def.profile.district,
        province: def.profile.province,
        address: def.profile.address,
        citizenshipNumber: def.profile.citizenshipNumber,
        guardianName: def.profile.guardianName,
        guardianPhone: def.profile.guardianPhone,
        verificationStatus: 'verified',
        verificationDocType: 'citizenship',
        verificationDocNumber: def.profile.citizenshipNumber,
        verifiedAt: daysAgo(60),
      },
    })

    // Emergency info
    await prisma.emergencyInfo.create({
      data: {
        patientId: patient.id,
        bloodType: def.profile.bloodType as never,
        criticalConditions: def.emergency.criticalConditions,
        currentMedications: def.emergency.currentMedications,
        emergencyContacts: def.emergency.contacts,
        organDonor: false,
      },
    })

    // Allergies
    for (const a of def.allergies) {
      await prisma.allergy.create({
        data: {
          patientId: patient.id,
          allergenType: a.type as never,
          allergenName: a.name,
          reaction: a.reaction,
          severity: a.severity as never,
          isActive: true,
          onsetDate: daysAgo(365),
        },
      })
    }

    // Vaccinations
    for (const v of def.vaccinations) {
      await prisma.vaccination.create({
        data: {
          patientId: patient.id,
          vaccineName: v.name,
          vaccineBrand: v.brand,
          doseNumber: v.doseNumber,
          totalDoses: v.totalDoses,
          administeredAt: daysAgo(v.daysAgo),
          facility: v.facility,
          site: 'Left deltoid',
          route: 'Intramuscular',
        },
      })
    }

    // Medical records, prescriptions, lab reports
    for (const rec of def.records) {
      const doctor = rec.type === 'emergency' || rec.daysAgo > 30 ? drRajesh : drSunita

      const medRecord = await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          recordType: rec.type,
          title: rec.title,
          diagnosis: rec.diagnosis,
          icdCode: rec.icdCode,
          symptoms: rec.symptoms,
          notes: rec.notes,
          visitDate: daysAgo(rec.daysAgo),
          followUpDate: rec.daysAgo > 7 ? daysFromNow(30) : undefined,
        },
      })

      // Prescriptions
      if (rec.prescriptions) {
        for (const presc of rec.prescriptions) {
          const prescription = await prisma.prescription.create({
            data: {
              patientId: patient.id,
              doctorId: doctor.id,
              medicalRecordId: medRecord.id,
              status: rec.daysAgo > 60 ? 'dispensed' : 'active',
              prescribedAt: daysAgo(rec.daysAgo),
              validUntil: daysFromNow(90),
              pharmacyNotes: presc.notes,
            },
          })

          for (const item of presc.items) {
            await prisma.prescriptionItem.create({
              data: {
                prescriptionId: prescription.id,
                medicineName: item.medicine,
                genericName: item.generic,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
                quantity: 90,
              },
            })
          }
        }
      }

      // Lab reports
      if (rec.labs) {
        for (const lab of rec.labs) {
          await prisma.labReport.create({
            data: {
              patientId: patient.id,
              orderedById: doctor.id,
              medicalRecordId: medRecord.id,
              testName: lab.test,
              category: lab.category,
              result: lab.result,
              resultValue: lab.value ?? null,
              unit: lab.unit,
              referenceRange: lab.range,
              isAbnormal: lab.abnormal,
              status: 'completed',
              sampleType: 'Blood',
              sampleCollectedAt: daysAgo(lab.daysAgo),
              completedAt: daysAgo(lab.daysAgo),
            },
          })
        }
      }
    }

    // Appointments
    for (const apt of def.appointments) {
      const doctor = apt.doctorKey === 'rajesh' ? drRajesh : drSunita
      await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          status: apt.status as never,
          type: apt.type as never,
          reason: apt.reason,
          scheduledAt: apt.daysOffset < 0 ? daysAgo(-apt.daysOffset) : daysFromNow(apt.daysOffset),
          durationMinutes: 30,
          location: 'Outpatient Department',
        },
      })
    }
  }

  console.log('✅  Showcase data seeded successfully!')
  console.log('   7 patients · 2 doctors · full medical records')
  console.log('')
  console.log('   Login with any patient (password: Demo@1234):')
  PATIENTS.forEach(p => console.log(`   ${p.user.email}  →  ${p.user.name}`))
  console.log('')
  console.log('   Doctor logins:')
  console.log('   dr.rajesh@showcase.dev  →  Dr. Rajesh Kumar Sharma (Cardiologist)')
  console.log('   dr.sunita@showcase.dev  →  Dr. Sunita Poudel (General Medicine)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
