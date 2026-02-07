import { CategoryLayout } from "@/components/category-layout"
import { ArticleCard } from "@/components/article-card"
import { getPostsByCategory, getCategoryBySlug } from "@/lib/data"
import type { Article } from "@/lib/types"

function formatCategoryDate(dateStr: string): string {
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const y = d.getFullYear()
  return `${m}/${day}/${y}`
}

function articleToCardImage(a: Article) {
  return a.image_url
    ? [
        {
          id: a.id,
          colSpan: 1,
          aspectRatio: "16/9" as const,
          url: a.image_url,
        },
      ]
    : [{ id: `${a.id}-placeholder`, colSpan: 1, aspectRatio: "16/9" as const }]
}

export default async function ArticlesPage() {
  const [categoryData, category] = await Promise.all([
    getPostsByCategory("articles"),
    getCategoryBySlug("articles"),
  ])

  const description =
    category?.description ??
    "Relevant platforms news and updates that our teams should know about."

  const postSections = categoryData.dateGroups.flatMap((group) =>
    group.posts.map((post) => ({
      date: formatCategoryDate(group.date),
      headline: post.headline,
      insights: [...post.post_insights]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({ label: i.label, text: i.description })),
      articles: [...post.articles].sort((a, b) => a.sort_order - b.sort_order),
    }))
  )

  return (
    <CategoryLayout activeCategory="articles" description={description}>
      <div className="animate-fade-in">
        {postSections.length === 0 ? (
          <p className="text-dose-cream font-serif text-lg">
            No content yet
          </p>
        ) : (
          postSections.map((section, sectionIndex) => (
            <div
              key={`${section.date}-${sectionIndex}`}
              className={sectionIndex > 0 ? "mt-20" : ""}
            >
              {/* Date */}
              <p className="text-[16px] font-sans text-dose-orange mb-4">
                {section.date}
              </p>

              {/* Headline + Insights */}
              <div className="max-w-3xl mb-16">
                <h2 className="text-[26px] font-serif leading-snug text-foreground mb-2 text-balance">
                  {section.headline}
                </h2>
                <div className="w-[60%] h-px bg-dose-orange mb-6" />
                <div className="flex flex-col gap-4">
                  {section.insights.map((insight) => (
                    <div
                      key={insight.label}
                      className="flex gap-3 items-start"
                    >
                      <span className="text-dose-orange mt-1 text-sm shrink-0">
                        {"●"}
                      </span>
                      <p className="text-sm leading-relaxed text-dose-gray-light">
                        <span className="font-bold text-dose-orange">
                          {insight.label}:{" "}
                        </span>
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Cards - grid */}
              <div className="articles-grid">
                {section.articles.map((article) => (
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
          ))
        )}
      </div>
    </CategoryLayout>
  )
}
