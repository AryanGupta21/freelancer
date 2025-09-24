// src/app/auth/login/page.tsx - Debug version to see what's happening
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo('')
    setLoading(true)

    try {
      console.log('🔐 Starting login process...')
      setDebugInfo('Starting login...')
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw authError
      }
      
      console.log('✅ Auth successful:', authData.user?.id)
      setDebugInfo('Auth successful, fetching profile...')

      if (authData.user) {
        console.log('👤 Getting user profile...')
        
        // Get user profile to determine user type and completion status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, is_profile_complete, first_name, last_name')
          .eq('id', authData.user.id)
          .single()

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError)
          setDebugInfo(`Profile error: ${profileError.message}`)
          throw profileError
        }

        console.log('📋 Profile data:', profile)
        setDebugInfo(`Profile found: ${profile.user_type}, complete: ${profile.is_profile_complete}`)

        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 100))

        // Type assertion to handle TypeScript inference issues
        const userProfile = profile as {
          user_type: 'freelancer' | 'recruiter'
          is_profile_complete: boolean | null
          first_name: string | null
          last_name: string | null
        }

        console.log('🎯 User type:', userProfile.user_type)
        console.log('📊 Profile complete:', userProfile.is_profile_complete)

        // Redirect based on user type and profile completion
        if (userProfile.user_type === 'freelancer') {
          if (userProfile.is_profile_complete) {
            console.log('🏠 Redirecting to freelancer dashboard...')
            setDebugInfo('Redirecting to dashboard...')
            router.push('/dashboard/freelancer')
          } else {
            console.log('📝 Redirecting to onboarding...')
            setDebugInfo('Redirecting to onboarding...')
            router.push('/onboarding/skills')
          }
        } else {
          console.log('🏢 Redirecting to recruiter dashboard...')
          setDebugInfo('Redirecting to recruiter dashboard...')
          router.push('/dashboard/recruiter')
        }

        // Additional debug info
        setTimeout(() => {
          console.log('🔄 Router push completed')
          setDebugInfo(prev => prev + ' - Router push completed')
        }, 1000)
      }
    } catch (err) {
      console.error('💥 Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during login')
      setDebugInfo(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-600">Sign in to your account to continue</p>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-800">Debug: {debugInfo}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="ml-2">Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>

      {/* Quick signup links */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-center text-sm text-gray-600 mb-4">New to FreelancePlatform?</p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/auth/signup?type=freelancer"
            className="w-full py-2 px-4 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors text-center"
          >
            Join as Freelancer
          </Link>
          <Link
            href="/auth/signup?type=recruiter"
            className="w-full py-2 px-4 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors text-center"
          >
            Join as Client
          </Link>
        </div>
      </div>
    </div>
  )
}