import type { ReactNode } from "react"
import Link from "next/link"
import { AmazonAdsLogo } from "@/components/amazon-ads-logo"
import { MainNav } from "@/components/main-nav"

interface EditionLayoutProps {
  /** Edition date for nav subtitle (optional, e.g. for edition page) */
  editionDate?: string
  /** Current edition id for nav links */
  currentEditionId?: string | null
  children: ReactNode
}

export function EditionLayout({ editionDate, currentEditionId, children }: EditionLayoutProps) {
  return (
    <div className="min-h-screen bg-dose-black text-foreground">
      <nav className="sticky top-0 z-50 bg-dose-black/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto flex items-center justify-between px-6 py-3 max-w-[1400px]">
          <Link href="/" className="shrink-0">
            <AmazonAdsLogo />
          </Link>
          <MainNav currentEditionId={currentEditionId ?? null} />
        </div>
      </nav>
      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-12">
        {children}
      </main>
    </div>
  )
}
