import { CategoryLayout } from "@/components/category-layout"
import { DateGroup } from "@/components/date-group"

const memesData = [
  {
    date: "2/2/2026",
    headline:
      "Audiences, yearning for more, are transforming online fatigue into real-life fulfillment.",
    insights: [
      {
        label: "Nostalgia Reigns",
        text: "Audiences crave nostalgic content that provides an emotional connection and reflects both the evolution of pop culture and their own personal lives.",
      },
      {
        label: "Social Media Fatigue",
        text: "Users are growing weary of endless scrolling through the ever-changing landscapes of social media, feeling overwhelmed by constant updates and curated content.",
      },
      {
        label: "Audience Seek Empowerment",
        text: "Inspirational content that encourages people to embrace spontaneity and be more experimental with life choices.",
      },
    ],
    images: [
      { id: "m1", colSpan: 2, rowSpan: 1, aspectRatio: "4/3" },
      { id: "m2", colSpan: 1, rowSpan: 1, aspectRatio: "1/1" },
      { id: "m3", colSpan: 1, rowSpan: 1, aspectRatio: "1/1" },
      { id: "m4", colSpan: 2, rowSpan: 1, aspectRatio: "4/3" },
    ],
  },
  {
    date: "12/2025",
    headline:
      "Digital culture is shifting from passive consumption to active meaning-making.",
    insights: [
      {
        label: "Community Over Content",
        text: "Users are gravitating toward platforms that prioritize genuine community interaction.",
      },
      {
        label: "Slow Social",
        text: "A counter-movement to infinite scroll encourages mindful, intentional social media use.",
      },
    ],
    images: [
      { id: "m5", colSpan: 1, rowSpan: 1, aspectRatio: "4/3" },
      { id: "m6", colSpan: 2, rowSpan: 1, aspectRatio: "4/3" },
      { id: "m7", colSpan: 3, rowSpan: 1, aspectRatio: "16/9" },
    ],
  },
]

export default function MemesPage() {
  return (
    <CategoryLayout
      activeCategory="memes"
      description="Current memes, and random silly social things to understand our audiences' worlds and the current cultural mood."
    >
      <div className="flex flex-col gap-20">
        {memesData.map((group) => (
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
