import { ImageGrid } from "@/components/image-grid"

interface Insight {
  label: string
  text: string
}

interface GridImage {
  id: string
  colSpan?: number
  rowSpan?: number
  aspectRatio?: string
  isVideo?: boolean
}

interface DateGroupProps {
  date: string
  headline: string
  insights: Insight[]
  images: GridImage[]
}

export function DateGroup({ date, headline, insights, images }: DateGroupProps) {
  return (
    <section className="animate-fade-in">
      {/* Date label */}
      <p className="text-[16px] font-sans text-dose-orange mb-4">{date}</p>

      {/* Two columns */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left - Insights */}
        <div className="lg:w-[42%]">
          <h2 className="text-[26px] font-serif leading-snug text-foreground mb-2 text-balance">
            {headline}
          </h2>
          <div className="w-[60%] h-px bg-dose-orange mb-6" />
          <div className="flex flex-col gap-4">
            {insights.map((insight) => (
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

        {/* Right - Image grid */}
        <div className="lg:w-[58%]">
          <ImageGrid images={images} />
        </div>
      </div>
    </section>
  )
}
