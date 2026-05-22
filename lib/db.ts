import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types/auth'

export interface User {
  id: string
  name: string
  email: string
  phone: string | null
  passwordHash: string
  role: UserRole
  createdAt: Date
}

const SELECT_USER = {
  id: true,
  name: true,
  email: true,
  phone: true,
  passwordHash: true,
  role: true,
  createdAt: true,
} as const

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: SELECT_USER,
  }) as Promise<User | null>
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
    select: SELECT_USER,
  }) as Promise<User | null>
}

export async function createUser(
  data: Omit<User, 'id' | 'createdAt'>,
): Promise<User> {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role,
    },
    select: SELECT_USER,
  }) as Promise<User>
}

export async function updateLastLogin(id: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  })
}
