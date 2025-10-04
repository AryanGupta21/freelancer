// src/app/auth/layout.tsx - Authentication Layout
import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      <div className="auth-header">
        <Link href="/" className="auth-logo">
          <span className="auth-logo-text">FreelancePlatform</span>
        </Link>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          {children}
        </div>
      </div>

      <div className="auth-footer">
        <Link href="/" className="auth-back-link">
          ← Back to homepage
        </Link>
      </div>
    </div>
  )
}