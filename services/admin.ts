import {
  ADMIN_SUMMARY,
  DISEASE_STATS,
  DISTRICT_STATS,
  HIGH_RISK_PATIENTS,
  VACCINATION_STATS,
  HOSPITAL_ACTIVITY,
  MONTHLY_TRENDS,
} from '@/lib/mock-admin-data'
import { getAuditLogs } from '@/lib/audit'

export async function getAdminSummary(_userId: string) {
  return ADMIN_SUMMARY
}

export async function getDiseaseStats(_userId: string) {
  return DISEASE_STATS
}

export async function getDistrictStats(_userId: string) {
  return DISTRICT_STATS
}

export async function getHighRiskPatients(_userId: string) {
  return HIGH_RISK_PATIENTS
}

export async function getVaccinationStats(_userId: string) {
  return VACCINATION_STATS
}

export async function getHospitalActivity(_userId: string) {
  return HOSPITAL_ACTIVITY
}

export async function getMonthlyTrends(_userId: string) {
  return MONTHLY_TRENDS
}

export async function getAdminAuditLogs(_userId: string, limit = 100) {
  return getAuditLogs(limit)
}
