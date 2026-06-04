import { prisma } from '@/lib/prisma'

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'patient.view'
  | 'patient.update'
  | 'diagnosis.create'
  | 'prescription.create'
  | 'prescription.dispense'
  | 'lab.upload'
  | 'lab.mark_abnormal'
  | 'birth.register'
  | 'death.register'
  | 'ai.analysis'
  | 'admin.view'
  | 'privacy.update'
  | 'patient.identity_verified'

export interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userRole: string
  action: AuditAction
  resourceId?: string
  ipAddress?: string
  details?: string
  success: boolean
}

// In-memory ring buffer for getAuditLogs() reads (admin dashboard)
const MAX_ENTRIES = 500
const store: AuditEntry[] = []
let _seq = 0

export function writeAuditLog(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
  _seq++
  const record: AuditEntry = {
    ...entry,
    id: `audit-${_seq}`,
    timestamp: new Date().toISOString(),
  }

  store.push(record)
  if (store.length > MAX_ENTRIES) store.shift()

  // Persist to DB — fire and forget (don't await, non-blocking)
  const userId = entry.userId === 'unknown' ? undefined : entry.userId
  prisma.auditLog
    .create({
      data: {
        userId: userId ?? null,
        action: entry.action,
        resourceType: entry.action.split('.')[0],
        resourceId: entry.resourceId ?? null,
        newValues: entry.details ? { details: entry.details, success: entry.success } : undefined,
        ipAddress: entry.ipAddress ?? null,
      },
    })
    .catch(() => {
      // Audit failure must never crash the request
    })
}

export function getAuditLogs(limit = 100): AuditEntry[] {
  return store.slice(-limit).reverse()
}

export function getAuditLogsByUser(userId: string, limit = 50): AuditEntry[] {
  return store.filter((e) => e.userId === userId).slice(-limit).reverse()
}
