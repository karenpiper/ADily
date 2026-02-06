import { CategoryLayout } from "@/components/category-layout"
import { DateGroup } from "@/components/date-group"

const videoData = [
  {
    date: "2/2/2026",
    headline:
      "Audiences crave content that puts humans first, digs beneath the surface, offers space to recharge and connect.",
    insights: [
      {
        label: "Beyond the Surface",
        text: "Audiences are looking for content that offers escape through obscure layered humor or uncovers a deeper meaning, giving audiences more than what meets the eye.",
      },
      {
        label: "Unplug to Recharge",
        text: "Users are making efforts to escape endless feeds, looking for offline experiences to recharge, find balance, and fight social media burnout.",
      },
      {
        label: "Creators Shine, Audiences Engage",
        text: "Audiences light up for content that spotlights brand-creator partnerships, while fast, culturally tuned brand reactions boost engagement and signal authenticity.",
      },
      {
        label: "See the People, Not Just the Product",
        text: "Users are drawn to content that goes beyond the product, highlighting office culture through behind-the-scenes content and offering a more human-focused perspective from the brand.",
      },
    ],
    images: [
      { id: "v1", colSpan: 2, rowSpan: 1, aspectRatio: "9/16", isVideo: true },
      { id: "v2", colSpan: 1, rowSpan: 1, aspectRatio: "16/9", isVideo: true },
      { id: "v3", colSpan: 1, rowSpan: 1, aspectRatio: "9/16", isVideo: true },
      { id: "v4", colSpan: 2, rowSpan: 1, aspectRatio: "16/9", isVideo: true },
      { id: "v5", colSpan: 2, rowSpan: 1, aspectRatio: "9/16", isVideo: true },
      { id: "v6", colSpan: 1, rowSpan: 1, aspectRatio: "16/9", isVideo: true },
    ],
  },
]

export default function VideoPage() {
  return (
    <CategoryLayout
      activeCategory="video"
      description="Social trends, and other things happening on video that are relevant to the people we speak to and their wider world."
    >
      <div className="flex flex-col gap-20">
        {videoData.map((group) => (
          <DateGroup
            key={group.date}
            date={group.date}
            headline={group.headline}
            insights={group.insights}
            images={group.images}
          />
        ))}
      </div>
    </CategoryLayout>
  )
}
