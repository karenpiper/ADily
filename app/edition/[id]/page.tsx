import { notFound } from "next/navigation"
import { EditionLayout } from "@/components/edition-layout"
import { DateGroup } from "@/components/date-group"
import { ArticleCard } from "@/components/article-card"
import { ImageGrid } from "@/components/image-grid"
import { EditionLikesComments } from "@/components/edition-likes-comments"
import { getEditionWithThemes, getCurrentEdition } from "@/lib/data"
import { getEditionLikes, getEditionComments } from "@/lib/edition-engagement"
import { createClient } from "@/lib/supabase/server"
import type { MediaItem, Article } from "@/lib/types"

function formatEditionDate(dateStr: string): string {
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const y = d.getFullYear()
  return `${m}/${day}/${y}`
}

function mediaToGridImage(m: MediaItem, index: number) {
  return {
    id: m.id,
    url: m.url,
    thumbnailUrl: m.thumbnail_url ?? undefined,
    isVideo: m.type === "video",
    externalLink: m.external_link ?? undefined,
    caption: m.caption ?? undefined,
    colSpan: index === 0 ? 3 : 2,
    rowSpan: 1,
    aspectRatio: index === 0 ? "16/9" : "4/3",
  }
}

function articleToCardImage(a: Article) {
  return a.image_url
    ? [{ id: a.id, aspectRatio: "16/9" as const, url: a.image_url }]
    : [{ id: `${a.id}-placeholder`, aspectRatio: "16/9" as const }]
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [edition, currentEdition, initialLikes, initialComments] = await Promise.all([
    getEditionWithThemes(id),
    getCurrentEdition(),
    user ? getEditionLikes(id) : Promise.resolve(null),
    user ? getEditionComments(id) : Promise.resolve(null),
  ])
  if (!edition) notFound()

  const dateLabel = formatEditionDate(edition.date)
  const theme = edition.themes[0] ?? null

  const engagementInitial =
    user && initialLikes !== null && initialComments !== null
      ? {
          likeCount: initialLikes.count,
          userLiked: initialLikes.userLiked,
          comments: initialComments,
        }
      : null

  return (
    <EditionLayout
      editionDate={dateLabel}
      currentEditionId={currentEdition?.id ?? null}
    >
      <div className="animate-fade-in">
        <p className="text-[16px] font-sans text-dose-orange mb-8">{dateLabel}</p>
        {/* Single theme per edition */}
        {!theme ? (
          <p className="text-dose-gray-mid text-sm">No theme for this edition yet.</p>
        ) : (
          <section className="animate-fade-in">
            {theme.posts.length === 0 ? (
              <p className="text-dose-gray-mid text-sm">No content yet.</p>
            ) : (
              <div className="flex flex-col gap-16">
                {theme.posts.map((post) => (
                  <div key={post.id}>
                    {(post.headline || post.post_insights.length > 0 || post.media_items.length > 0) && (
                      <DateGroup
                        date=""
                        headline={post.headline || theme.name}
                        insights={[...post.post_insights]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((i) => ({ label: i.label, text: i.description }))}
                        images={[...post.media_items]
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((m, i) => mediaToGridImage(m, i))}
                      />
                    )}

                    {post.articles && post.articles.length > 0 && (
                      <div className="mt-12">
                        <div className="articles-grid">
                          {[...post.articles]
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((article) => (
                              <ArticleCard
                                key={article.id}
                                title={article.title}
                                summary={article.summary}
                                url={article.url}
                                author={article.author}
                                source={article.source}
                                images={articleToCardImage(article)}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <EditionLikesComments
          editionId={edition.id}
          user={user}
          initial={engagementInitial}
        />
      </div>
    </EditionLayout>
  )
}
