import { z } from 'zod'
import { USER_ROLES } from '@/types/auth'

export const LoginSchema = z.object({
  email: z.string().email({ error: 'Please enter a valid email address.' }).trim(),
  password: z.string().min(1, { error: 'Password is required.' }),
})

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, { error: 'Name must be at least 2 characters.' })
      .max(80, { error: 'Name is too long.' })
      .trim(),
    email: z.string().email({ error: 'Please enter a valid email address.' }).trim(),
    phone: z
      .string()
      .min(10, { error: 'Enter a valid phone number (min 10 digits).' })
      .regex(/^\+?[\d\s\-()]+$/, { error: 'Enter a valid phone number.' })
      .trim(),
    role: z.enum(USER_ROLES, { error: 'Please select a valid role.' }),
    password: z
      .string()
      .min(8, { error: 'Password must be at least 8 characters.' })
      .regex(/[A-Z]/, { error: 'Must contain at least one uppercase letter.' })
      .regex(/[0-9]/, { error: 'Must contain at least one number.' }),
    confirmPassword: z.string().min(1, { error: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const VerifyIdentitySchema = z
  .object({
    documentType: z.enum(['citizenship', 'birth_certificate'], {
      error: 'Select a document type.',
    }),
    documentNumber: z
      .string()
      .min(3, { error: 'Document number is required.' })
      .max(100, { error: 'Document number is too long.' })
      .trim(),
  })

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type VerifyIdentityInput = z.infer<typeof VerifyIdentitySchema>
