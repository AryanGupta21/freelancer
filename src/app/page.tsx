// src/app/page.tsx - Main Landing Page
'use client'

import Link from 'next/link'
import { ArrowRight, Users, Briefcase, Star, Shield, Clock } from 'lucide-react'
import { useEffect } from 'react'

export default function LandingPage() {
  useEffect(() => {
    // Counter animation function
    function animateCounter(element: HTMLElement, target: number, duration = 2500) {
      let current = 0;
      const increment = target / (duration / 16);
      const isPercentage = element.textContent?.includes('%');
      const hasPlus = element.textContent?.includes('+');
      const hasSlash = element.textContent?.includes('/');
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        
        let displayValue = Math.floor(current);
        if (target >= 1000) {
          displayValue = Number((current / 1000).toFixed(1));
        }
        
        if (isPercentage) {
          element.textContent = Math.floor(current) + '%';
        } else if (hasSlash) {
          element.textContent = '24/7';
          clearInterval(timer);
        } else if (hasPlus) {
          element.textContent = displayValue + 'K+';
        } else {
          element.textContent = displayValue.toString();
        }
      }, 16);
    }

    // Intersection Observer for counter animation
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
          const statNumber = entry.target.querySelector('.stat-number') as HTMLElement;
          const text = statNumber?.textContent || '';
          
          if (text.includes('10K')) {
            animateCounter(statNumber, 10000);
          } else if (text.includes('5K')) {
            animateCounter(statNumber, 5000);
          } else if (text.includes('98')) {
            animateCounter(statNumber, 98);
          } else if (text.includes('24/7')) {
            statNumber.textContent = '24/7';
          }
        }
      });
    }, { threshold: 0.5 });

    // Apply stats observer
    document.querySelectorAll('.stat-item').forEach(stat => {
      statsObserver.observe(stat);
    });

    return () => {
      statsObserver.disconnect();
    };
  }, [])
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
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
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hire Freelancers Card */}
            <Link href="/auth/signup?type=recruiter" className="group">
              <div className="user-type-card user-type-card-blue">
                <div className="text-center">
                  <div className="user-type-icon user-type-icon-blue">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="user-type-title">Hire Freelancers</h2>
                  <p className="user-type-description">
                    Find skilled professionals for your projects. From web development to content creation, 
                    discover talent that matches your needs.
                  </p>
                  <div className="user-type-features">
                    <div className="user-type-feature">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Access to verified professionals
                    </div>
                    <div className="user-type-feature">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      Secure payment protection
                    </div>
                    <div className="user-type-feature">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      24/7 customer support
                    </div>
                  </div>
                  <div className="user-type-cta user-type-cta-blue">
                    Get Started as Client
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Find Work Card */}
            <Link href="/auth/signup?type=freelancer" className="group">
              <div className="user-type-card user-type-card-green">
                <div className="text-center">
                  <div className="user-type-icon user-type-icon-green">
                    <Briefcase className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="user-type-title">Find Work</h2>
                  <p className="user-type-description">
                    Showcase your skills and connect with clients looking for your expertise. 
                    Build your freelance career and work on your terms.
                  </p>
                  <div className="user-type-features">
                    <div className="user-type-feature">
                      <Star className="w-4 h-4 text-yellow-500 mr-2" />
                      Showcase your portfolio
                    </div>
                    <div className="user-type-feature">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      Direct client communication
                    </div>
                    <div className="user-type-feature">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      Flexible work schedule
                    </div>
                  </div>
                  <div className="user-type-cta user-type-cta-green">
                    Get Started as Freelancer
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </main>

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