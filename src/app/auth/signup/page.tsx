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
      <div className="auth-page-header">
        <h2 className="auth-page-title">
          Join as a {userType === 'freelancer' ? 'Freelancer' : 'Client'}
        </h2>
        <p className="auth-page-subtitle">
          {userType === 'freelancer' 
            ? 'Start your freelance journey and find amazing projects'
            : 'Find the perfect talent for your business needs'
          }
        </p>
      </div>

      {/* User Type Toggle */}
      <div className="user-type-toggle">
        <button
          type="button"
          onClick={() => setUserType('freelancer')}
          className={`user-type-btn ${userType === 'freelancer' ? 'active freelancer' : ''}`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Freelancer
        </button>
        <button
          type="button"
          onClick={() => setUserType('recruiter')}
          className={`user-type-btn ${userType === 'recruiter' ? 'active recruiter' : ''}`}
        >
          <Users className="w-4 h-4 mr-2" />
          Client
        </button>
      </div>

      {error && (
        <div className="auth-error-message">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSignup} className="auth-form">
        <div className="auth-form-row">
          <div>
            <label htmlFor="firstName" className="input-label">
              First name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="input-label">
              Last name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="input-label">
            Email address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="input-field"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="input-label">
            Password *
          </label>
          <div className="password-input-container">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className="input-field password-input"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle-btn"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <p className="input-help-text">Must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="input-label">
            Confirm password *
          </label>
          <div className="password-input-container">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="input-field password-input"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle-btn"
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
          className={`auth-submit-btn auth-submit-btn-${userType} ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner loading-spinner-sm"></div>
              <span className="ml-2">Creating account...</span>
            </div>
          ) : (
            `Create ${userType === 'freelancer' ? 'Freelancer' : 'Client'} Account`
          )}
        </button>
      </form>

      <div className="auth-switch-section">
        <p className="auth-switch-text">
          Already have an account?{' '}
          <Link href="/auth/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>

      <div className="auth-terms">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="auth-link">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="auth-link">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
