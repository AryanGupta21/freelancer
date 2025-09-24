// src/app/dashboard/freelancer/page.tsx - Updated Dashboard with complete profile management
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
    Briefcase, User, Settings, LogOut, Bell, Search,
    Star, DollarSign, Clock, Eye, ImageIcon, FileText,
    Building, GraduationCap, Edit, Upload
} from 'lucide-react'

interface Profile {
    first_name: string
    last_name: string
    email: string
}

interface FreelancerProfile {
    title: string
    description: string
    preferred_rate: number
    profile_completion_percentage: number
    is_available: boolean
    resume_url: string | null
}

export default function FreelancerDashboard() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [authChecking, setAuthChecking] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuthAndLoadProfile()
    }, [])

    const checkAuthAndLoadProfile = async () => {
        try {
            // Check if user is authenticated
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user) {
                console.log('No authenticated user, redirecting to login')
                router.push('/auth/login')
                return
            }

            console.log('User authenticated:', user.id)
            setAuthChecking(false)

            // Load profile data
            await loadProfile(user.id)

        } catch (err) {
            console.error('Auth check error:', err)
            router.push('/auth/login')
        }
    }

    const loadProfile = async (userId: string) => {
        try {
            // Get profile data
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', userId)
                .single()

            if (profileError) {
                console.error('Profile fetch error:', profileError)
                throw profileError
            }
            setProfile(profileData)

            // Get freelancer profile
            const { data: freelancerData, error: freelancerError } = await supabase
                .from('freelancer_profiles')
                .select('title, description, preferred_rate, profile_completion_percentage, is_available, resume_url')
                .eq('user_id', userId)
                .single()

            if (freelancerError && freelancerError.code !== 'PGRST116') {
                console.error('Freelancer profile fetch error:', freelancerError)
                throw freelancerError
            }

            // Set freelancer data or null if doesn't exist
            setFreelancerProfile(freelancerData || null)

        } catch (err) {
            console.error('Error loading profile:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    // Show loading while checking authentication
    if (authChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">FreelancePlatform</span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <Link
                                href="/browse-freelancers"
                                className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                Browse Freelancers
                            </Link>

                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Bell className="w-5 h-5" />
                            </button>

                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Bell className="w-5 h-5" />
                            </button>

                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {profile?.first_name} {profile?.last_name}
                                </span>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="p-2 text-gray-400 hover:text-red-600"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Success Message */}
                <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-green-800 mb-2">
                            Welcome to your Dashboard! 🎉
                        </h1>
                        <p className="text-green-700">
                            Your freelancer profile has been successfully created and saved to the database.
                        </p>
                    </div>
                </div>

                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome back, {profile?.first_name}!
                    </h2>
                    <p className="text-gray-600">
                        {freelancerProfile?.title || 'Complete your profile to start getting more opportunities'}
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Profile Views</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <Eye className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Proposals</p>
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                            <Briefcase className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Hourly Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${freelancerProfile?.preferred_rate || 0}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Profile Complete</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {freelancerProfile?.profile_completion_percentage || 0}%
                                </p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">Your Profile</h3>
                        <Link
                            href="/profile/edit"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Edit Profile
                        </Link>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-900">
                                {freelancerProfile?.title || 'Add your professional title'}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1">
                                {freelancerProfile?.description || 'Add a description of your services and experience'}
                            </p>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                ${freelancerProfile?.preferred_rate || 0}/hr
                            </span>
                            <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Available
                            </span>
                            {freelancerProfile?.resume_url && (
                                <span className="flex items-center text-green-600">
                                    <FileText className="w-4 h-4 mr-1" />
                                    Resume uploaded
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Management Section */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Profile Management</h3>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Link
                            href="/profile/edit"
                            className="block p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <Edit className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <span className="text-blue-700 font-medium text-sm">Basic Info</span>
                        </Link>

                        <Link
                            href="/profile/portfolio"
                            className="block p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            <ImageIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <span className="text-purple-700 font-medium text-sm">Portfolio</span>
                        </Link>

                        <Link
                            href="/profile/resume"
                            className="block p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <span className="text-green-700 font-medium text-sm">Resume</span>
                        </Link>

                        <Link
                            href="/profile/experience"
                            className="block p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        >
                            <Building className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                            <span className="text-orange-700 font-medium text-sm">Experience</span>
                        </Link>

                        <Link
                            href="/profile/credentials"
                            className="block p-4 text-center bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                            <GraduationCap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                            <span className="text-indigo-700 font-medium text-sm">Education</span>
                        </Link>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">Public Profile</h4>
                    <Link
                        href="/profile/preview"
                        className="block p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                        <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <span className="text-green-700 font-medium text-sm">Preview My Profile</span>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/jobs/browse"
                            className="block p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <span className="text-blue-700 font-medium">Browse Jobs</span>
                        </Link>

                        <Link
                            href="/profile/preview"
                            className="block p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                        >
                            <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <span className="text-green-700 font-medium">Preview Profile</span>
                        </Link>

                        <Link
                            href="/messages"
                            className="block p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                            <Bell className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <span className="text-purple-700 font-medium">Messages</span>
                        </Link>

                        <Link
                            href="/settings"
                            className="block p-4 text-center bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                            <span className="text-gray-700 font-medium">Settings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}