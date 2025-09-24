// src/app/freelancer/[id]/page.tsx - Public Freelancer Profile
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  MapPin, Star, Clock, DollarSign, Eye, Download,
  ExternalLink, Calendar, Building, GraduationCap,
  Award, Globe, Mail, MessageCircle, User
} from 'lucide-react'

interface FreelancerPublicProfile {
  // Basic Info
  first_name: string
  last_name: string
  email: string
  profile_image_url: string | null
  country: string | null
  city: string | null
  
  // Freelancer Details
  title: string | null
  description: string | null
  preferred_rate: number | null
  availability_hours_per_week: number | null
  delivery_time_days: number | null
  experience_level: string | null
  languages: string[] | null
  resume_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  is_available: boolean
}

interface Skill {
  id: string
  name: string
  category_name: string
  proficiency_level: number
}

interface PortfolioProject {
  id: string
  title: string
  description: string | null
  project_url: string | null
  image_urls: string[] | null
  technologies_used: string[] | null
  project_type: string | null
  completion_date: string | null
  client_name: string | null
  is_featured: boolean
}

interface WorkExperience {
  id: string
  job_title: string
  company_name: string
  description: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  location: string | null
  employment_type: string | null
}

interface Education {
  id: string
  institution_name: string
  degree: string | null
  field_of_study: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  grade_gpa: string | null
}

interface Certification {
  id: string
  name: string
  issuing_organization: string
  issue_date: string | null
  expiry_date: string | null
  credential_url: string | null
}

