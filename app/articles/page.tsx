import { CategoryLayout } from "@/components/category-layout"
import { ArticleCard } from "@/components/article-card"

const articlesInsights = [
  {
    label: "Connection Over Clicks",
    text: "As social platforms evolve, users are craving the human side of social — prioritizing authentic connection and resisting changes that feel transactional or inauthentic.",
  },
  {
    label: "Authenticity Isn't Optional",
    text: "While platforms introduce new features to address this tension, skepticism remains. For B2B marketers, this raises the bar: relevance and trust must be earned, not engineered.",
  },
]

const articlesData = [
  {
    title:
      "Welcome to Desocialized Media: Platforms built to connect people, for better or for worse, are now for doing the opposite",
    summary:
      "Instagram's shift to Reels has moved the platform from social connection to algorithm-driven entertainment, ushering in what the article calls 'desocialized media.' The article argues that by prioritizing AI-driven recommendations over content from people's actual networks, Instagram now feels more like a passive consumption feed than a true social platform.",
    images: [
      { id: "a1", colSpan: 1, rowSpan: 1, aspectRatio: "16/9" },
      { id: "a2", colSpan: 1, rowSpan: 1, aspectRatio: "16/9" },
      { id: "a3", colSpan: 2, rowSpan: 1, aspectRatio: "16/9" },
    ],
  },
  {
    title: "Instagram Tests Displaying 'Friends' Instead of 'Following'",
    summary:
      "Instagram is testing a change that would replace the traditional 'Following' display on profiles with a 'Friends' count that shows only mutual followers, highlighting two-way connections instead of everyone you follow.",
    images: [
      { id: "a4", colSpan: 2, rowSpan: 1, aspectRatio: "16/9" },
      { id: "a5", colSpan: 1, rowSpan: 1, aspectRatio: "4/3" },
    ],
  },
]

export default function ArticlesPage() {
  return (
    <CategoryLayout
      activeCategory="articles"
      description="Relevant platforms news and updates that our teams should know about."
    >
      <div className="animate-fade-in">
        {/* Date */}
        <p className="text-[16px] font-sans text-dose-orange mb-4">2/2/2026</p>

        {/* Headline + Insights */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-[26px] font-serif leading-snug text-foreground mb-2 text-balance">
            People First, Platforms Second: Authentic engagement matters more
            than clicks or features, putting humans rather than mechanics at the
            center of social.
          </h2>
          <div className="w-[60%] h-px bg-dose-orange mb-6" />
          <div className="flex flex-col gap-4">
            {articlesInsights.map((insight) => (
              <div key={insight.label} className="flex gap-3 items-start">
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

        {/* Article Cards */}
        <div className="flex flex-col gap-16">
          {articlesData.map((article) => (
            <ArticleCard
              key={article.title}
              title={article.title}
              summary={article.summary}
              images={article.images}
            />
          ))}
        </div>
      </div>
    </CategoryLayout>
  )
}
