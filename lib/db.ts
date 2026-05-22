import type { UserRole } from '@/types/auth'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  role: UserRole
  createdAt: Date
}

// In-memory store — replace with your database (PostgreSQL, MongoDB, etc.)
// The globalThis pattern persists across Next.js HMR restarts in development.
const g = globalThis as unknown as { __users?: Map<string, User>; __nextId?: number }
const users: Map<string, User> = g.__users ?? (g.__users = new Map())
let nextId = g.__nextId ?? (g.__nextId = 1)

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalized = email.toLowerCase().trim()
  for (const user of users.values()) {
    if (user.email === normalized) return user
  }
  return null
}

export async function findUserById(id: string): Promise<User | null> {
  return users.get(id) ?? null
}

export async function createUser(
  data: Omit<User, 'id' | 'createdAt'>,
): Promise<User> {
  const id = String(g.__nextId = ++nextId)
  const user: User = {
    ...data,
    email: data.email.toLowerCase().trim(),
    id,
    createdAt: new Date(),
  }
  users.set(id, user)
  return user
}
