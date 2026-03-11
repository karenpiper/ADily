"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MainNavProps {
  currentEditionId?: string | null
}

const pillBase =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors shrink-0"

export function MainNav({ currentEditionId = null }: MainNavProps) {
  const pathname = usePathname()

  const isHome = pathname === "/"
  const isEdition = pathname.startsWith("/edition/")
  const isArticles = pathname.startsWith("/articles")
  const isArchive = pathname.startsWith("/archive")

  const editionHref = currentEditionId ? `/edition/${currentEditionId}` : "/archive"

  return (
    <nav className="flex items-center gap-2" aria-label="Main">
      <Link
        href="/"
        className={cn(
          pillBase,
          isHome
            ? "bg-dose-orange text-white hover:bg-dose-orange/90"
            : "bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70"
        )}
      >
        Home
      </Link>
      <Link
        href={editionHref}
        className={cn(
          pillBase,
          isEdition
            ? "bg-dose-orange text-white hover:bg-dose-orange/90"
            : "bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70"
        )}
      >
        Current edition
      </Link>
      <Link
        href="/articles"
        className={cn(
          pillBase,
          isArticles
            ? "bg-dose-orange text-white hover:bg-dose-orange/90"
            : "bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70"
        )}
      >
        Articles
      </Link>
      <Link
        href="/archive"
        className={cn(
          pillBase,
          isArchive
            ? "bg-dose-orange text-white hover:bg-dose-orange/90"
            : "bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70"
        )}
      >
        Archive
      </Link>
    </nav>
  )
}
