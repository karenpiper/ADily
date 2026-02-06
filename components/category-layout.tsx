import type { ReactNode } from "react"
import { AmazonAdsLogo } from "@/components/amazon-ads-logo"
import { CategoryNav } from "@/components/category-nav"

interface CategoryLayoutProps {
  activeCategory: string
  description: string
  children: ReactNode
}

export function CategoryLayout({
  activeCategory,
  description,
  children,
}: CategoryLayoutProps) {
  return (
    <div className="min-h-screen bg-dose-black text-foreground">
      {/* Sticky top nav */}
      <nav className="sticky top-0 z-50 bg-dose-black/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto flex items-center justify-between px-6 py-3 max-w-[1400px]">
          <a href="/" className="shrink-0">
            <AmazonAdsLogo />
          </a>
          <p className="hidden md:block flex-1 text-center text-[13px] italic text-dose-orange font-serif px-6 max-w-xl">
            {description}
          </p>
          <CategoryNav active={activeCategory} />
        </div>
      </nav>
      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-6 py-12">
        {children}
      </main>
    </div>
  )
}
