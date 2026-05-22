// Mock data for development — replace functions in services/patient.ts with Prisma queries

export const MOCK_PATIENT = {
  id: 'p-001',
  userId: 'u-001',
  name: 'Ramesh Bahadur Thapa',
  email: 'ramesh.thapa@gmail.com',
  phone: '+977-9841234567',
  dateOfBirth: new Date('1990-05-15'),
  gender: 'male' as const,
  bloodType: 'A_POS' as const,
  address: 'Baneshwor, Ward No. 10',
  district: 'Kathmandu',
  province: 'Bagmati',
  citizenshipNumber: '02-01-70-12345',
  guardianName: 'Shanti Devi Thapa',
  guardianPhone: '+977-9812345678',
  profilePhotoUrl: null as string | null,
}

export const MOCK_EMERGENCY_INFO = {
  bloodType: 'A_POS' as const,
  organDonor: false,
  criticalConditions: ['Hypertension (Stage 1)', 'Vitamin D Deficiency'],
  currentMedications: ['Amlodipine 5mg OD', 'Telmisartan 40mg OD', 'Cholecalciferol 60,000 IU Weekly'],
  emergencyContacts: [
    { name: 'Shanti Devi Thapa', relationship: 'Mother', phone: '+977-9812345678', isPrimary: true },
    { name: 'Sanjay Thapa', relationship: 'Brother', phone: '+977-9823456789', isPrimary: false },
  ],
  insuranceProvider: 'Nepal Life Insurance',
  insurancePolicyNum: 'NLI-2024-987654',
  advanceDirective: null as string | null,
  qrHash: 'a3f9b2e1c4d7f8a0b1c2d3e4f5a6b7c8',
}

export const MOCK_ALLERGIES = [
  { id: 'al-1', allergenName: 'Penicillin', allergenType: 'drug' as const, reaction: 'Anaphylaxis — severe breathing difficulty, skin rash', severity: 'life_threatening' as const, onsetDate: '2018-03-10', isActive: true },
  { id: 'al-2', allergenName: 'Shellfish', allergenType: 'food' as const, reaction: 'Urticaria, nausea', severity: 'moderate' as const, onsetDate: '2015-07-22', isActive: true },
]

export const MOCK_MEDICAL_RECORDS = [
  {
    id: 'mr-1',
    date: '2024-11-20',
    type: 'diagnosis',
    title: 'Annual Health Checkup',
    diagnosis: 'Stage 1 Hypertension, Vitamin D Deficiency',
    icdCode: 'I10, E55.9',
    doctor: 'Dr. Anita Sharma',
    hospital: 'Grande International Hospital',
    symptoms: ['Mild headache', 'Fatigue', 'Occasional dizziness'],
    notes: 'BP 140/90 mmHg on three consecutive readings. Advised DASH diet and medication.',
  },
  {
    id: 'mr-2',
    date: '2024-08-10',
    type: 'visit_note',
    title: 'Follow-up — Hypertension',
    diagnosis: 'Hypertension, improving',
    icdCode: 'I10',
    doctor: 'Dr. Anita Sharma',
    hospital: 'Grande International Hospital',
    symptoms: ['Occasional mild headache'],
    notes: 'BP improved to 130/85 mmHg. Continue current medications. Advised to monitor at home.',
  },
  {
    id: 'mr-3',
    date: '2024-03-05',
    type: 'procedure',
    title: 'ECG & Cardiac Assessment',
    diagnosis: 'Normal Sinus Rhythm',
    icdCode: 'Z13.6',
    doctor: 'Dr. Rajan Karki',
    hospital: 'Norvic International Hospital',
    symptoms: [],
    notes: 'ECG within normal limits. Echo normal. No structural cardiac abnormalities.',
  },
  {
    id: 'mr-4',
    date: '2023-12-15',
    type: 'diagnosis',
    title: 'Acute Upper Respiratory Infection',
    diagnosis: 'Viral URTI',
    icdCode: 'J06.9',
    doctor: 'Dr. Priya Basnet',
    hospital: 'Om Hospital & Research Center',
    symptoms: ['Sore throat', 'Runny nose', 'Low-grade fever (37.8°C)', 'Dry cough'],
    notes: 'Symptomatic treatment prescribed. Advised rest and adequate hydration.',
  },
  {
    id: 'mr-5',
    date: '2022-06-20',
    type: 'procedure',
    title: 'Appendectomy',
    diagnosis: 'Acute Appendicitis',
    icdCode: 'K35.80',
    doctor: 'Dr. Bijay Paudel',
    hospital: 'KIST Medical College',
    symptoms: ['Severe right lower abdominal pain', 'Nausea', 'Low-grade fever'],
    notes: 'Laparoscopic appendectomy performed. Uncomplicated. Discharged after 2 days.',
  },
]

