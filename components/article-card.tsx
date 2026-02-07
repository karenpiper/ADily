"use client"

import { useEffect, useRef, useState } from "react"
import { MediaImage } from "@/components/media-image"

interface ArticleImage {
  id: string
  colSpan?: number
  rowSpan?: number
  aspectRatio?: string
  url?: string
}

interface ArticleCardProps {
  title: string
  summary: string
  url?: string
  author?: string | null
  source?: string | null
  images: ArticleImage[]
}

export function ArticleCard({ title, summary, url, author, source, images }: ArticleCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-3 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Image on top for grid layout */}
      <div className="w-full">
        {images[0] && (
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: images[0].aspectRatio || "16/9" }}
          >
            {images[0].url ? (
              <MediaImage
                src={images[0].url}
                alt=""
                className="w-full h-full object-cover block"
              />
            ) : (
              <div className="w-full h-full bg-dose-gray-dark/40 flex items-center justify-center text-zinc-500 text-sm">
                <span>Image pending</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Text below */}
      <div>
        <a
          href={url ?? "#"}
          target={url ? "_blank" : undefined}
          rel={url ? "noopener noreferrer" : undefined}
          className="text-base font-serif text-foreground underline underline-offset-4 hover:text-dose-orange transition-colors duration-150 leading-snug block mb-1"
        >
          {title}
        </a>
        {(author || source) && (
          <p className="text-xs text-dose-gray-mid mb-1">
            {[author, source].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="text-sm leading-relaxed text-dose-gray-mid line-clamp-3">
          {summary}
        </p>
      </div>
    </div>
  )
}
