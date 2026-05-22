'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { login } from '@/app/actions/auth'
import type { AuthFormState } from '@/types/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto w-full max-w-md"
    >
      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-white text-xl">
              Swastha Nepal <span className="text-emerald-200">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-white">Welcome back</h1>
          <p className="text-emerald-100 text-sm mt-1">Sign in to your health account</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {/* Global error message */}
          {state?.message && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Email */}
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
                  state?.errors?.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
                }`}
              />
              {state?.errors?.email && (
                <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                    state?.errors?.password
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-300 bg-white'
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
              {state?.errors?.password && (
                <p className="mt-1 text-xs text-red-600">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-emerald-500/20"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Emergency Access */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-sm transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Emergency Access (No Login Required)
          </Link>

          <p className="text-center mt-6 text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center mt-4 text-slate-500 text-xs">
        By signing in you agree to our{' '}
        <Link href="#" className="text-emerald-400 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-emerald-400 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </motion.div>
  )
}
