// src/app/onboarding/skills/page.tsx - Fixed Skills Selection Page
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Monitor, PenTool, Palette, FileText, Cog, TrendingUp, Briefcase,
  Search, Check, ChevronRight, ArrowLeft, ArrowRight
} from 'lucide-react'

interface SkillCategory {
  id: string
  name: string
  description: string
  icon_name: string
  display_order: number
}

interface Skill {
  id: string
  name: string
  category_id: string
  description: string
}

interface SelectedSkill {
  id: string
  name: string
  category_id: string
}

const iconMap = {
  Monitor,
  PenTool, 
  Palette,
  FileText,
  Cog,
  TrendingUp,
  Briefcase
}

export default function SkillsSelectionPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categorySkills, setCategorySkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Load skills when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadSkillsForCategory(selectedCategory)
    }
  }, [selectedCategory])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error loading categories:', err)
      setError('Failed to load skill categories')
    } finally {
      setLoading(false)
    }
  }

  const loadSkillsForCategory = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategorySkills(data || [])
    } catch (err) {
      console.error('Error loading skills:', err)
      setError('Failed to load skills')
    }
  }

  const toggleSkill = (skill: Skill) => {
    const isSelected = selectedSkills.some(s => s.id === skill.id)
    
    if (isSelected) {
      setSelectedSkills(prev => prev.filter(s => s.id !== skill.id))
    } else {
      setSelectedSkills(prev => [...prev, {
        id: skill.id,
        name: skill.name,
        category_id: skill.category_id
      }])
    }
  }

  const removeSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId))
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Briefcase
    return IconComponent
  }

  const filteredSkills = categorySkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleContinue = async () => {
  if (selectedSkills.length === 0) {
    setError('Please select at least one skill to continue')
    return
  }

  setSaving(true)
  setError(null)

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('User not authenticated')

    console.log('User ID:', user.id)

    // Get or create freelancer profile
    let { data: existingProfile, error: profileError } = await (supabase as any)
      .from('freelancer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError
    }

    let profileId: string

    if (!existingProfile) {
      console.log('Creating new freelancer profile...')
      // Create new freelancer profile
      const { data: newProfile, error: createError } = await (supabase as any)
        .from('freelancer_profiles')
        .insert({
          user_id: user.id,
          profile_completion_percentage: 20
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Create profile error:', createError)
        throw createError
      }
      
      if (!newProfile || !newProfile.id) {
        throw new Error('Failed to create freelancer profile - no ID returned')
      }
      
      profileId = newProfile.id
      console.log('Created profile with ID:', profileId)
    } else {
      profileId = existingProfile.id
      console.log('Using existing profile ID:', profileId)
    }

    // Validate profileId is a string
    if (typeof profileId !== 'string') {
      console.error('Profile ID is not a string:', profileId)
      throw new Error('Invalid profile ID format')
    }

    // Delete existing skills first
    console.log('Deleting existing skills for profile:', profileId)
    const { error: deleteError } = await (supabase as any)
      .from('freelancer_skills')
      .delete()
      .eq('freelancer_id', profileId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      // Continue anyway, might be first time
    }

    // Prepare skills data with validation
    const skillsToInsert = selectedSkills.map(skill => {
      console.log('Processing skill:', skill.id, skill.name)
      
      // Validate skill ID is a string
      if (typeof skill.id !== 'string') {
        console.error('Skill ID is not a string:', skill.id)
        throw new Error(`Invalid skill ID format for ${skill.name}`)
      }
      
      return {
        freelancer_id: profileId,
        skill_id: skill.id,
        proficiency_level: 3
      }
    })

    console.log('Skills to insert:', skillsToInsert)

    // Insert new skills
    if (skillsToInsert.length > 0) {
      const { error: skillsError } = await (supabase as any)
        .from('freelancer_skills')
        .insert(skillsToInsert)

      if (skillsError) {
        console.error('Skills insert error:', skillsError)
        throw skillsError
      }
      
      console.log('Skills inserted successfully')
    }

    // Update profile completion
    console.log('Updating profile completion...')
    const { error: updateError } = await (supabase as any)
      .from('freelancer_profiles')
      .update({ 
        profile_completion_percentage: 30 
      })
      .eq('id', profileId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Don't throw here, skills were saved successfully
    }

    console.log('Skills saved successfully, navigating to personal info...')
    router.push('/onboarding/personal-info')
    
  } catch (err) {
    console.error('Error saving skills:', err)
    setError(err instanceof Error ? err.message : 'Failed to save skills')
  } finally {
    setSaving(false)
  }
}
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tell us your top skills</h1>
              <p className="text-gray-600 mt-1">This helps us recommend jobs for you.</p>
            </div>
            <div className="text-sm text-gray-500">
              Step 1 of 4
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Select a category</h2>
              </div>
              <div className="space-y-1">
                {categories.map((category) => {
                  const IconComponent = getIconComponent(category.icon_name)
                  const isSelected = selectedCategory === category.id
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 mr-3 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {category.name}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Middle Column - Skills */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                {selectedCategory ? (
                  <>
                    <h2 className="font-semibold text-gray-900 mb-3">Available Skills</h2>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Select a category to start adding skills to your profile.</p>
                  </div>
                )}
              </div>
              
              {selectedCategory && (
                <div className="max-h-96 overflow-y-auto">
                  {filteredSkills.map((skill) => {
                    const isSelected = selectedSkills.some(s => s.id === skill.id)
                    
                    return (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <span className={`text-sm ${
                          isSelected ? 'text-green-900 font-medium' : 'text-gray-900'
                        }`}>
                          {skill.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                    )
                  })}
                  
                  {filteredSkills.length === 0 && searchTerm && (
                    <div className="p-4 text-center text-gray-500">
                      No skills found for "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Selected Skills */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">
                  {selectedSkills.length} skills selected
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select at least one skill to help us recommend customized jobs for you.
                </p>
              </div>
              
              <div className="p-4">
                {selectedSkills.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No skills selected yet.</p>
                    <p className="text-sm mt-1">Choose from the categories to add skills.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedSkills.map((skill) => {
                      const category = categories.find(c => c.id === skill.category_id)
                      
                      return (
                        <div
                          key={skill.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                            <div className="text-xs text-gray-500">{category?.name}</div>
                          </div>
                          <button
                            onClick={() => removeSkill(skill.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <button
            onClick={handleContinue}
            disabled={saving || selectedSkills.length === 0}
            className={`flex items-center px-6 py-3 rounded-md font-semibold transition-colors ${
              saving || selectedSkills.length === 0
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
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}