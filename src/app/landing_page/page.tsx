// src/app/landing_page/page.tsx - Landing Page
'use client'

import Link from 'next/link'
import { ArrowRight, Users, Briefcase, Star, Shield, Clock } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1 className="hero-title">
          Find the perfect
          <span className="hero-title-accent">freelance services</span>
          for your business
        </h1>
        <p className="hero-subtitle">
          Connect with skilled freelancers or offer your expertise to clients worldwide. 
          Start your journey in the freelance economy today.
        </p>
      </div>

      {/* User Type Selection Cards */}
      <div className="user-type-section">
        <div className="user-type-grid">
          {/* Hire Freelancers Card */}
          <Link href="/auth/signup?type=recruiter" className="user-type-card-link">
            <div className="user-type-card user-type-card-recruiter">
              <div className="user-type-icon-container">
                <Users className="user-type-icon" />
              </div>
              <h2 className="user-type-title">Hire Freelancers</h2>
              <p className="user-type-description">
                Find skilled professionals for your projects. From web development to content creation, 
                discover talent that matches your needs.
              </p>
              <div className="user-type-features">
                <div className="user-type-feature">
                  <Star className="user-type-feature-icon user-type-feature-icon-yellow" />
                  Access to verified professionals
                </div>
                <div className="user-type-feature">
                  <Shield className="user-type-feature-icon user-type-feature-icon-green" />
                  Secure payment protection
                </div>
                <div className="user-type-feature">
                  <Clock className="user-type-feature-icon user-type-feature-icon-blue" />
                  24/7 customer support
                </div>
              </div>
              <div className="user-type-cta user-type-cta-recruiter">
                Get Started as Client
                <ArrowRight className="user-type-cta-icon" />
              </div>
            </div>
          </Link>

          {/* Find Work Card */}
          <Link href="/auth/signup?type=freelancer" className="user-type-card-link">
            <div className="user-type-card user-type-card-freelancer">
              <div className="user-type-icon-container">
                <Briefcase className="user-type-icon" />
              </div>
              <h2 className="user-type-title">Find Work</h2>
              <p className="user-type-description">
                Showcase your skills and connect with clients looking for your expertise. 
                Build your freelance career and work on your terms.
              </p>
              <div className="user-type-features">
                <div className="user-type-feature">
                  <Star className="user-type-feature-icon user-type-feature-icon-yellow" />
                  Showcase your portfolio
                </div>
                <div className="user-type-feature">
                  <Shield className="user-type-feature-icon user-type-feature-icon-green" />
                  Direct client communication
                </div>
                <div className="user-type-feature">
                  <Clock className="user-type-feature-icon user-type-feature-icon-blue" />
                  Flexible work schedule
                </div>
              </div>
              <div className="user-type-cta user-type-cta-freelancer">
                Get Started as Freelancer
                <ArrowRight className="user-type-cta-icon" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Active Freelancers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5K+</span>
            <span className="stat-label">Projects Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Client Satisfaction</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Support Available</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-bottom">
          <p>&copy; 2024 Job Portal.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}