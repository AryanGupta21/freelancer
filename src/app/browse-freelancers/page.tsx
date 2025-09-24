// src/app/browse-freelancers/page.tsx - Public Directory of Freelancers
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Search, Filter, MapPin, Star, DollarSign, Clock,
  User, ChevronDown, X, Briefcase, Eye
} from 'lucide-react'

interface FreelancerCard {
  id: string
  first_name: string
  last_name: string
  profile_image_url: string | null
  country: string | null
  city: string | null
  title: string | null
  description: string | null
  preferred_rate: number | null
  experience_level: string | null
  is_available: boolean
  skills: Array<{
    name: string
    category_name: string
    proficiency_level: number
  }>
  portfolio_count: number
  languages: string[] | null
}

interface FilterState {
  search: string
  minRate: string
  maxRate: string
  experienceLevel: string
  availability: string
  skills: string[]
  location: string
}

export default function BrowseFreelancers() {
  const [freelancers, setFreelancers] = useState<FreelancerCard[]>([])
  const [filteredFreelancers, setFilteredFreelancers] = useState<FreelancerCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    minRate: '',
    maxRate: '',
    experienceLevel: '',
    availability: '',
    skills: [],
    location: ''
  })

  const [availableSkills, setAvailableSkills] = useState<string[]>([])

  const router = useRouter()

  useEffect(() => {
    loadFreelancers()
    loadAvailableSkills()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [freelancers, filters])

  const loadFreelancers = async () => {
    try {
      // Get all freelancer profiles with basic info
      const { data: freelancerData, error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .select(`
          id,
          title,
          description,
          preferred_rate,
          experience_level,
          is_available,
          languages,
          profiles!inner (
            first_name,
            last_name,
            profile_image_url,
            country,
            city
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false })

      if (freelancerError) throw freelancerError

      // Get skills for each freelancer
      const freelancersWithSkills = await Promise.all(
        (freelancerData || []).map(async (freelancer) => {
          // Get skills
          const { data: skillsData } = await supabase
            .from('freelancer_skills')
            .select(`
              proficiency_level,
              skills!inner (
                name,
                skill_categories (
                  name
                )
              )
            `)
            .eq('freelancer_id', freelancer.id)
            .limit(5)

          // Get portfolio count
          const { count: portfolioCount } = await supabase
            .from('portfolio_projects')
            .select('*', { count: 'exact', head: true })
            .eq('freelancer_id', freelancer.id)

          const skills = skillsData?.map(item => ({
            name: item.skills.name,
            category_name: item.skills.skill_categories?.name || 'Other',
            proficiency_level: item.proficiency_level
          })) || []

          return {
            ...freelancer,
            ...freelancer.profiles,
            profiles: undefined, // Remove nested object
            skills,
            portfolio_count: portfolioCount || 0
          }
        })
      )

      setFreelancers(freelancersWithSkills)

    } catch (err) {
      console.error('Error loading freelancers:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableSkills = async () => {
    try {
      const { data: skillsData, error } = await supabase
        .from('skills')
        .select('name')
        .order('name')

      if (error) throw error

      setAvailableSkills(skillsData?.map(skill => skill.name) || [])
    } catch (err) {
      console.error('Error loading skills:', err)
    }
  }

  const applyFilters = () => {
    let filtered = [...freelancers]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(freelancer => 
        `${freelancer.first_name} ${freelancer.last_name}`.toLowerCase().includes(searchTerm) ||
        freelancer.title?.toLowerCase().includes(searchTerm) ||
        freelancer.description?.toLowerCase().includes(searchTerm) ||
        freelancer.skills.some(skill => skill.name.toLowerCase().includes(searchTerm))
      )
    }

    // Rate filters
    if (filters.minRate) {
      filtered = filtered.filter(freelancer => 
        freelancer.preferred_rate && freelancer.preferred_rate >= parseInt(filters.minRate)
      )
    }
    if (filters.maxRate) {
      filtered = filtered.filter(freelancer => 
        freelancer.preferred_rate && freelancer.preferred_rate <= parseInt(filters.maxRate)
      )
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter(freelancer => 
        freelancer.experience_level === filters.experienceLevel
      )
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(freelancer =>
        filters.skills.some(filterSkill =>
          freelancer.skills.some(freelancerSkill => 
            freelancerSkill.name.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      )
    }

    // Location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase()
      filtered = filtered.filter(freelancer =>
        freelancer.country?.toLowerCase().includes(locationTerm) ||
        freelancer.city?.toLowerCase().includes(locationTerm)
      )
    }

    setFilteredFreelancers(filtered)
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const addSkillFilter = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({ ...prev, skills: [...prev.skills, skill] }))
    }
  }

  const removeSkillFilter = (skill: string) => {
    setFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      minRate: '',
      maxRate: '',
      experienceLevel: '',
      availability: '',
      skills: [],
      location: ''
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 4) return 'bg-green-100 text-green-800'
    if (proficiency >= 3) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading freelancers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find the Perfect Freelancer
            </h1>
            <p className="text-lg text-gray-600">
              Browse talented professionals ready to help with your projects
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or description..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Rate Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate ($)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minRate}
                      onChange={(e) => updateFilter('minRate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRate}
                      onChange={(e) => updateFilter('maxRate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => updateFilter('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addSkillFilter(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Add skill filter</option>
                    {availableSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Skills */}
              {filters.skills.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {filters.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkillFilter(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Actions */}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  Clear all filters
                </button>
                <span className="text-sm text-gray-600">
                  {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredFreelancers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <Link
                key={freelancer.id}
                href={`/freelancer/${freelancer.id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Profile Header */}
                <div className="flex items-center space-x-4 mb-4">
                  {freelancer.profile_image_url ? (
                    <img
                      src={freelancer.profile_image_url}
                      alt={`${freelancer.first_name} ${freelancer.last_name}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {getInitials(freelancer.first_name, freelancer.last_name)}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {freelancer.first_name} {freelancer.last_name}
                    </h3>
                    {freelancer.title && (
                      <p className="text-blue-600 text-sm font-medium">{freelancer.title}</p>
                    )}
                    {(freelancer.city || freelancer.country) && (
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {freelancer.city && freelancer.country 
                          ? `${freelancer.city}, ${freelancer.country}`
                          : freelancer.country || freelancer.city
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {freelancer.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {freelancer.description}
                  </p>
                )}

                {/* Skills */}
                {freelancer.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full ${getSkillColor(skill.proficiency_level)}`}
                        >
                          {skill.name}
                        </span>
                      ))}
                      {freelancer.skills.length > 4 && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                          +{freelancer.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    {freelancer.preferred_rate && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${freelancer.preferred_rate}/hr
                      </div>
                    )}
                    
                    {freelancer.experience_level && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {freelancer.experience_level.charAt(0).toUpperCase() + freelancer.experience_level.slice(1)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-gray-500">
                    <Briefcase className="w-4 h-4 mr-1" />
                    {freelancer.portfolio_count} project{freelancer.portfolio_count !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Languages */}
                {freelancer.languages && freelancer.languages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Languages:</span>
                      {freelancer.languages.slice(0, 3).map((lang, index) => (
                        <span key={index} className="text-xs text-gray-700">
                          {lang}{index < Math.min(freelancer.languages!.length - 1, 2) ? ', ' : ''}
                        </span>
                      ))}
                      {freelancer.languages.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{freelancer.languages.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability Indicator */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center text-sm ${freelancer.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${freelancer.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {freelancer.is_available ? 'Available' : 'Unavailable'}
                    </div>
                    
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No freelancers found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or clearing some filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}