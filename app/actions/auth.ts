'use server'

import { redirect } from 'next/navigation'
import { LoginSchema, RegisterSchema } from '@/lib/definitions'
import { signToken, setAuthCookie, clearAuthCookie, getSession } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { findUserByEmail, createUser } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import type { AuthFormState } from '@/types/auth'

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData)
  const result = LoginSchema.safeParse(raw)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as NonNullable<AuthFormState>['errors'] }
  }

  const { email, password } = result.data
  const user = await findUserByEmail(email)

  if (!user) {
    writeAuditLog({ userId: 'unknown', userEmail: email, userRole: 'unknown', action: 'auth.login_failed', success: false })
    return { message: 'Invalid email or password.' }
  }

  const passwordMatch = await verifyPassword(password, user.passwordHash)
  if (!passwordMatch) {
    writeAuditLog({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'auth.login_failed', success: false })
    return { message: 'Invalid email or password.' }
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  await setAuthCookie(token)
  writeAuditLog({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'auth.login', success: true })
  redirect('/dashboard')
}

export async function register(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const raw = Object.fromEntries(formData)
  const result = RegisterSchema.safeParse(raw)

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as NonNullable<AuthFormState>['errors'] }
  }

  const { name, email, phone, role, password } = result.data

  const existing = await findUserByEmail(email)
  if (existing) {
    return { errors: { email: ['An account with this email already exists.'] } }
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({ name, email, phone, role, passwordHash })

  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  await setAuthCookie(token)
  writeAuditLog({ userId: user.id, userEmail: user.email, userRole: user.role, action: 'auth.login', details: 'new registration', success: true })
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  const session = await getSession()
  if (session) {
    writeAuditLog({ userId: session.sub, userEmail: session.email, userRole: session.role, action: 'auth.logout', success: true })
  }
  await clearAuthCookie()
  redirect('/login')
}
