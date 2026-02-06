import { CategoryLayout } from "@/components/category-layout"
import { DateGroup } from "@/components/date-group"

const designData = [
  {
    date: "2/2/2026",
    headline:
      "Design That Cuts Through Complexity, Humanizes Experience, and Brings Creative Ideas to Life Through Shape, Scale, and Motion",
    insights: [
      {
        label: "These brands don't add complexity - they clarify",
        text: "Clear forms, deliberate choices, and purposeful design make the message easier to see, understand, and remember.",
      },
      {
        label: "They simplify the complex and humanize UI",
        text: "Brands are making innovation feel accessible by turning powerful tools into experiences audiences instantly understand and trust.",
      },
      {
        label: "Shape, Scale, and Perspective",
        text: "Using motion, sound, and perspective to guide attention, create depth, and make ideas feel more immersive and intuitive.",
      },
    ],
    images: [
      { id: "d1", colSpan: 2, rowSpan: 1, aspectRatio: "3/4", isVideo: true },
      { id: "d2", colSpan: 1, rowSpan: 1, aspectRatio: "3/4" },
      { id: "d3", colSpan: 1, rowSpan: 1, aspectRatio: "16/9" },
      { id: "d4", colSpan: 2, rowSpan: 1, aspectRatio: "16/9", isVideo: true },
      { id: "d5", colSpan: 2, rowSpan: 1, aspectRatio: "3/4" },
      { id: "d6", colSpan: 1, rowSpan: 1, aspectRatio: "3/4" },
    ],
  },
]

export default function DesignPage() {
  return (
    <CategoryLayout
      activeCategory="design"
      description="Thought starters for design templates and use of motion outside of Amazon."
    >
      <div className="flex flex-col gap-20">
        {designData.map((group) => (
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
