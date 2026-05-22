export const MOCK_PHARMACIST = {
  id: 'ph-001',
  userId: 'u-ph-001',
  name: 'Sita Kumari Shrestha',
  pharmacyName: 'Nepal Pharmacy & Medical Store',
  licenseNumber: 'PH-2023-4521',
  address: 'New Baneshwor, Kathmandu',
}

export type RxStatus = 'pending' | 'verified' | 'dispensed' | 'rejected'

export interface PrescriptionItem {
  medicine: string
  dose: string
  frequency: string
  duration: string
  quantity: string
}

export interface PharmacyRx {
  id: string
  prescriptionDate: string
  patientName: string
  patientDob: string
  patientPhone: string
  doctorName: string
  doctorLicense: string
  hospital: string
  items: PrescriptionItem[]
  notes: string
  status: RxStatus
  dispensedAt?: string
}

export const MOCK_PRESCRIPTIONS: PharmacyRx[] = [
  {
    id: 'rx-001',
    prescriptionDate: '2025-05-20',
    patientName: 'Ramesh Bahadur Thapa',
    patientDob: '1990-05-15',
    patientPhone: '+977-9841234567',
    doctorName: 'Dr. Anita Sharma',
    doctorLicense: 'NMC-2015-4521',
    hospital: 'Grande International Hospital',
    items: [
      { medicine: 'Amlodipine 5mg', dose: '5mg', frequency: 'Once daily', duration: '30 days', quantity: '30 tabs' },
      { medicine: 'Telmisartan 40mg', dose: '40mg', frequency: 'Once daily', duration: '30 days', quantity: '30 tabs' },
    ],
    notes: 'Take after meals. Monitor BP weekly.',
    status: 'pending',
  },
  {
    id: 'rx-002',
    prescriptionDate: '2025-05-18',
    patientName: 'Sita Devi Adhikari',
    patientDob: '1978-11-02',
    patientPhone: '+977-9812367890',
    doctorName: 'Dr. Rajan Karki',
    doctorLicense: 'NMC-2010-2211',
    hospital: 'Norvic International Hospital',
    items: [
      { medicine: 'Metformin 500mg', dose: '500mg', frequency: 'Twice daily', duration: '60 days', quantity: '120 tabs' },
      { medicine: 'Atorvastatin 10mg', dose: '10mg', frequency: 'Once at night', duration: '60 days', quantity: '60 tabs' },
      { medicine: 'Aspirin 75mg', dose: '75mg', frequency: 'Once daily', duration: '60 days', quantity: '60 tabs' },
    ],
    notes: 'Diabetic patient. Advise dietary changes.',
    status: 'pending',
  },
  {
    id: 'rx-003',
    prescriptionDate: '2025-05-15',
    patientName: 'Bikash Rai',
    patientDob: '2001-03-20',
    patientPhone: '+977-9867123456',
    doctorName: 'Dr. Priya Basnet',
    doctorLicense: 'NMC-2018-7723',
    hospital: 'Om Hospital & Research Center',
    items: [
      { medicine: 'Amoxicillin 500mg', dose: '500mg', frequency: 'Three times daily', duration: '7 days', quantity: '21 caps' },
      { medicine: 'Paracetamol 500mg', dose: '500mg', frequency: 'As needed (max 3×/day)', duration: '5 days', quantity: '15 tabs' },
    ],
    notes: 'For URI. Complete the antibiotic course.',
    status: 'verified',
  },
  {
    id: 'rx-004',
    prescriptionDate: '2025-05-10',
    patientName: 'Gita Paudel',
    patientDob: '1965-07-14',
    patientPhone: '+977-9823001234',
    doctorName: 'Dr. Bijay Paudel',
    doctorLicense: 'NMC-2008-1101',
    hospital: 'KIST Medical College',
    items: [
      { medicine: 'Levothyroxine 50mcg', dose: '50mcg', frequency: 'Once daily (fasting)', duration: '90 days', quantity: '90 tabs' },
    ],
    notes: 'Hypothyroid patient. Take 30 min before breakfast.',
    status: 'dispensed',
    dispensedAt: '2025-05-11',
  },
]