export const MOCK_PRESCRIPTIONS = [
  {
    id: 'rx-1',
    prescribedDate: '2024-11-20',
    validUntil: '2025-05-20',
    status: 'active' as const,
    doctor: 'Dr. Anita Sharma',
    hospital: 'Grande International Hospital',
    items: [
      { medicineName: 'Amlodipine', genericName: 'Amlodipine Besylate', dosage: '5mg', frequency: 'Once daily (morning)', duration: '6 months', route: 'Oral', instructions: 'Take in the morning with or without food' },
      { medicineName: 'Telmisartan', genericName: 'Telmisartan', dosage: '40mg', frequency: 'Once daily (bedtime)', duration: '6 months', route: 'Oral', instructions: 'Take at bedtime. Monitor BP weekly.' },
    ],
  },
  {
    id: 'rx-2',
    prescribedDate: '2024-11-20',
    validUntil: '2025-02-20',
    status: 'dispensed' as const,
    doctor: 'Dr. Anita Sharma',
    hospital: 'Grande International Hospital',
    items: [
      { medicineName: 'Cholecalciferol', genericName: 'Vitamin D3', dosage: '60,000 IU', frequency: 'Once weekly', duration: '3 months', route: 'Oral', instructions: 'Take with a fatty meal for better absorption' },
    ],
  },
  {
    id: 'rx-3',
    prescribedDate: '2023-12-15',
    validUntil: '2023-12-22',
    status: 'expired' as const,
    doctor: 'Dr. Priya Basnet',
    hospital: 'Om Hospital & Research Center',
    items: [
      { medicineName: 'Paracetamol', genericName: 'Acetaminophen', dosage: '500mg', frequency: 'Three times daily after meals', duration: '7 days', route: 'Oral', instructions: 'Do not exceed 4g/day' },
      { medicineName: 'Cetirizine', genericName: 'Cetirizine HCl', dosage: '10mg', frequency: 'Once at night', duration: '5 days', route: 'Oral', instructions: 'May cause drowsiness — avoid driving' },
    ],
  },
]

export interface LabResult {
  parameter: string
  value: number
  unit: string
  referenceRange: string
  isAbnormal: boolean
}

export const MOCK_LAB_REPORTS = [
  {
    id: 'lb-1',
    date: '2024-11-20',
    testName: 'Complete Blood Count (CBC)',
    category: 'Hematology',
    orderedBy: 'Dr. Anita Sharma',
    status: 'completed' as const,
    results: [
      { parameter: 'Haemoglobin', value: 14.2, unit: 'g/dL', referenceRange: '13.5–17.5', isAbnormal: false },
      { parameter: 'WBC Count', value: 8200, unit: '/μL', referenceRange: '4,500–11,000', isAbnormal: false },
      { parameter: 'Platelet Count', value: 180000, unit: '/μL', referenceRange: '150,000–400,000', isAbnormal: false },
      { parameter: 'RBC Count', value: 4.8, unit: 'M/μL', referenceRange: '4.5–5.9', isAbnormal: false },
    ] as LabResult[],
  },
  {
    id: 'lb-2',
    date: '2024-11-20',
    testName: 'Lipid Profile',
    category: 'Biochemistry',
    orderedBy: 'Dr. Anita Sharma',
    status: 'completed' as const,
    results: [
      { parameter: 'Total Cholesterol', value: 210, unit: 'mg/dL', referenceRange: '<200', isAbnormal: true },
      { parameter: 'LDL Cholesterol', value: 135, unit: 'mg/dL', referenceRange: '<130', isAbnormal: true },
      { parameter: 'HDL Cholesterol', value: 48, unit: 'mg/dL', referenceRange: '>40', isAbnormal: false },
      { parameter: 'Triglycerides', value: 165, unit: 'mg/dL', referenceRange: '<150', isAbnormal: true },
    ] as LabResult[],
  },
  {
    id: 'lb-3',
    date: '2024-11-20',
    testName: 'Vitamin D (25-OH)',
    category: 'Biochemistry',
    orderedBy: 'Dr. Anita Sharma',
    status: 'completed' as const,
    results: [
      { parameter: '25-Hydroxyvitamin D', value: 12.5, unit: 'ng/mL', referenceRange: '30–100', isAbnormal: true },
    ] as LabResult[],
  },
  {
    id: 'lb-4',
    date: '2024-08-10',
    testName: 'Fasting Blood Glucose',
    category: 'Biochemistry',
    orderedBy: 'Dr. Anita Sharma',
    status: 'completed' as const,
    results: [
      { parameter: 'Fasting Glucose', value: 94, unit: 'mg/dL', referenceRange: '70–100', isAbnormal: false },
    ] as LabResult[],
  },
]

