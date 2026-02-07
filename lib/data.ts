import { createClient } from '@/lib/supabase/server'
import type {
  Category,
  CategoryPageData,
  Edition,
  EditionWithContent,
  PostWithRelations,
} from '@/lib/types'

// Fetches the current edition with featured_meme_url for the homepage
export async function getCurrentEdition(): Promise<Edition | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .eq('is_current', true)
    .maybeSingle()

  if (error) throw error
  return data
}

// Fetches all posts for a given category slug, grouped by edition date (newest first).
// Each post includes its insights and media_items, joined via Supabase's nested select.
export async function getPostsByCategory(
  categorySlug: string
): Promise<CategoryPageData> {
  const supabase = await createClient()

  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (catError) throw catError
  if (!category) return { dateGroups: [] }

  const { data: rows, error } = await supabase
    .from('posts')
    .select(
      '*, editions(date), post_insights(*), media_items(*), articles(*)'
    )
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  if (!rows?.length) return { dateGroups: [] }

  type Row = (typeof rows)[0] & {
    editions: { date: string } | null
  }

  const byDate = new Map<string, PostWithRelations[]>()

  for (const row of rows as Row[]) {
    const { editions: edition, ...rest } = row
    const date = edition?.date ?? ''
    const post: PostWithRelations = {
      id: rest.id,
      edition_id: rest.edition_id,
      category_id: rest.category_id,
      headline: rest.headline,
      created_at: rest.created_at,
      post_insights: rest.post_insights ?? [],
      media_items: rest.media_items ?? [],
      articles: rest.articles ?? [],
    }
    if (!byDate.has(date)) byDate.set(date, [])
    byDate.get(date)!.push(post)
  }

  const dateGroups = Array.from(byDate.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, posts]) => ({ date, posts }))

  return { dateGroups }
}

// Fetches a single category by slug (for the nav description text)
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

// Fetches all categories ordered by sort_order
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Fetches all editions ordered by date desc (for admin)
export async function getAllEditions(): Promise<Edition[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

// Fetches a single edition by ID with all its posts/insights/media (for admin editing)
export async function getEditionById(
  id: string
): Promise<EditionWithContent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('editions')
    .select(
      '*, posts(*, post_insights(*), media_items(*), articles(*), categories(*))'
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  type PostRow = {
    id: string
    edition_id: string
    category_id: string
    headline: string
    created_at: string
    post_insights: unknown[]
    media_items: unknown[]
    articles: unknown[]
    categories: Category | Category[] | null
  }

  const posts = ((data.posts ?? []) as PostRow[]).map((p) => {
    const category = Array.isArray(p.categories) ? p.categories[0] : p.categories
    return {
      id: p.id,
      edition_id: p.edition_id,
      category_id: p.category_id,
      headline: p.headline,
      created_at: p.created_at,
      post_insights: p.post_insights ?? [],
      media_items: p.media_items ?? [],
      articles: p.articles ?? [],
      category: category ?? ({} as Category),
    }
  })

  return {
    id: data.id,
    date: data.date,
    hero_summary: data.hero_summary,
    hero_description: data.hero_description,
    featured_meme_url: data.featured_meme_url,
    is_current: data.is_current,
    created_at: data.created_at,
    posts,
  }
}
