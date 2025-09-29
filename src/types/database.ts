// ===========================================
// ENUMS - Match Supabase custom types
// ===========================================

export type MineralStatus = 'draft' | 'published' | 'archived'

// ===========================================
// DATABASE TABLE INTERFACES
// ===========================================

/**
 * Tags table - mineral categories and classifications
 * Matches Supabase schema from 01-initial-setup.sql
 */
export interface Tag {
  id: string // UUID PRIMARY KEY
  name: string // TEXT UNIQUE NOT NULL
  color: string // TEXT DEFAULT '#6B7280'
  description?: string // TEXT (nullable)
  created_at: string // TIMESTAMP WITH TIME ZONE
  updated_at: string // TIMESTAMP WITH TIME ZONE
}

/**
 * Minerals table - main content entities
 * Matches Supabase schema from 01-initial-setup.sql
 */
export interface Mineral {
  id: string // UUID PRIMARY KEY
  title: string // TEXT NOT NULL
  slug: string // TEXT UNIQUE NOT NULL (auto-generated from title)
  description?: string // TEXT (rich text from TinyMCE)
  video_url?: string // TEXT (URL for embedded videos)
  tags: string[] // TEXT[] DEFAULT '{}' (array of tag names)
  images: MineralImage[] // JSONB DEFAULT '[]' (array of image metadata)
  status: MineralStatus // mineral_status DEFAULT 'draft'
  meta_title?: string // TEXT (SEO title)
  meta_description?: string // TEXT (SEO description)
  created_at: string // TIMESTAMP WITH TIME ZONE
  updated_at: string // TIMESTAMP WITH TIME ZONE (auto-updated by trigger)
}

// ===========================================
// NESTED OBJECT INTERFACES
// ===========================================

/**
 * Image metadata stored in minerals.images JSONB array
 * Structure for image objects in the database
 */
export interface MineralImage {
  id: string
  url: string // Public URL from Supabase storage
  alt?: string
  caption?: string
  filename: string
  size: number // File size in bytes
}

// ===========================================
// INPUT/OUTPUT INTERFACES FOR API OPERATIONS
// ===========================================

/**
 * Data required to create a new mineral
 * Note: id, created_at, updated_at are auto-generated
 * slug is optional (auto-generated from title if not provided)
 */
export interface CreateMineralData {
  title: string
  slug?: string // Optional, will be auto-generated from title
  description?: string
  video_url?: string
  tags: string[] // Array of tag names (not tag IDs)
  images?: MineralImage[]
  status: MineralStatus
  meta_title?: string
  meta_description?: string
}

/**
 * Data for updating an existing mineral
 * All fields except id are optional
 */
export interface UpdateMineralData extends Partial<CreateMineralData> {
  id: string // Required to identify which mineral to update
}

/**
 * Data required to create a new tag
 * Note: id, created_at, updated_at are auto-generated
 */
export interface CreateTagData {
  name: string
  color: string // Hex color code, defaults to '#6B7280' in database
  description?: string
}

/**
 * Data for updating an existing tag
 * All fields except id are optional
 */
export interface UpdateTagData extends Partial<CreateTagData> {
  id: string // Required to identify which tag to update
}

// ===========================================
// UTILITY TYPES
// ===========================================

/**
 * Tag with color and name info for UI display
 * Used in published_minerals view and tag lookups
 */
export interface TagDetail {
  name: string
  color: string
}

/**
 * Enhanced mineral type matching the published_minerals view
 * Includes resolved tag details instead of just tag names
 */
export interface PublishedMineral extends Omit<Mineral, 'tags'> {
  tag_details: TagDetail[] | null
}

/**
 * Search result from search_minerals function
 * Includes relevance score for ranking
 */
export interface MineralSearchResult extends Omit<Mineral, 'images' | 'meta_title' | 'meta_description'> {
  relevance: number
}

/**
 * Parameters for search_minerals function
 */
export interface SearchMineralsParams {
  search_term?: string
  filter_tags?: string[]
  limit_count?: number
  offset_count?: number
}

/**
 * Storage bucket identifiers matching Supabase setup
 */
export type StorageBucket = 'mineral-images' | 'mineral-videos'