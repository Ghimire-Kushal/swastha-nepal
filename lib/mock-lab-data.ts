// Mock lab data — swap with Prisma queries when DB is live

export const MOCK_LAB_TECH = {
  id: 'lt-001',
  userId: 'u-004',
  name: 'Raju Karmacharya',
  labName: 'Grande International Hospital — Pathology & Radiology',
  certificationNumber: 'NABL-2022-0891',
}

export const MOCK_PENDING_ORDERS = [
  {
    id: 'order-1',
    patientId: 'p-001',
    patientName: 'Ramesh Bahadur Thapa',
    patientAge: 34,
    orderedBy: 'Dr. Anita Sharma',
    orderedAt: '2025-02-15T09:15:00',
    tests: ['Complete Blood Count', 'Lipid Profile', 'Fasting Glucose', 'HbA1c'],
    priority: 'routine' as const,
    sampleType: 'Blood',
    notes: 'Fasting sample required. Patient hypertensive.',
    status: 'pending' as const,
  },
  {
    id: 'order-2',
    patientId: 'p-002',
    patientName: 'Sita Kumari Adhikari',
    patientAge: 39,
    orderedBy: 'Dr. Anita Sharma',
    orderedAt: '2025-02-15T09:45:00',
    tests: ['TSH', 'Free T4', 'HbA1c', 'Fasting Glucose'],
    priority: 'urgent' as const,
    sampleType: 'Blood',
    notes: 'Diabetic patient on Metformin. Check thyroid panel.',
    status: 'processing' as const,
  },
  {
    id: 'order-3',
    patientId: 'p-003',
    patientName: 'Bikash Rai',
    patientAge: 47,
    orderedBy: 'Dr. Anita Sharma',
    orderedAt: '2025-02-15T10:30:00',
    tests: ['Chest X-Ray', 'Spirometry', 'IgE Total', 'Eosinophil Count'],
    priority: 'routine' as const,
    sampleType: 'Blood + Imaging',
    notes: 'Asthma follow-up. X-ray for hyperinflation assessment.',
    status: 'pending' as const,
  },
  {
    id: 'order-4',
    patientId: 'p-004',
    patientName: 'Mina Tamang',
    patientAge: 26,
    orderedBy: 'Dr. Anita Sharma',
    orderedAt: '2025-02-14T14:00:00',
    tests: ['Pelvic Ultrasound', 'FSH', 'LH', 'Testosterone', 'AMH', 'CBC'],
    priority: 'routine' as const,
    sampleType: 'Blood + Imaging',
    notes: 'PCOS workup. Ultrasound on day 2–5 of cycle.',
    status: 'pending' as const,
  },
]

export interface LabResultRow {
  parameter: string
  value: number | string
  unit: string
  referenceRange: string
  isAbnormal: boolean
}

export const MOCK_COMPLETED_REPORTS = [
  {
    id: 'rep-1',
    patientId: 'p-002',
    patientName: 'Sita Kumari Adhikari',
    testName: 'HbA1c + Thyroid Panel',
    category: 'Biochemistry',
    uploadedAt: '2025-02-14T16:30:00',
    technician: 'Raju Karmacharya',
    sentToDoctor: true,
    doctorName: 'Dr. Anita Sharma',
    hasAbnormal: true,
    abnormalCount: 2,
    fileUrl: null as string | null,
    results: [
      { parameter: 'HbA1c', value: 8.2, unit: '%', referenceRange: '<5.7', isAbnormal: true },
      { parameter: 'TSH', value: 6.8, unit: 'mIU/L', referenceRange: '0.4–4.0', isAbnormal: true },
      { parameter: 'Free T4', value: 1.1, unit: 'ng/dL', referenceRange: '0.8–1.8', isAbnormal: false },
    ] as LabResultRow[],
  },
  {
    id: 'rep-2',
    patientId: 'p-001',
    patientName: 'Ramesh Bahadur Thapa',
    testName: 'CBC + Lipid Profile',
    category: 'Hematology / Biochemistry',
    uploadedAt: '2025-02-13T14:00:00',
    technician: 'Raju Karmacharya',
    sentToDoctor: true,
    doctorName: 'Dr. Anita Sharma',
    hasAbnormal: true,
    abnormalCount: 3,
    fileUrl: null as string | null,
    results: [
      { parameter: 'Total Cholesterol', value: 210, unit: 'mg/dL', referenceRange: '<200', isAbnormal: true },
      { parameter: 'LDL', value: 135, unit: 'mg/dL', referenceRange: '<130', isAbnormal: true },
      { parameter: 'Triglycerides', value: 165, unit: 'mg/dL', referenceRange: '<150', isAbnormal: true },
      { parameter: 'Haemoglobin', value: 14.2, unit: 'g/dL', referenceRange: '13.5–17.5', isAbnormal: false },
    ] as LabResultRow[],
  },
]
