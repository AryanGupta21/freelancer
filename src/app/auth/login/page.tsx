// src/app/auth/login/page.tsx - Updated with user type handling
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Globe, Users, Briefcase } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get('type') // 'client' or 'freelancer'

  const [selectedType, setSelectedType] = useState<'client' | 'freelancer'>(
    (userType as 'client' | 'freelancer') || 'client'
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      if (data.user) {
        // Get user profile to determine actual user type
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, is_profile_complete')
          .eq('id', data.user.id)
          .single()

        if (profileError) throw profileError

        // Redirect based on actual user type
        if (profile.user_type === 'freelancer') {
          if (profile.is_profile_complete) {
            router.push('/dashboard/freelancer')
          } else {
            router.push('/onboarding/skills')
          }
        } else if (profile.user_type === 'recruiter') {
          router.push('/dashboard/client')
        } else {
          // User exists but no profile type set, update it
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ user_type: selectedType === 'client' ? 'recruiter' : 'freelancer' })
            .eq('id', data.user.id)

          if (updateError) throw updateError

          if (selectedType === 'freelancer') {
            router.push('/onboarding/skills')
          } else {
            router.push('/dashboard/client')
          }
        }
      }

    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FreelanceHub</span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">
            {selectedType === 'freelancer' 
              ? 'Sign in to your seller account' 
              : 'Sign in to hire talented freelancers'
            }
          </p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setSelectedType('client')}
              className={`flex items-center justify-center py-3 px-4 rounded-md font-medium text-sm transition-colors ${
                selectedType === 'client'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              I'm a Client
            </button>
            <button
              onClick={() => setSelectedType('freelancer')}
              className={`flex items-center justify-center py-3 px-4 rounded-md font-medium text-sm transition-colors ${
                selectedType === 'freelancer'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              I'm a Freelancer
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
              } transition-colors`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to FreelanceHub?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/auth/signup?type=${selectedType}`}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Homepage */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-green-600">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}