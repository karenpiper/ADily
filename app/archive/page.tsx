import Link from "next/link"
import { EditionLayout } from "@/components/edition-layout"
import { getEditionsForArchive } from "@/lib/data"

function formatEditionDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function ArchivePage() {
  const editions = await getEditionsForArchive()

  return (
    <EditionLayout>
      <div className="animate-fade-in">
        <h1 className="text-[28px] font-serif text-foreground mb-2">
          Archive
        </h1>
        <p className="text-dose-gray-mid text-sm mb-12">
          Past editions for reference.
        </p>

        {editions.length === 0 ? (
          <p className="text-dose-cream font-serif text-lg">No editions yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {editions.map((edition) => (
              <li key={edition.id}>
                <Link
                  href={`/edition/${edition.id}`}
                  className="block py-3 px-4 rounded-lg bg-dose-gray-dark/40 hover:bg-dose-gray-dark/60 transition-colors border border-transparent hover:border-dose-orange/30"
                >
                  <span className="text-dose-orange font-sans text-sm">
                    {formatEditionDate(edition.date)}
                  </span>
                  <p className="text-foreground font-serif mt-1 line-clamp-2">
                    {edition.hero_summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </EditionLayout>
  )
}
