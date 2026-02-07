"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const baseNavItems = [
  { label: "Editions", href: "/admin/editions", icon: "📋" },
  { label: "Memes", href: "/admin/memes", icon: "😂" },
  { label: "Design", href: "/admin/design", icon: "🎨" },
  { label: "Video", href: "/admin/video", icon: "🎬" },
  { label: "Articles", href: "/admin/articles", icon: "📰" },
  { label: "Media Library", href: "/admin/media", icon: "🖼️" },
]

interface AdminSidebarProps {
  user: User | null
  userRole: string | null
}

export function AdminSidebar({ user, userRole }: AdminSidebarProps) {
  const navItems = [
    ...baseNavItems,
    ...(userRole === "admin"
      ? [{ label: "Users", href: "/admin/users", icon: "👥" as const }]
      : []),
  ]
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[#222] bg-[#111] flex flex-col">
      <div className="p-6">
        <p className="font-serif text-dose-orange text-lg">ADily Dose</p>
        <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? "text-dose-orange border-l-2 border-dose-orange pl-2 -ml-0.5"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#222]">
        {user && (
          <div className="flex items-center gap-3 mb-3">
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-dose-orange/20 flex items-center justify-center text-dose-orange text-sm font-medium">
                {(user.email?.[0] ?? "?").toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-300 truncate">
                {user.user_metadata?.full_name ?? user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-2 px-3 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
