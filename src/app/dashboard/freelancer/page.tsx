// src/app/dashboard/freelancer/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Briefcase, User, Settings, LogOut, Bell, Search,
  Star, DollarSign, Clock, Eye, ImageIcon, FileText,
  Building, GraduationCap, Edit
} from 'lucide-react'

interface Profile {
  first_name: string
  last_name: string
  email: string
}

interface FreelancerProfile {
  title: string
  description: string
  preferred_rate: number | null
  profile_completion_percentage: number | null
  is_available: boolean | null
  resume_url: string | null
}

export default function FreelancerDashboard() {
  const router = useRouter()
  const [authChecking, setAuthChecking] = useState(true)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfile | null>(null)
  const [showCreatedBanner, setShowCreatedBanner] = useState(false)

  useEffect(() => {
    // detect ?created=1 for one-time success banner
    if (typeof window !== 'undefined') {
      const created = new URLSearchParams(window.location.search).get('created') === '1'
      setShowCreatedBanner(created)
    }
    checkAuthAndLoad()
  }, [])

  const fullName = useMemo(
    () => (profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : ''),
    [profile]
  )

  async function checkAuthAndLoad() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/auth/login')
        return
      }
      setAuthChecking(false)

      setLoading(true)
      const [pRes, fRes] = await Promise.all([
        supabase.from('profiles')
          .select('first_name,last_name,email')
          .eq('id', user.id)
          .single(),
        supabase.from('freelancer_profiles')
          .select('title,description,preferred_rate,profile_completion_percentage,is_available,resume_url')
          .eq('user_id', user.id)
          .maybeSingle()
      ])

      if (pRes.error) throw pRes.error
      setProfile(pRes.data as Profile)

      if (fRes.error) throw fRes.error
      setFreelancerProfile((fRes.data as FreelancerProfile) ?? null)
    } catch {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (authChecking) {
    return <ScreenCenter message="Checking authentication..." />
  }
  if (loading) {
    return <ScreenCenter message="Loading dashboard..." />
  }

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Header
        name={fullName}
        onSignOut={handleSignOut}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-8">
        {showCreatedBanner && (
          <div className="relative rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <button
              aria-label="Dismiss"
              onClick={() => setShowCreatedBanner(false)}
              className="absolute right-3 top-3 text-green-700/70 hover:text-green-800"
            >
              ×
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-green-800">Welcome to your dashboard 🎉</h1>
            <p className="text-green-700">Your freelancer profile was created successfully.</p>
          </div>
        )}

        {/* ...existing code... */}

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Profile Views"
            value="0"
            icon={<Eye className="h-5 w-5 text-gray-700" />}
          />
          <StatCard
            label="Active Proposals"
            value="0"
            icon={<Briefcase className="h-5 w-5 text-gray-700" />}
          />
          <StatCard
            label="Hourly Rate"
            value={freelancerProfile?.preferred_rate != null ? `$${freelancerProfile.preferred_rate}` : '—'}
            icon={<DollarSign className="h-5 w-5 text-gray-700" />}
          />
          <StatCard
            label="Profile Complete"
            value={freelancerProfile?.profile_completion_percentage != null
              ? `${freelancerProfile.profile_completion_percentage}%`
              : '—'}
            icon={<Star className="h-5 w-5 text-gray-700" />}
          />
        </section>

        {/* Profile overview */}
        <section className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Profile</h3>
            <Link
              href="/profile/edit"
              className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </div>

          {/* ...existing code... */}
        </section>

        {/* Profile management */}
        <section className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Profile Management</h3>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <ActionTile href="/profile/edit" icon={<Edit className="h-6 w-6 text-gray-700" />} label="Basic Info" />
            <ActionTile href="/profile/portfolio" icon={<ImageIcon className="h-6 w-6 text-gray-700" />} label="Portfolio" />
            <ActionTile href="/profile/resume" icon={<FileText className="h-6 w-6 text-gray-700" />} label="Resume" />
            <ActionTile href="/profile/experience" icon={<Building className="h-6 w-6 text-gray-700" />} label="Experience" />
            <ActionTile href="/profile/credentials" icon={<GraduationCap className="h-6 w-6 text-gray-700" />} label="Education" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ActionTile href="/profile/preview" icon={<Eye className="h-6 w-6 text-green-600" />} label="Preview Profile" emphasis />
            <ActionTile href="/jobs/browse" icon={<Briefcase className="h-6 w-6 text-gray-700" />} label="Browse Jobs" />
          </div>
        </section>

        {/* Quick actions */}
        <section className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ActionTile href="/messages" icon={<Bell className="h-6 w-6 text-gray-700" />} label="Messages" />
            <ActionTile href="/settings" icon={<Settings className="h-6 w-6 text-gray-700" />} label="Settings" />
          </div>
        </section>
      </main>
    </div>
  )
}

/* ---------- Small presentational components ---------- */

function ScreenCenter({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

function Header({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900">Job Portal.AI - Freelance</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search jobs"
                type="text"
                placeholder="Search jobs..."
                className="w-64 rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            <Link href="/browse-freelancers" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Browse Freelancers
            </Link>

            <Link
              href="/messages"
              aria-label="Notifications"
              className="rounded-lg p-2 text-gray-500 hover:bg-[#f5f5f0] hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <Bell className="h-5 w-5" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f0]">
                <User className="h-5 w-5 text-gray-700" />
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-900">{name || '—'}</span>
            </div>

            <button
              onClick={onSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f5f5f0]">
          {icon}
        </div>
      </div>
    </div>
  )
}

function ActionTile({
  href,
  icon,
  label,
  emphasis
}: {
  href: string
  icon: React.ReactNode
  label: string
  emphasis?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 ${
        emphasis ? 'ring-1 ring-green-200' : ''
      }`}
    >
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#f5f5f0]">
        {icon}
      </div>
      <div className="text-center text-sm font-medium text-gray-800 group-hover:text-gray-900">{label}</div>
    </Link>
  )
}