import { supabase } from '@/lib/supabase'
import type { Mineral, Tag, CreateMineralData, UpdateMineralData, CreateTagData, UpdateTagData } from '@/types/database'

// ===========================================
// MINERALS
// ===========================================

export const mineralsService = {
  // Get all minerals with optional filtering
  async getAll(filters?: { status?: string; tags?: string[]; search?: string }) {
    let query = supabase
      .from('minerals')
      .select('*')
      .order('updated_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

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
  }
}

// ===========================================
// TAGS
// ===========================================

export const tagsService = {
  // Get all tags
  async getAll() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) throw error
    return data as Tag[]
  },

  // Get tag by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Tag
  },

  // Create new tag
  async create(tagData: CreateTagData) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tagData)
      .select()
      .single()

    if (error) throw error
    return data as Tag
  },

  // Update tag
  async update(tagData: UpdateTagData) {
    const { id, ...updateData } = tagData
    const { data, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Tag
  },

  // Delete tag
  async delete(id: string) {
    const { error } = await supabase
      .from('tags')
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

  // Delete file from storage
  async deleteFile(bucket: 'mineral-images' | 'mineral-videos', path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },

  // Get public URL for file
  getPublicUrl(bucket: 'mineral-images' | 'mineral-videos', path: string) {
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