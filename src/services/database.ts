import { supabase } from '@/lib/supabase'
import type { Mineral, Category, CreateMineralData, UpdateMineralData, CreateCategoryData, UpdateCategoryData, Staff, CreateStaffData, UpdateStaffData, FAQ, CreateFAQData, UpdateFAQData } from '@/types/database'

// ===========================================
// MINERALS
// ===========================================

export const mineralsService = {
  // Get all minerals with optional filtering
  async getAll(filters?: { status?: string; category?: string; search?: string }) {
    let query = supabase
      .from('minerals')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
    }

    const { data, error} = await query

    if (error) throw error
    return data as Mineral[]
  },

  // Get mineral by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('minerals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Mineral
  },

  // Get mineral by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('minerals')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as Mineral
  },

  // Create new mineral
  async create(mineralData: CreateMineralData) {
    const { data, error } = await supabase
      .from('minerals')
      .insert(mineralData)
      .select()
      .single()

    if (error) throw error
    return data as Mineral
  },

  // Update mineral
  async update(mineralData: UpdateMineralData) {
    const { id, ...updateData } = mineralData
    const { data, error } = await supabase
      .from('minerals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Mineral
  },

  // Delete mineral
  async delete(id: string) {
    const { error } = await supabase
      .from('minerals')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Bulk update status
  async bulkUpdateStatus(ids: string[], status: string) {
    const { data, error } = await supabase
      .from('minerals')
      .update({ status })
      .in('id', ids)
      .select()

    if (error) throw error
    return data as Mineral[]
  },

  // Get count of featured minerals
  async getFeaturedCount() {
    const { count, error } = await supabase
      .from('minerals')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true)

    if (error) throw error
    return count || 0
  },

  // Toggle featured status
  async toggleFeatured(id: string, featured: boolean) {
    // If trying to feature, check if we already have 3
    if (featured) {
      // First check: Get the mineral to verify it's published
      const { data: mineral, error: fetchError } = await supabase
        .from('minerals')
        .select('status')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError
      
      if (mineral.status !== 'published') {
        throw new Error('Only published minerals can be featured. Please publish the mineral first.')
      }

      // Second check: Count existing featured minerals
      const count = await this.getFeaturedCount()
      if (count >= 3) {
        throw new Error('Cannot feature more than 3 minerals. Please unfeature another mineral first.')
      }
    }

    const { data, error } = await supabase
      .from('minerals')
      .update({ featured })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Mineral
  }
}

// ===========================================
// CATEGORIES
// ===========================================

export const categoriesService = {
  // Get all categories
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Category[]
  },

  // Get category by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Category
  },

  // Create new category
  async create(categoryData: CreateCategoryData) {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  // Update category
  async update(categoryData: UpdateCategoryData) {
    const { id, ...updateData } = categoryData
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  // Delete category
  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// ===========================================
// STORAGE
// ===========================================

export const storageService = {
  // Upload image to mineral-images bucket
  async uploadImage(file: File, path?: string): Promise<{ url: string; path: string }> {
    const fileName = path || `${Date.now()}-${file.name}`
    const filePath = `images/${fileName}`

    const { error } = await supabase.storage
      .from('mineral-images')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('mineral-images')
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
  },

  // Upload video to mineral-videos bucket
  async uploadVideo(file: File, path?: string): Promise<{ url: string; path: string }> {
    const fileName = path || `${Date.now()}-${file.name}`
    const filePath = `videos/${fileName}`

    const { error } = await supabase.storage
      .from('mineral-videos')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('mineral-videos')
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
  },

  // Upload staff image to staff-images bucket
  async uploadStaffImage(file: File, path?: string): Promise<{ url: string; path: string }> {
    const fileName = path || `${Date.now()}-${file.name}`
    const filePath = `staff/${fileName}`

    const { error } = await supabase.storage
      .from('staff-images')
      .upload(filePath, file)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('staff-images')
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
  },

  // Delete file from storage
  async deleteFile(bucket: 'mineral-images' | 'mineral-videos' | 'staff-images', path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },

  // Get public URL for file
  getPublicUrl(bucket: 'mineral-images' | 'mineral-videos' | 'staff-images', path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export const utilityService = {
  // Generate slug from title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  },

  // Check if slug is unique
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('minerals')
      .select('id')
      .eq('slug', slug)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data.length === 0
  },

  // Make slug unique by appending number
  async makeSlugUnique(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (!(await this.isSlugUnique(slug, excludeId))) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }
}

// ===========================================
// STAFF
// ===========================================

export const staffService = {
  async getAll() {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data as Staff[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Staff
  },

  async create(staffData: CreateStaffData) {
    const { data, error } = await supabase
      .from('staff')
      .insert(staffData)
      .select()
      .single()
    if (error) throw error
    return data as Staff
  },

  async update(staffData: UpdateStaffData) {
    const { id, ...updateData } = staffData
    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Staff
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// ===========================================
// FAQ
// ===========================================

export const faqService = {
  async getAll() {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true})
    if (error) throw error
    return data as FAQ[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as FAQ
  },

  async create(faqData: CreateFAQData) {
    const { data, error } = await supabase
      .from('faq')
      .insert(faqData)
      .select()
      .single()
    if (error) throw error
    return data as FAQ
  },

  async update(faqData: UpdateFAQData) {
    const { id, ...updateData } = faqData
    const { data, error } = await supabase
      .from('faq')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as FAQ
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}