'use server'

import { redirect } from 'next/navigation'
import { LoginSchema, RegisterSchema } from '@/lib/definitions'
import { signToken, setAuthCookie, clearAuthCookie } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { findUserByEmail, createUser } from '@/lib/db'
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
    return { message: 'Invalid email or password.' }
  }

  const passwordMatch = await verifyPassword(password, user.passwordHash)
  if (!passwordMatch) {
    return { message: 'Invalid email or password.' }
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  await setAuthCookie(token)
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
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  await clearAuthCookie()
  redirect('/login')
}