export const MOCK_VACCINATIONS = [
  { id: 'v-1', vaccineName: 'COVID-19 Booster', brand: 'Covishield (AstraZeneca)', doseNumber: 3, totalDoses: 3, administeredAt: '2023-04-15', nextDoseDue: null as string | null, site: 'Left deltoid', route: 'Intramuscular', facility: 'Kirtipur Hospital, Kathmandu', adverseReactions: 'Mild arm soreness for 1 day' },
  { id: 'v-2', vaccineName: 'Hepatitis B', brand: 'Engerix-B (GSK)', doseNumber: 3, totalDoses: 3, administeredAt: '2022-09-20', nextDoseDue: null as string | null, site: 'Right deltoid', route: 'Intramuscular', facility: 'NPHL, Teku, Kathmandu', adverseReactions: null as string | null },
  { id: 'v-3', vaccineName: 'Typhoid', brand: 'Typherix (GSK)', doseNumber: 1, totalDoses: 1, administeredAt: '2024-01-10', nextDoseDue: '2027-01-10', site: 'Left deltoid', route: 'Intramuscular', facility: 'Medicare National Hospital', adverseReactions: null as string | null },
  { id: 'v-4', vaccineName: 'Influenza (Seasonal)', brand: 'Vaxigrip Tetra', doseNumber: 1, totalDoses: 1, administeredAt: '2024-10-05', nextDoseDue: '2025-10-05', site: 'Left deltoid', route: 'Intramuscular', facility: 'Grande International Hospital', adverseReactions: null as string | null },
]

export const MOCK_AI_SUMMARY = {
  healthScore: 72,
  lastUpdated: '2024-11-20',
  findings: [
    { type: 'critical' as const, text: 'Severe Vitamin D deficiency (12.5 ng/mL — normal: 30–100)' },
    { type: 'warning' as const, text: 'LDL cholesterol mildly elevated (135 mg/dL — target: <130)' },
    { type: 'warning' as const, text: 'Blood pressure borderline (130/85 — improving from 140/90)' },
    { type: 'good' as const, text: 'Complete Blood Count fully within normal ranges' },
    { type: 'good' as const, text: 'Fasting blood glucose normal (94 mg/dL)' },
  ],
  recommendations: [
    'Complete the Vitamin D3 supplementation course (60,000 IU weekly)',
    'Continue Amlodipine 5mg and Telmisartan 40mg as prescribed',
    'Limit sodium to <2g/day — avoid processed and packaged foods',
    'Walk briskly for 30 minutes at least 5 days per week',
    'Repeat lipid panel in 3 months to monitor cholesterol response',
    'Schedule follow-up appointment with Dr. Sharma in February 2025',
  ],
  riskScores: [
    { name: 'Cardiovascular', score: 38, color: '#f59e0b' },
    { name: 'Diabetes', score: 14, color: '#10b981' },
    { name: 'Stroke', score: 22, color: '#10b981' },
  ],
}

export const MOCK_UPCOMING_APPOINTMENTS = [
  {
    id: 'apt-1',
    doctor: 'Dr. Anita Sharma',
    specialty: 'General Medicine',
    hospital: 'Grande International Hospital',
    scheduledAt: '2025-02-15T10:00:00',
    type: 'in_person' as const,
    status: 'scheduled' as const,
    reason: 'Blood pressure follow-up + lipid profile review',
  },
]

export const BLOOD_TYPE_DISPLAY: Record<string, string> = {
  A_POS: 'A+', A_NEG: 'A−', B_POS: 'B+', B_NEG: 'B−',
  O_POS: 'O+', O_NEG: 'O−', AB_POS: 'AB+', AB_NEG: 'AB−',
}
