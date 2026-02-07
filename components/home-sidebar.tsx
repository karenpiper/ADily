import Link from "next/link"

const navItems = [
  { label: "Memes", href: "/memes" },
  { label: "Design", href: "/design" },
  { label: "Videos", href: "/video" },
  { label: "Articles", href: "/articles" },
]

interface HomeSidebarProps {
  featuredImageUrl?: string | null
}

export function HomeSidebar({ featuredImageUrl }: HomeSidebarProps = {}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Welcome */}
      <p className="text-[16px] font-serif text-foreground text-center">
        Welcome to your ADily Dose
      </p>

      {/* Featured image */}
      <div className="w-[200px] h-[150px] rounded-lg bg-dose-gray-dark/50 overflow-hidden">
        {featuredImageUrl ? (
          <img
            src={featuredImageUrl}
            alt="Featured"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-dose-gray-dark/40 to-dose-black/30" />
        )}
      </div>

      {/* Orange rule */}
      <div className="w-full h-px bg-dose-orange" />

      {/* Inspiration text */}
      <p className="text-sm font-serif italic text-dose-orange text-center">
        *of inspiration*
      </p>

      {/* Spacing */}
      <div className="h-4" />

      {/* Navigation list */}
      <nav className="w-full flex flex-col">
        {navItems.map((item, index) => (
          <div key={item.label}>
            {index > 0 && <div className="h-px bg-dose-gray-dark" />}
            <Link
              href={item.href}
              className="block py-4 text-center text-[38px] font-serif italic text-foreground transition-colors duration-150 hover:text-dose-orange"
            >
              {item.label}
            </Link>
          </div>
        ))}
        <div className="h-px bg-dose-gray-dark" />
      </nav>
    </div>
  )
}
