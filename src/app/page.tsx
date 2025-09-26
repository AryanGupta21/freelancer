// src/app/page.tsx - Fixed Public Homepage Marketplace (Fiverr-style)
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Search, Star, User, MapPin, Eye, Heart,
  Code, Palette, Megaphone, PenTool, Camera,
  Headphones, BarChart3, Globe, ChevronRight,
  Play, Shield, Users, Award, Briefcase
} from 'lucide-react'

interface ServiceListing {
  id: string
  title: string
  description: string
  price_from: number
  delivery_days: number
  rating: number
  reviews_count: number
  image_url: string | null
  freelancer: {
    id: string
    name: string
    avatar_url: string | null
    level: string
    country: string | null
  }
  category: string
  subcategory: string
  is_featured: boolean
}

interface Category {
  id: string
  name: string
  icon: any
  services_count: number
  color: string
}

export default function Homepage() {
  const [featuredServices, setFeaturedServices] = useState<ServiceListing[]>([])
  const [popularCategories, setPopularCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()

  useEffect(() => {
    loadHomepageData()
    
    // Set up real-time subscription for new freelancer profiles
    const channel = supabase
      .channel('freelancer_profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_profiles'
        },
        () => {
          // Reload data when freelancer profiles change
          console.log('Freelancer profile updated, refreshing homepage...')
          loadHomepageData()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadHomepageData = async () => {
    try {
      // Load real freelancer profiles from database
      const { data: freelancerData, error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .select(`
          id,
          title,
          description,
          preferred_rate,
          delivery_time_days,
          experience_level,
          is_available,
          profiles!inner (
            first_name,
            last_name,
            profile_image_url,
            country,
            city
          )
        `)
        .eq('is_available', true)
        .not('title', 'is', null)
        .not('description', 'is', null)
        .order('created_at', { ascending: false })
        .limit(12)

      if (freelancerError) {
        console.error('Error loading freelancers:', freelancerError)
        setFeaturedServices([])
        setLoading(false)
        return
      }

      // Transform freelancer profiles into service listings
      const realServices: ServiceListing[] = await Promise.all(
        (freelancerData || []).map(async (freelancer) => {
          // Get first portfolio project image if available
          const { data: portfolioData } = await supabase
            .from('portfolio_projects')
            .select('image_urls')
            .eq('freelancer_id', freelancer.id)
            .not('image_urls', 'is', null)
            .limit(1)

          // Get freelancer's main skill category
          const { data: skillData } = await supabase
            .from('freelancer_skills')
            .select(`
              skills!inner (
                skill_categories (
                  name
                )
              )
            `)
            .eq('freelancer_id', freelancer.id)
            .limit(1)

          const portfolioImage = portfolioData?.[0]?.image_urls?.[0] || null
          const category = skillData?.[0]?.skills?.skill_categories?.name || 'General Services'

          // Generate service title from freelancer title
          const serviceTitle = freelancer.title.startsWith('I will') 
            ? freelancer.title 
            : `I will ${freelancer.title.toLowerCase()}`

          return {
            id: freelancer.id,
            title: serviceTitle,
            description: freelancer.description || 'Professional freelance service',
            price_from: freelancer.preferred_rate || 50,
            delivery_days: freelancer.delivery_time_days || 7,
            rating: 4.5 + (Math.random() * 0.5), // Random rating for now
            reviews_count: Math.floor(Math.random() * 100) + 10, // Random review count
            image_url: portfolioImage,
            freelancer: {
              id: freelancer.id,
              name: `${freelancer.profiles.first_name} ${freelancer.profiles.last_name}`,
              avatar_url: freelancer.profiles.profile_image_url,
              level: freelancer.experience_level === 'expert' ? 'Top Rated Seller' : 
                     freelancer.experience_level === 'intermediate' ? 'Level 2 Seller' : 'Level 1 Seller',
              country: freelancer.profiles.country
            },
            category: category,
            subcategory: freelancer.title,
            is_featured: Math.random() > 0.7 // Random featured status
          }
        })
      )

      // Add some mock services if we have fewer than 6 real ones
      const mockServices: ServiceListing[] = realServices.length < 6 ? [
        {
          id: 'mock-1',
          title: 'I will design a modern logo for your brand',
          description: 'Professional logo design with unlimited revisions and multiple concepts',
          price_from: 25,
          delivery_days: 3,
          rating: 4.9,
          reviews_count: 127,
          image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
          freelancer: {
            id: 'mock-f1',
            name: 'Sarah Design',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b66e5bb6?w=100&h=100&fit=crop',
            level: 'Level 2 Seller',
            country: 'United States'
          },
          category: 'Graphics & Design',
          subcategory: 'Logo Design',
          is_featured: true
        },
        {
          id: 'mock-2',
          title: 'I will develop a responsive React website',
          description: 'Custom React website with modern design and mobile optimization',
          price_from: 150,
          delivery_days: 7,
          rating: 4.8,
          reviews_count: 89,
          image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop',
          freelancer: {
            id: 'mock-f2',
            name: 'Alex Code',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            level: 'Top Rated Seller',
            country: 'Canada'
          },
          category: 'Programming & Tech',
          subcategory: 'Web Development',
          is_featured: true
        }
      ] : []

      const allServices = [...realServices, ...mockServices]
      setFeaturedServices(allServices)

      // Mock popular categories (you can make this dynamic later)
      const mockCategories: Category[] = [
        {
          id: 'graphics-design',
          name: 'Graphics & Design',
          icon: Palette,
          services_count: 1250,
          color: 'bg-purple-100 text-purple-600'
        },
        {
          id: 'programming-tech',
          name: 'Programming & Tech',
          icon: Code,
          services_count: 890,
          color: 'bg-blue-100 text-blue-600'
        },
        {
          id: 'digital-marketing',
          name: 'Digital Marketing',
          icon: Megaphone,
          services_count: 650,
          color: 'bg-green-100 text-green-600'
        },
        {
          id: 'writing-translation',
          name: 'Writing & Translation',
          icon: PenTool,
          services_count: 780,
          color: 'bg-orange-100 text-orange-600'
        },
        {
          id: 'video-animation',
          name: 'Video & Animation',
          icon: Camera,
          services_count: 420,
          color: 'bg-red-100 text-red-600'
        },
        {
          id: 'music-audio',
          name: 'Music & Audio',
          icon: Headphones,
          services_count: 320,
          color: 'bg-indigo-100 text-indigo-600'
        },
        {
          id: 'data',
          name: 'Data',
          icon: BarChart3,
          services_count: 280,
          color: 'bg-yellow-100 text-yellow-600'
        },
        {
          id: 'business',
          name: 'Business',
          icon: Briefcase,
          services_count: 540,
          color: 'bg-pink-100 text-pink-600'
        }
      ]

      setPopularCategories(mockCategories)
      setLoading(false)

    } catch (err) {
      console.error('Error loading homepage data:', err)
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">FreelanceHub</span>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="What service are you looking for today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login?type=freelancer"
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                Become a Seller
              </Link>
              <Link
                href="/auth/login?type=client"
                className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Join
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Find the perfect <span className="text-green-200">freelance</span> services for your business
            </h1>
            <p className="text-xl text-green-100 mb-10 max-w-3xl mx-auto">
              Millions of people use FreelanceHub to turn their ideas into reality. Join the world's largest freelance marketplace.
            </p>
            
            {/* Mobile Search */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Try 'logo design'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 rounded-l-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-green-700 hover:bg-green-800 rounded-r-lg transition-colors"
                >
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </div>

            {/* Popular Searches */}
            <div className="mt-8">
              <span className="text-green-200">Popular:</span>
              {['Website Design', 'WordPress', 'Logo Design', 'Video Editing'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term)
                    router.push(`/search?q=${encodeURIComponent(term)}`)
                  }}
                  className="ml-4 px-4 py-2 border border-green-400 rounded-full hover:bg-green-500 transition-colors text-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular professional services</h2>
            <p className="text-lg text-gray-600">Browse services by category</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {popularCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="group p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all hover:border-green-300"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500">{category.services_count} services</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured services</h2>
              <p className="text-lg text-gray-600">Hand-picked by our team</p>
            </div>
            <Link
              href="/search?featured=true"
              className="flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              View all featured
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
            
            {/* Manual Refresh Button (for testing) */}
            <button
              onClick={() => {
                setLoading(true)
                loadHomepageData()
              }}
              className="ml-4 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.length > 0 ? (
              featuredServices.map((service) => (
                <Link
                  key={service.id}
                  href={service.id.startsWith('mock-') ? '#' : `/freelancer/${service.id}`}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Service Image */}
                  <div className="relative h-48 bg-gray-200">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {/* Real Freelancer Badge */}
                    {!service.id.startsWith('mock-') && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Live
                      </div>
                    )}
                  </div>

                  {/* Service Content */}
                  <div className="p-4">
                    {/* Freelancer Info */}
                    <div className="flex items-center mb-3">
                      {service.freelancer.avatar_url ? (
                        <img
                          src={service.freelancer.avatar_url}
                          alt={service.freelancer.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                          {getInitials(service.freelancer.name)}
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{service.freelancer.name}</p>
                        <p className="text-xs text-gray-500">{service.freelancer.level}</p>
                      </div>
                    </div>

                    {/* Service Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {service.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900 ml-1">{service.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 ml-1">({service.reviews_count})</span>
                      </div>
                      {service.freelancer.country && (
                        <div className="flex items-center ml-auto text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {service.freelancer.country}
                        </div>
                      )}
                    </div>

                    {/* Price and Delivery */}
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">Starting at</p>
                        <p className="text-lg font-bold text-gray-900">${service.price_from}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers available yet</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to join as a freelancer and start offering your services!
                </p>
                <Link
                  href="/auth/signup?type=freelancer"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Become a Freelancer
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure payments</h3>
              <p className="text-gray-400">Your payment is protected until you approve the work</p>
            </div>
            <div>
              <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">24/7 support</h3>
              <p className="text-gray-400">Get help when you need it from our customer success team</p>
            </div>
            <div>
              <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality guarantee</h3>
              <p className="text-gray-400">Get refund if the work doesn't meet your expectations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">FreelanceHub</span>
              </div>
              <p className="text-gray-600">The world's largest freelance marketplace</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/category/graphics-design" className="hover:text-green-600">Graphics & Design</Link></li>
                <li><Link href="/category/programming-tech" className="hover:text-green-600">Programming & Tech</Link></li>
                <li><Link href="/category/digital-marketing" className="hover:text-green-600">Digital Marketing</Link></li>
                <li><Link href="/category/writing-translation" className="hover:text-green-600">Writing & Translation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">About</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/about" className="hover:text-green-600">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-green-600">Careers</Link></li>
                <li><Link href="/press" className="hover:text-green-600">Press & News</Link></li>
                <li><Link href="/partnerships" className="hover:text-green-600">Partnerships</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/help" className="hover:text-green-600">Help & Support</Link></li>
                <li><Link href="/trust-safety" className="hover:text-green-600">Trust & Safety</Link></li>
                <li><Link href="/terms" className="hover:text-green-600">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-green-600">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 FreelanceHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}