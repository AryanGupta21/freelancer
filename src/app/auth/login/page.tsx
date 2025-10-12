// src/app/auth/login/page.tsx - Login Page
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
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) throw authError

      if (authData.user) {
        // Get user profile to determine user type and completion status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type, is_profile_complete')
          .eq('id', authData.user.id)
          .single()

        if (profileError) throw profileError

        // Type assertion to handle TypeScript inference issues
        const userProfile = profile as {
          user_type: 'freelancer' | 'recruiter'
          is_profile_complete: boolean | null
        }

        // Redirect based on user type and profile completion
        if (userProfile.user_type === 'freelancer') {
          if (userProfile.is_profile_complete) {
            router.push('/dashboard/freelancer')
          } else {
            router.push('/onboarding/skills')
          }
        } else {
          router.push('/dashboard/recruiter')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="auth-page-header">
        <h2 className="auth-page-title">Welcome back</h2>
        <p className="auth-page-subtitle">Sign in to your account to continue</p>
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

      <form onSubmit={handleLogin} className="auth-form">
        <div>
          <label htmlFor="email" className="input-label">
            Email address
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
            Password
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
        </div>

        <div className="auth-form-options">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="checkbox-input"
            />
            <label htmlFor="remember-me" className="checkbox-label">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link href="/auth/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`auth-submit-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="loading-spinner loading-spinner-sm"></div>
              <span className="ml-2">Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <div className="auth-switch-section">
        <p className="auth-switch-text">
          Don&apos;t have an account?
          <Link href="/auth/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>

      {/* Quick signup links */}
      <div className="auth-quick-signup">
        <p className="auth-quick-signup-title">New to FreelancePlatform?</p>
        <div className="auth-quick-signup-buttons">
          <Link href="/auth/signup?type=freelancer" className="auth-quick-btn auth-quick-btn-freelancer">
            Join as Freelancer
          </Link>
          <Link href="/auth/signup?type=recruiter" className="auth-quick-btn auth-quick-btn-client">
            Join as Client
          </Link>
        </div>
      </div>
    </div>
  )
}
