import type { ReactNode } from "react"
import Link from "next/link"
import { AmazonAdsLogo } from "@/components/amazon-ads-logo"

interface EditionLayoutProps {
  /** Edition date for nav subtitle */
  editionDate?: string
  children: ReactNode
}

export function EditionLayout({ editionDate, children }: EditionLayoutProps) {
  return (
    <div className="min-h-screen bg-dose-black text-foreground">
      <nav className="sticky top-0 z-50 bg-dose-black/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto flex items-center justify-between px-6 py-3 max-w-[1400px]">
          <Link href="/" className="shrink-0">
            <AmazonAdsLogo />
          </Link>
          <p className="hidden md:block flex-1 text-center text-[13px] italic text-dose-orange font-serif px-6 max-w-xl">
            {editionDate ? `Edition · ${editionDate}` : "Edition"}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70"
            >
              Home
            </Link>
            <Link
              href="/archive"
              className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70"
            >
              Archive
            </Link>
          </div>
        </div>
      </nav>
      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-12">
        {children}
      </main>
    </div>
  )
}
