import Link from "next/link"
import { cn } from "@/lib/utils"

const categories = [
  { label: "memes", href: "/memes" },
  { label: "design", href: "/design" },
  { label: "video", href: "/video" },
  { label: "articles", href: "/articles" },
]

export function CategoryNav({ active }: { active: string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {categories.map((cat) => (
        <Link
          key={cat.label}
          href={cat.href}
          className={cn(
            "shrink-0 rounded-full px-5 py-1.5 text-sm font-medium transition-colors duration-150",
            "bg-dose-gray-light/90 text-dose-black hover:bg-dose-gray-light/70",
            active === cat.label && "border-2 border-dose-orange"
          )}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  )
}
