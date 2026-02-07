import { CategoryLayout } from "@/components/category-layout"
import { DateGroup } from "@/components/date-group"
import { getPostsByCategory, getCategoryBySlug } from "@/lib/data"
import type { MediaItem } from "@/lib/types"

function formatCategoryDate(dateStr: string): string {
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const y = d.getFullYear()
  return `${m}/${day}/${y}`
}

function mediaToGridImage(m: MediaItem) {
  const colSpan = m.size === "large" ? 3 : m.size === "medium" ? 2 : 1
  const aspectRatio = m.size === "large" ? "16/9" : m.size === "medium" ? "4/3" : "1"
  return {
    id: m.id,
    url: m.url,
    thumbnailUrl: m.thumbnail_url ?? undefined,
    isVideo: m.type === "video",
    externalLink: m.external_link ?? undefined,
    colSpan,
    rowSpan: 1,
    aspectRatio,
  }
}

export default async function MemesPage() {
  const [categoryData, category] = await Promise.all([
    getPostsByCategory("memes"),
    getCategoryBySlug("memes"),
  ])

  const description =
    category?.description ??
    "Current memes, and random silly social things to understand our audiences' worlds and the current cultural mood."

  const postSections = categoryData.dateGroups.flatMap((group) =>
    group.posts.map((post) => ({
      date: formatCategoryDate(group.date),
      headline: post.headline,
      insights: [...post.post_insights]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({ label: i.label, text: i.description })),
      images: [...post.media_items]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(mediaToGridImage),
    }))
  )

  return (
    <CategoryLayout activeCategory="memes" description={description}>
      <div className="flex flex-col gap-20">
        {postSections.length === 0 ? (
          <p className="text-dose-cream font-serif text-lg">
            No content yet
          </p>
        ) : (
          postSections.map((section, i) => (
            <DateGroup
              key={`${section.date}-${i}`}
              date={section.date}
              headline={section.headline}
              insights={section.insights}
              images={section.images}
            />
          ))
        )}
      </div>
    </CategoryLayout>
  )
}
