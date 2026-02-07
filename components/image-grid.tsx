"use client"

import { useEffect, useRef, useState } from "react"
import { MediaImage } from "@/components/media-image"

export interface GridImage {
  id: string
  colSpan?: number
  rowSpan?: number
  aspectRatio?: string
  isVideo?: boolean
  url?: string
  thumbnailUrl?: string
}

export function ImageGrid({ images }: { images: GridImage[] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {images.map((img, i) => (
        <GridItem key={img.id} image={img} index={i} />
      ))}
    </div>
  )
}

function GridItem({ image, index }: { image: GridImage; index: number }) {
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

  const mediaContent = image.url ? (
    image.isVideo ? (
      <video
        src={image.url}
        poster={image.thumbnailUrl ?? undefined}
        className="w-full h-full object-cover"
        muted
        playsInline
        loop
        preload="metadata"
      />
    ) : (
      <MediaImage
        src={image.url}
        alt={image.thumbnailUrl ?? "Media"}
        className="w-full h-full object-cover"
      />
    )
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-dose-gray-dark/80 to-dose-black/60 flex items-center justify-center text-zinc-500 text-sm">
      <span>Image pending upload</span>
    </div>
  )

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-lg group"
      style={{
        gridColumn: `span ${image.colSpan || 1}`,
        gridRow: `span ${image.rowSpan || 1}`,
        aspectRatio: image.aspectRatio || "4/3",
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div
        className={`w-full h-full bg-dose-gray-dark/60 transition-transform duration-200 group-hover:scale-[1.02] ${
          visible ? "grid-item-animate" : "opacity-0"
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {mediaContent}
      </div>
      {image.isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-foreground/80">
            <span className="text-dose-black text-xl ml-1">
              {"▶"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
