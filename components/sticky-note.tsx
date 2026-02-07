"use client"

interface StickyNoteProps {
  date: string
  heroDescription: string
  heroSummary: string
}

export function StickyNote({ date, heroDescription, heroSummary }: StickyNoteProps) {
  return (
    <div className="animate-float relative w-full max-w-[500px]">
      {/* Masking tape */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-[80px] h-[25px] rounded-sm"
        style={{
          background:
            "linear-gradient(135deg, rgba(180,175,165,0.7), rgba(160,155,145,0.5))",
          transform: "translateX(-50%) rotate(2deg)",
        }}
      />

      {/* Card */}
      <div
        className="relative bg-dose-cream rounded-sm px-10 py-10 text-card-foreground"
        style={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      >
        {/* Date */}
        <span className="absolute top-4 right-5 text-sm text-dose-gray-dark/60 font-hand">
          {date}
        </span>

        {/* First paragraph */}
        <p className="text-[15px] leading-relaxed text-dose-gray-dark font-serif mb-4 pr-16">
          {heroDescription}
        </p>

        {/* Second paragraph */}
        <p className="text-[15px] leading-relaxed text-dose-gray-dark font-serif font-bold">
          {heroSummary}
        </p>
      </div>
    </div>
  )
}
