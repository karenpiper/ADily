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
      className={`flex flex-col md:flex-row gap-8 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Text side */}
      <div className="md:w-[35%]">
        <a
          href={url ?? "#"}
          target={url ? "_blank" : undefined}
          rel={url ? "noopener noreferrer" : undefined}
          className="text-lg font-serif text-foreground underline underline-offset-4 hover:text-dose-orange transition-colors duration-150 leading-snug block mb-2"
        >
          {title}
        </a>
        {(author || source) && (
          <p className="text-xs text-dose-gray-mid mb-2">
            {[author, source].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="text-sm leading-relaxed text-dose-gray-mid">
          {summary}
        </p>
      </div>

      {/* Image collage side */}
      <div className="md:w-[65%]">
        <div className="grid grid-cols-2 gap-1">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative overflow-hidden rounded-lg group"
              style={{
                gridColumn: `span ${img.colSpan || 1}`,
                aspectRatio: img.aspectRatio || "16/9",
              }}
            >
              <div className="w-full h-full bg-dose-gray-dark/60 transition-transform duration-200 group-hover:scale-[1.02]">
                {img.url ? (
                  <MediaImage
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-dose-gray-dark/80 to-dose-black/60 flex items-center justify-center text-zinc-500 text-sm">
                    <span>Image pending upload</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
