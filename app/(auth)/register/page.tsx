'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'
import { register } from '@/app/actions/auth'
import { USER_ROLES, ROLE_META, ROLE_LABELS } from '@/types/auth'
import type { AuthFormState, UserRole } from '@/types/auth'

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < strength ? colors[strength - 1] : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Strength:{' '}
        <span className={`font-semibold ${strength < 2 ? 'text-red-500' : strength < 4 ? 'text-yellow-600' : 'text-emerald-600'}`}>
          {labels[Math.max(0, strength - 1)]}
        </span>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    register,
    undefined,
  )
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient')
  const [password, setPassword] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-full max-w-lg"
    >
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-7 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-white text-xl">
              Swastha Nepal <span className="text-emerald-200">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-white">Create your account</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Join millions accessing better healthcare
          </p>
        </div>

        <div className="px-8 py-8">
          {/* Global error */}
          {state?.message && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {USER_ROLES.map((role) => {
                  const meta = ROLE_META[role]
                  const isSelected = selectedRole === role
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                      <span className="text-xl">{meta.icon}</span>
                      <span
                        className={`text-xs font-semibold leading-tight ${
                          isSelected ? 'text-emerald-700' : 'text-slate-600'
                        }`}
                      >
                        {ROLE_LABELS[role]}
                      </span>
                    </button>
                  )
                })}
              </div>
              {/* Hidden input for form submission */}
              <input type="hidden" name="role" value={selectedRole} />
              {state?.errors?.role && (
                <p className="mt-1 text-xs text-red-600">{state.errors.role[0]}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Ramesh Sharma"
                className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                  state?.errors?.name ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {state?.errors?.name && (
                <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    state?.errors?.email ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {state?.errors?.email && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="+977-98XXXXXXXX"
                  className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    state?.errors?.phone ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {state?.errors?.phone && (
                  <p className="mt-1 text-xs text-red-600">{state.errors.phone[0]}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    state?.errors?.password ? 'border-red-400 bg-red-50' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthBar password={password} />
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    state?.errors?.confirmPassword
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {state?.errors?.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{state.errors.confirmPassword[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/20 mt-2"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-5 text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center mt-3 text-xs text-slate-400">
            By creating an account you agree to our{' '}
            <Link href="#" className="text-emerald-600 hover:underline">
              Terms
            </Link>{' '}
            &amp;{' '}
            <Link href="#" className="text-emerald-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
