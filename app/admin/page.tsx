import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  getCurrentEdition,
  getAllEditions,
  getAllCategories,
} from "@/lib/data"

const adminLinks = [
  { label: "Editions", href: "/admin/editions" },
  { label: "Memes", href: "/admin/memes" },
  { label: "Design", href: "/admin/design" },
  { label: "Video", href: "/admin/video" },
  { label: "Articles", href: "/admin/articles" },
  { label: "Media Library", href: "/admin/media" },
]

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [currentEdition, editions, categories, postsResult] = await Promise.all([
    getCurrentEdition(),
    getAllEditions(),
    getAllCategories(),
    supabase.from("posts").select("category_id"),
  ])

  const postsByCategory = (postsResult.data ?? []).reduce(
    (acc, p) => {
      acc[p.category_id] = (acc[p.category_id] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const name =
    user?.user_metadata?.full_name ?? user?.email ?? "Admin"
  const avatarUrl = user?.user_metadata?.avatar_url

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-10">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="h-14 w-14 rounded-full border-2 border-[#222]"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-dose-orange/20 flex items-center justify-center text-dose-orange text-xl font-serif">
            {(user?.email?.[0] ?? "?").toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-serif text-white">
            Welcome, {name}
          </h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-300 mb-2">
          Current edition
        </h2>
        <p className="text-dose-orange font-serif text-xl">
          {currentEdition
            ? formatDate(currentEdition.date)
            : "No current edition set"}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-300 mb-2">
          Total editions
        </h2>
        <p className="text-white text-2xl">{editions.length}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-300 mb-2">
          Posts per category
        </h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex justify-between text-gray-300"
            >
              <span>{cat.name}</span>
              <span className="text-dose-orange">
                {postsByCategory[cat.id] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-4">
          Quick links
        </h2>
        <div className="flex flex-wrap gap-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg bg-[#222] text-gray-300 hover:text-dose-orange hover:bg-[#2a2a2a] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
