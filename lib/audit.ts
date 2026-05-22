// Audit logging — in-memory for dev, replace with Prisma insert in production

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

// In-memory ring buffer — last 500 entries
const MAX_ENTRIES = 500
const store: AuditEntry[] = []
let _seq = 0

export function writeAuditLog(
  entry: Omit<AuditEntry, 'id' | 'timestamp'>
): void {
  _seq++
  const record: AuditEntry = {
    ...entry,
    id: `audit-${_seq}`,
    timestamp: new Date().toISOString(),
  }
  store.push(record)
  if (store.length > MAX_ENTRIES) store.shift()
  // TODO: prisma.auditLog.create({ data: record })
}

export function getAuditLogs(limit = 100): AuditEntry[] {
  return store.slice(-limit).reverse()
}

export function getAuditLogsByUser(userId: string, limit = 50): AuditEntry[] {
  return store.filter((e) => e.userId === userId).slice(-limit).reverse()
}
