import { AmazonAdsLogo } from "@/components/amazon-ads-logo"
import { HomeTitle } from "@/components/home-title"
import { StickyNote } from "@/components/sticky-note"
import { HomeSidebar } from "@/components/home-sidebar"
import { getCurrentEdition } from "@/lib/data"

function formatEditionDate(dateStr: string): string {
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}-${dd} - ${yy}`
}

export default async function HomePage() {
  const edition = await getCurrentEdition()

  return (
    <div className="relative min-h-screen bg-dose-black">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dose-black">
        <div className="px-6 py-4">
          <AmazonAdsLogo />
        </div>
        {/* Orange gradient line */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(to right, #E8632B 0%, #E8632B 30%, transparent 100%)",
          }}
        />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen pt-16">
        {/* Left side */}
        <div className="flex-1 lg:w-[60%] flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 lg:py-0">
          <HomeTitle />
          <div className="mt-16 lg:mt-20">
            {edition ? (
              <StickyNote
                date={formatEditionDate(edition.date)}
                heroDescription={edition.hero_description}
                heroSummary={edition.hero_summary}
              />
            ) : (
              <p className="text-dose-cream font-serif text-lg">
                No current edition
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="lg:w-[35%] flex items-center justify-center px-6 md:px-12 lg:px-8 py-12 lg:py-0">
          <div className="w-full max-w-[300px]">
            <HomeSidebar featuredImageUrl={edition?.featured_meme_url ?? null} />
          </div>
        </div>
      </div>
    </div>
  )
}
