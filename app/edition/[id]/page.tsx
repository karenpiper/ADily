import { notFound } from "next/navigation"
import { EditionLayout } from "@/components/edition-layout"
import { DateGroup } from "@/components/date-group"
import { ArticleCard } from "@/components/article-card"
import { ImageGrid } from "@/components/image-grid"
import { getEditionWithThemes, getCurrentEdition } from "@/lib/data"
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
  const [edition, currentEdition] = await Promise.all([
    getEditionWithThemes(id),
    getCurrentEdition(),
  ])
  if (!edition) notFound()

  const dateLabel = formatEditionDate(edition.date)
  const theme = edition.themes[0] ?? null

  return (
    <EditionLayout
      editionDate={dateLabel}
      currentEditionId={currentEdition?.id ?? null}
    >
      <div className="animate-fade-in">
        {/* Edition hero */}
        <div className="mb-16">
          <p className="text-[16px] font-sans text-dose-orange mb-2">{dateLabel}</p>
          <h1 className="text-[32px] font-serif leading-tight text-foreground mb-4 uppercase">
            {edition.hero_summary}
          </h1>
          <div className="w-[60%] h-px bg-dose-orange mb-4" />
          <p className="text-sm leading-relaxed text-dose-gray-light max-w-2xl">
            {edition.hero_description}
          </p>
        </div>

        {/* Single theme per edition */}
        {!theme ? (
          <p className="text-dose-gray-mid text-sm">No theme for this edition yet.</p>
        ) : (
          <section className="animate-fade-in">
            <h2 className="text-[22px] font-serif text-dose-orange mb-2 uppercase">
              {theme.name}
            </h2>
            {theme.description && (
              <p className="text-dose-gray-light text-sm max-w-2xl mb-10">
                {theme.description}
              </p>
            )}

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
      </div>
    </EditionLayout>
  )
}
