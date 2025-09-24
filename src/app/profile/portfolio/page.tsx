// src/app/profile/portfolio/page.tsx - Portfolio Management Interface
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Plus, Edit, Trash2, ExternalLink, Upload,
  Image as ImageIcon, Calendar, Tag, Globe, Save, X
} from 'lucide-react'

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
  display_order: number
}

interface ProjectFormData {
  title: string
  description: string
  project_url: string
  project_type: string
  completion_date: string
  client_name: string
  technologies_used: string[]
  is_featured: boolean
}

export default function PortfolioManagementPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    project_url: '',
    project_type: 'web',
    completion_date: '',
    client_name: '',
    technologies_used: [],
    is_featured: false
  })
  const [newTechnology, setNewTechnology] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [freelancerProfileId, setFreelancerProfileId] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    loadPortfolioProjects()
  }, [])

  const loadPortfolioProjects = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      // Get freelancer profile ID
      const { data: profile, error: profileError } = await supabase
        .from('freelancer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError
      setFreelancerProfileId(profile.id)

      // Load portfolio projects
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('freelancer_id', profile.id)
        .order('display_order', { ascending: true })

      if (portfolioError) throw portfolioError
      setProjects(portfolioData || [])

    } catch (err) {
      console.error('Error loading portfolio:', err)
      setError('Failed to load portfolio projects')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_url: '',
      project_type: 'web',
      completion_date: '',
      client_name: '',
      technologies_used: [],
      is_featured: false
    })
    setNewTechnology('')
    setEditingProject(null)
    setShowAddForm(false)
  }

  const handleEdit = (project: PortfolioProject) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      project_url: project.project_url || '',
      project_type: project.project_type || 'web',
      completion_date: project.completion_date || '',
      client_name: project.client_name || '',
      technologies_used: project.technologies_used || [],
      is_featured: project.is_featured
    })
    setEditingProject(project)
    setShowAddForm(true)
  }

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies_used.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies_used: [...prev.technologies_used, newTechnology.trim()]
      }))
      setNewTechnology('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies_used: prev.technologies_used.filter(t => t !== tech)
    }))
  }

  const saveProject = async () => {
    if (!formData.title.trim()) {
      setError('Project title is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const projectData = {
        freelancer_id: freelancerProfileId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        project_url: formData.project_url.trim() || null,
        project_type: formData.project_type,
        completion_date: formData.completion_date || null,
        client_name: formData.client_name.trim() || null,
        technologies_used: formData.technologies_used.length > 0 ? formData.technologies_used : null,
        is_featured: formData.is_featured,
        display_order: projects.length
      }

      if (editingProject) {
        // Update existing project
        const { error: updateError } = await (supabase as any)
          .from('portfolio_projects')
          .update(projectData)
          .eq('id', editingProject.id)

        if (updateError) throw updateError

        setProjects(prev => prev.map(p => 
          p.id === editingProject.id 
            ? { ...p, ...projectData }
            : p
        ))
      } else {
        // Create new project
        const { data: newProject, error: insertError } = await (supabase as any)
          .from('portfolio_projects')
          .insert(projectData)
          .select()
          .single()

        if (insertError) throw insertError
        setProjects(prev => [...prev, newProject])
      }

      resetForm()
      
    } catch (err) {
      console.error('Error saving project:', err)
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const { error } = await (supabase as any)
        .from('portfolio_projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Failed to delete project')
    }
  }

  const toggleFeatured = async (project: PortfolioProject) => {
    try {
      const { error } = await (supabase as any)
        .from('portfolio_projects')
        .update({ is_featured: !project.is_featured })
        .eq('id', project.id)

      if (error) throw error

      setProjects(prev => prev.map(p => 
        p.id === project.id 
          ? { ...p, is_featured: !p.is_featured }
          : p
      ))
    } catch (err) {
      console.error('Error updating featured status:', err)
      setError('Failed to update featured status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio Management</h1>
                <p className="text-gray-600 mt-1">Showcase your best work to attract clients</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingProject ? 'Edit Project' : 'Add New Project'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. E-commerce Website Redesign"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the project, your role, challenges solved..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Type
                      </label>
                      <select
                        value={formData.project_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, project_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile App</option>
                        <option value="design">Design</option>
                        <option value="marketing">Marketing</option>
                        <option value="writing">Writing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion Date
                      </label>
                      <input
                        type="date"
                        value={formData.completion_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, completion_date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project URL
                      </label>
                      <input
                        type="url"
                        value={formData.project_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, project_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={formData.client_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Client or Company Name"
                      />
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies Used
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newTechnology}
                        onChange={(e) => setNewTechnology(e.target.value)}
                        placeholder="Add technology"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                      />
                      <button
                        onClick={addTechnology}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies_used.map((tech, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {tech}
                          <button
                            onClick={() => removeTechnology(tech)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Featured Project */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                      Feature this project (show prominently on profile)
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProject}
                      disabled={saving}
                      className={`flex items-center px-6 py-2 rounded-md font-semibold transition-colors ${
                        saving 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Project
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Project Image Placeholder */}
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <span className="ml-2 text-gray-500">No image yet</span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {project.title}
                    </h3>
                    {project.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Project Details */}
                  <div className="space-y-2 mb-4">
                    {project.project_type && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Tag className="w-3 h-3 mr-1" />
                        {project.project_type}
                      </div>
                    )}
                    
                    {project.completion_date && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(project.completion_date).toLocaleDateString()}
                      </div>
                    )}

                    {project.client_name && (
                      <div className="flex items-center text-xs text-gray-500">
                        Client: {project.client_name}
                      </div>
                    )}
                  </div>

                  {/* Technologies */}
                  {project.technologies_used && project.technologies_used.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies_used.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
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

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFeatured(project)}
                        className={`p-1 transition-colors ${
                          project.is_featured 
                            ? 'text-yellow-600 hover:text-yellow-700' 
                            : 'text-gray-600 hover:text-yellow-600'
                        }`}
                        title={project.is_featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        ★
                      </button>
                    </div>

                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700 text-sm transition-colors"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio projects yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your portfolio by adding your best work projects.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  )
}