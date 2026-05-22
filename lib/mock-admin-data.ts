// Admin analytics mock data — replace with real Prisma aggregations

export const ADMIN_SUMMARY = {
  totalPatients: 15_243,
  totalDoctors: 342,
  totalPharmacists: 89,
  totalLabTechs: 156,
  activePrescriptions: 8_921,
  pendingLabOrders: 147,
  emergencyQRScans: 1_204,
  diseaseAlerts: 3,
}

export const DISEASE_STATS = [
  { name: 'Hypertension',       count: 3241, trend: +4.2 },
  { name: 'Type 2 Diabetes',    count: 2876, trend: +6.1 },
  { name: 'Viral URI / Cold',   count: 1982, trend: -8.3 },
  { name: 'Vit D Deficiency',   count: 1654, trend: +2.7 },
  { name: 'Dengue',             count: 987,  trend: +12.4 },
  { name: 'Typhoid',            count: 754,  trend: -3.1 },
  { name: 'Asthma',             count: 612,  trend: +1.5 },
  { name: 'Iron Deficiency Anaemia', count: 589, trend: -0.8 },
  { name: 'Tuberculosis',       count: 234,  trend: -6.2 },
  { name: 'Malaria',            count: 187,  trend: -9.7 },
]

export const DISTRICT_STATS = [
  { district: 'Kathmandu',  province: 'Bagmati',      patients: 4_211, highRisk: 312, hospitals: 48 },
  { district: 'Lalitpur',   province: 'Bagmati',      patients: 1_892, highRisk: 143, hospitals: 22 },
  { district: 'Bhaktapur',  province: 'Bagmati',      patients: 1_041, highRisk: 78,  hospitals: 14 },
  { district: 'Pokhara',    province: 'Gandaki',      patients: 1_487, highRisk: 109, hospitals: 18 },
  { district: 'Chitwan',    province: 'Bagmati',      patients: 876,   highRisk: 62,  hospitals: 12 },
  { district: 'Butwal',     province: 'Lumbini',      patients: 723,   highRisk: 54,  hospitals: 9  },
  { district: 'Dharan',     province: 'Province 1',   patients: 612,   highRisk: 47,  hospitals: 8  },
  { district: 'Biratnagar', province: 'Province 1',   patients: 987,   highRisk: 71,  hospitals: 13 },
  { district: 'Nepalgunj',  province: 'Lumbini',      patients: 534,   highRisk: 41,  hospitals: 7  },
  { district: 'Dhangadhi',  province: 'Sudurpashchim', patients: 412,  highRisk: 33,  hospitals: 5  },
]

export const HIGH_RISK_PATIENTS = [
  {
    id: 'p-hr-001', name: 'Rajan Shrestha',   age: 68, district: 'Kathmandu',
    conditions: ['Cardiac Failure', 'CKD Stage 3', 'Hypertension'],
    lastVisit: '2025-05-18', riskScore: 94,
    assignedDoctor: 'Dr. Anita Sharma',
  },
  {
    id: 'p-hr-002', name: 'Kamala Gurung',    age: 72, district: 'Pokhara',
    conditions: ['Type 1 Diabetes', 'Peripheral Neuropathy', 'Retinopathy'],
    lastVisit: '2025-05-15', riskScore: 88,
    assignedDoctor: 'Dr. Rajan Karki',
  },
  {
    id: 'p-hr-003', name: 'Binod Yadav',      age: 55, district: 'Biratnagar',
    conditions: ['COPD', 'Active Tuberculosis', 'Malnutrition'],
    lastVisit: '2025-05-20', riskScore: 85,
    assignedDoctor: 'Dr. Priya Basnet',
  },
  {
    id: 'p-hr-004', name: 'Shanti Limbu',     age: 61, district: 'Dharan',
    conditions: ['Breast Cancer Stage II', 'Post-chemotherapy'],
    lastVisit: '2025-05-19', riskScore: 82,
    assignedDoctor: 'Dr. Bijay Paudel',
  },
  {
    id: 'p-hr-005', name: 'Gopal Maharjan',   age: 78, district: 'Lalitpur',
    conditions: ['Stroke (recovering)', 'AF', 'Hypertension', 'Diabetes'],
    lastVisit: '2025-05-17', riskScore: 79,
    assignedDoctor: 'Dr. Anita Sharma',
  },
]

export const VACCINATION_STATS = [
  { vaccine: 'BCG',          covered: 94, target: 100, beneficiaries: 14_328 },
  { vaccine: 'COVID-19',     covered: 89, target: 100, beneficiaries: 13_566 },
  { vaccine: 'OPV (Polio)',  covered: 91, target: 100, beneficiaries: 13_871 },
  { vaccine: 'DPT',          covered: 87, target: 100, beneficiaries: 13_261 },
  { vaccine: 'Hepatitis B',  covered: 88, target: 100, beneficiaries: 13_414 },
  { vaccine: 'MMR',          covered: 82, target: 100, beneficiaries: 12_499 },
  { vaccine: 'Typhoid',      covered: 67, target: 80,  beneficiaries: 10_213 },
  { vaccine: 'HPV',          covered: 45, target: 70,  beneficiaries: 6_859  },
]

export const HOSPITAL_ACTIVITY = [
  {
    name: 'Grande International Hospital', district: 'Kathmandu',
    type: 'Private', beds: 300, patients: 2_341, doctorsActive: 87,
    prescriptionsIssued: 1_876, labTestsDone: 3_421,
  },
  {
    name: 'Norvic International Hospital', district: 'Kathmandu',
    type: 'Private', beds: 200, patients: 1_789, doctorsActive: 64,
    prescriptionsIssued: 1_432, labTestsDone: 2_876,
  },
  {
    name: 'Bir Hospital', district: 'Kathmandu',
    type: 'Government', beds: 600, patients: 3_102, doctorsActive: 112,
    prescriptionsIssued: 2_876, labTestsDone: 5_234,
  },
  {
    name: 'Gandaki Medical College', district: 'Pokhara',
    type: 'Teaching', beds: 450, patients: 1_243, doctorsActive: 76,
    prescriptionsIssued: 987, labTestsDone: 2_102,
  },
  {
    name: 'BP Koirala Institute', district: 'Dharan',
    type: 'Government', beds: 500, patients: 987, doctorsActive: 58,
    prescriptionsIssued: 812, labTestsDone: 1_654,
  },
]

export const MONTHLY_TRENDS = [
  { month: 'Dec', patients: 1120, prescriptions: 834, labTests: 1203 },
  { month: 'Jan', patients: 1340, prescriptions: 989, labTests: 1456 },
  { month: 'Feb', patients: 1201, prescriptions: 901, labTests: 1312 },
  { month: 'Mar', patients: 1567, prescriptions: 1123, labTests: 1789 },
  { month: 'Apr', patients: 1432, prescriptions: 1034, labTests: 1654 },
  { month: 'May', patients: 1689, prescriptions: 1234, labTests: 1987 },
]
