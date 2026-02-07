// Database table types (match Supabase schema)

export type UserRole = "admin" | "editor" | "viewer"

export interface AllowedUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  added_by: string | null
  created_at: string
}

export interface Edition {
  id: string
  date: string
  hero_summary: string
  hero_description: string
  featured_meme_url: string | null
  is_current: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  sort_order: number
}

export interface Post {
  id: string
  edition_id: string
  category_id: string
  headline: string
  created_at: string
}

export interface PostInsight {
  id: string
  post_id: string
  label: string
  description: string
  sort_order: number
}

export type MediaItemType = 'image' | 'video'
export type MediaItemSize = 'small' | 'medium' | 'large'

export interface MediaItem {
  id: string
  post_id: string
  type: MediaItemType
  url: string
  thumbnail_url: string | null
  caption: string | null
  external_link: string | null
  sort_order: number
  size: MediaItemSize
}

export interface Article {
  id: string
  post_id: string
  title: string
  url: string
  summary: string
  image_url: string | null
  author: string | null
  source: string | null
  sort_order: number
}

// Nested types for convenience

export interface PostWithRelations extends Post {
  post_insights: PostInsight[]
  media_items: MediaItem[]
  articles: Article[]
}

export interface EditionWithContent extends Edition {
  posts: (PostWithRelations & { category: Category })[]
}

/** Post with nested insights, media_items, articles (alias for category page use). */
export type PostWithContent = PostWithRelations

/** Category page: posts grouped by edition date, newest first. */
export type CategoryPageData = {
  dateGroups: {
    date: string
    posts: PostWithContent[]
  }[]
}
