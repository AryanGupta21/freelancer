// src/app/auth/signup/page.tsx - Fixed Signup Page
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Users, Briefcase, AlertCircle } from 'lucide-react'

type UserType = 'freelancer' | 'recruiter'

export default function SignupPage() {
  const [userType, setUserType] = useState<UserType>('freelancer')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const type = searchParams.get('type') as UserType
    if (type === 'freelancer' || type === 'recruiter') {
      setUserType(type)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setLoading(true)

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            user_type: userType
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile record (bypass TypeScript checking)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userType,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            is_profile_complete: false
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error('Failed to create user profile')
        }

        // Redirect based on user type
        if (userType === 'freelancer') {
          router.push('/onboarding/skills')
        } else {
          router.push('/dashboard/recruiter')
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Join as a {userType === 'freelancer' ? 'Freelancer' : 'Client'}
        </h2>
        <p className="text-gray-600">
          {userType === 'freelancer' 
            ? 'Start your freelance journey and find amazing projects'
            : 'Find the perfect talent for your business needs'
          }
        </p>
      </div>

      {/* User Type Toggle */}
      <div className="flex mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setUserType('freelancer')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            userType === 'freelancer'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Freelancer
        </button>
        <button
          type="button"
          onClick={() => setUserType('recruiter')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            userType === 'recruiter'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Client
        </button>
      </div>

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

      <form onSubmit={handleSignup} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address *
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
            Password *
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
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password *
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
            userType === 'freelancer'
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''} focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="ml-2">Creating account...</span>
            </div>
          ) : (
            `Create ${userType === 'freelancer' ? 'Freelancer' : 'Client'} Account`
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-blue-600 hover:text-blue-500">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