export default function PublicFreelancerProfile() {
  const params = useParams()
  const router = useRouter()
  const freelancerId = params.id as string

  const [profile, setProfile] = useState<FreelancerPublicProfile | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [experiences, setExperiences] = useState<WorkExperience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'experience' | 'education'>('about')

  useEffect(() => {
    if (freelancerId) {
      loadFreelancerProfile()
    }
  }, [freelancerId])

  const loadFreelancerProfile = async () => {
    try {
      // Get freelancer profile with user data
      const { data: freelancerData, error: freelancerError } = await supabase
        .from('freelancer_profiles')
        .select(`
          *,
          profiles!inner (
            first_name,
            last_name,
            email,
            profile_image_url,
            country,
            city
          )
        `)
        .eq('id', freelancerId)
        .single()

      if (freelancerError) throw freelancerError

      // Flatten the profile data
      const profileData = {
        ...freelancerData.profiles,
        ...freelancerData,
        profiles: undefined // Remove nested object
      }
      setProfile(profileData)

      // Load skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('freelancer_skills')
        .select(`
          proficiency_level,
          skills!inner (
            id,
            name,
            skill_categories (
              name
            )
          )
        `)
        .eq('freelancer_id', freelancerId)

      if (skillsError) throw skillsError

      const formattedSkills = skillsData?.map((item: any) => ({
        id: item.skills.id,
        name: item.skills.name,
        category_name: item.skills.skill_categories?.name || 'Other',
        proficiency_level: item.proficiency_level
      })) || []
      setSkills(formattedSkills)

      // Load portfolio projects (featured first)
      const { data: projectsData, error: projectsError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true })

      if (projectsError) throw projectsError
      setProjects(projectsData || [])

      // Load work experiences
      const { data: experiencesData, error: experiencesError } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .order('start_date', { ascending: false })

      if (experiencesError) throw experiencesError
      setExperiences(experiencesData || [])

      // Load education
      const { data: educationData, error: educationError } = await supabase
        .from('education')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .order('start_date', { ascending: false })

      if (educationError) throw educationError
      setEducation(educationData || [])

      // Load certifications
      const { data: certificationsData, error: certificationsError } = await supabase
        .from('certifications')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .order('issue_date', { ascending: false })

      if (certificationsError) throw certificationsError
      setCertifications(certificationsData || [])

    } catch (err) {
      console.error('Error loading freelancer profile:', err)
      setError('Freelancer profile not found')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getSkillColor = (proficiency: number) => {
    if (proficiency >= 4) return 'bg-green-100 text-green-800'
    if (proficiency >= 3) return 'bg-blue-100 text-blue-800'
    if (proficiency >= 2) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  const getSkillLabel = (proficiency: number) => {
    const labels = ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']
    return labels[proficiency - 1] || 'Beginner'
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The freelancer profile you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profile.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                  {getInitials(profile.first_name, profile.last_name)}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  {profile.title && (
                    <h2 className="text-xl text-blue-600 font-medium mb-3">{profile.title}</h2>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {(profile.country || profile.city) && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {profile.city && profile.country ? `${profile.city}, ${profile.country}` : profile.country || profile.city}
                      </div>
                    )}
                    
                    {profile.preferred_rate && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${profile.preferred_rate}/hour
                      </div>
                    )}
                    
                    {profile.availability_hours_per_week && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {profile.availability_hours_per_week} hours/week
                      </div>
                    )}

                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${profile.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {profile.is_available ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  {/* Languages */}
                  {profile.languages && profile.languages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 md:min-w-[200px]">
                  <button className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Freelancer
                  </button>
                  
                  {profile.resume_url && (
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Resume
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              {profile.description && (
                <div className="mt-6">
                  <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {(profile.linkedin_url || profile.github_url || profile.website_url) && (
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      {skills.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`px-3 py-2 rounded-full text-sm font-medium ${getSkillColor(skill.proficiency_level)}`}
                >
                  {skill.name} • {getSkillLabel(skill.proficiency_level)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'about', label: 'About', count: null },
              { id: 'portfolio', label: 'Portfolio', count: projects.length },
              { id: 'experience', label: 'Experience', count: experiences.length },
              { id: 'education', label: 'Education', count: education.length + certifications.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            {profile.description && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.description}</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.delivery_time_days && (
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {profile.delivery_time_days} days
                  </div>
                  <div className="text-blue-700 text-sm">Average delivery time</div>
                </div>
              )}
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900 mb-1">
                  {profile.experience_level ? profile.experience_level.charAt(0).toUpperCase() + profile.experience_level.slice(1) : 'Intermediate'}
                </div>
                <div className="text-green-700 text-sm">Experience level</div>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {projects.length + experiences.length}
                </div>
                <div className="text-purple-700 text-sm">Total projects & roles</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Portfolio</h3>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {project.image_urls && project.image_urls.length > 0 ? (
                        <img 
                          src={project.image_urls[0]} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          <Building className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{project.title}</h4>
                        {project.is_featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      )}
                      
                      {project.technologies_used && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies_used.slice(0, 3).map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                          {project.technologies_used.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                              +{project.technologies_used.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {project.completion_date && formatDate(project.completion_date)}
                        </div>
                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>No portfolio projects to display</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'experience' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Work Experience</h3>
            {experiences.length > 0 ? (
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{exp.job_title}</h4>
                        <p className="text-blue-600 font-medium">{exp.company_name}</p>
                      </div>
                      {exp.employment_type && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize">
                          {exp.employment_type}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(exp.start_date)} - {exp.is_current ? 'Present' : formatDate(exp.end_date!)}
                      </div>
                      {exp.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {exp.location}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>No work experience to display</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-8">
            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Education</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-600 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900">{edu.institution_name}</h4>
                      </div>
                      
                      {(edu.degree || edu.field_of_study) && (
                        <p className="text-blue-600 font-medium mb-2">
                          {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {(edu.start_date || edu.end_date) && (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {edu.start_date ? formatDate(edu.start_date) : 'Start date not set'} - {
                              edu.is_current ? 'Present' : (edu.end_date ? formatDate(edu.end_date) : 'End date not set')
                            }
                          </div>
                        )}
                        {edu.grade_gpa && (
                          <>
                            <span>•</span>
                            <span>{edu.grade_gpa}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-2">
                        <Award className="w-5 h-5 text-yellow-600 mr-3" />
                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      </div>
                      
                      <p className="text-blue-600 font-medium mb-2">{cert.issuing_organization}</p>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {cert.issue_date && (
                          <div>Issued: {formatDate(cert.issue_date)}</div>
                        )}
                        {cert.expiry_date && (
                          <div>Expires: {formatDate(cert.expiry_date)}</div>
                        )}
                      </div>
                      
                      {cert.credential_url && (
                        <a
                          href={cert.credential_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm mt-3"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Certificate
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length === 0 && certifications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>No education or certifications to display</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}