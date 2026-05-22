// Lab technician data service — swap mock functions with Prisma calls when DB is live.

import {
  MOCK_LAB_TECH,
  MOCK_PENDING_ORDERS,
  MOCK_COMPLETED_REPORTS,
} from '@/lib/mock-lab-data'

export async function getLabTechProfile(_userId: string) {
  // TODO: prisma.user.findUnique({ where: { id: userId } })
  return { ...MOCK_LAB_TECH }
}

export async function getLabStats(_userId: string) {
  // TODO: prisma counts
  return {
    pendingOrders: MOCK_PENDING_ORDERS.filter((o) => o.status === 'pending').length,
    processingOrders: MOCK_PENDING_ORDERS.filter((o) => o.status === 'processing').length,
    completedToday: MOCK_COMPLETED_REPORTS.length,
    abnormalReports: MOCK_COMPLETED_REPORTS.filter((r) => r.hasAbnormal).length,
  }
}

export async function getPendingOrders(_userId: string) {
  // TODO: prisma.labReport.findMany({ where: { status: { in: ['pending','processing'] } }, include: { patient: { include: { user: true } }, orderedBy: { include: { user: true } } } })
  return [...MOCK_PENDING_ORDERS]
}

export async function getAllLabReports(_userId: string) {
  // TODO: prisma.labReport.findMany({ where: { processedById: userId }, orderBy: { createdAt: 'desc' } })
  return [...MOCK_COMPLETED_REPORTS]
}
