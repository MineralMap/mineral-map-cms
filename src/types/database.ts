export type MineralStatus = 'draft' | 'published' | 'archived'

export interface Tag {
  id: string
  name: string
  color: string
  description?: string
  created_at: string
  updated_at: string
}

export interface MineralImage {
  id: string
  url: string
  alt?: string
  caption?: string
  filename: string
  size: number
}

export interface Mineral {
  id: string
  title: string
  slug: string
  description?: string
  video_url?: string
  tags: string[]
  images: MineralImage[]
  status: MineralStatus
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface CreateMineralData {
  title: string
  slug?: string
  description?: string
  video_url?: string
  tags: string[]
  images?: MineralImage[]
  status: MineralStatus
  meta_title?: string
  meta_description?: string
}

export interface UpdateMineralData extends Partial<CreateMineralData> {
  id: string
}

export interface CreateTagData {
  name: string
  color: string
  description?: string
}

export interface UpdateTagData extends Partial<CreateTagData> {
  id: string
}