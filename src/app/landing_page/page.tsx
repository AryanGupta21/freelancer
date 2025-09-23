// src/app/page.tsx - Main Landing Page
'use client'

import Link from 'next/link'
import { ArrowRight, Users, Briefcase, Star, Shield, Clock } from 'lucide-react'
import { Session, SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import JobPostManager from '../../components/ui/JobPostManager';
import { supabase } from '../../lib/supabase';
import Navbar from '@/components/ui/NavBar'

export default function LandingPage() {

  const [session, setSession] = useState<Session|null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Find the perfect
            <span className="text-blue-600 block">freelance services</span>
            for your business
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with skilled freelancers or offer your expertise to clients worldwide. 
            Start your journey in the freelance economy today.
          </p>
        </div>

        {/* User Type Selection Cards */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hire Freelancers Card */}
            <Link href="/auth/signup?type=recruiter" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Hire Freelancers</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Find skilled professionals for your projects. From web development to content creation, 
                    discover talent that matches your needs.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Access to verified professionals
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      Secure payment protection
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      24/7 customer support
                    </div>
                  </div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors flex items-center justify-center">
                    Get Started as Client
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Find Work Card */}
            <Link href="/auth/signup?type=freelancer" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-green-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Find Work</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Showcase your skills and connect with clients looking for your expertise. 
                    Build your freelance career and work on your terms.
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Showcase your portfolio
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      Direct client communication
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      Flexible work schedule
                    </div>
                  </div>
                  <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold group-hover:bg-green-700 transition-colors flex items-center justify-center">
                    Get Started as Freelancer
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600 text-sm">Active Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">5K+</div>
                <div className="text-gray-600 text-sm">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600 text-sm">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600 text-sm">Support Available</div>
              </div>
            </div>
          </div>
        </div>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FreelancePlatform</span>
            </div>
            <p className="text-gray-400 mb-6">
              Connecting talent with opportunity, one project at a time.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}