"use client"

import { useEffect, useRef, useState } from "react"
import { MediaImage } from "@/components/media-image"
import { getSocialEmbedUrl } from "@/lib/embed-urls"

export interface GridImage {
  id: string
  colSpan?: number
  rowSpan?: number
  aspectRatio?: string
  isVideo?: boolean
  url?: string
  thumbnailUrl?: string
  /** When set to a TikTok or Instagram URL, the post embed is shown instead of the thumbnail */
  externalLink?: string
}

export function ImageGrid({ images }: { images: GridImage[] }) {
  return (
    <div className="image-grid-root">
      {images.map((img, i) => (
        <GridItem key={img.id} image={img} index={i} />
      ))}
    </div>
  )
}

function GridItem({ image, index }: { image: GridImage; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const embedUrl = image.externalLink ? getSocialEmbedUrl(image.externalLink) : null

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

  const mediaContent = embedUrl ? (
    <iframe
      src={visible ? embedUrl : undefined}
      title="Social embed"
      className="w-full h-full min-h-[300px] rounded-lg border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  ) : image.url ? (
    image.isVideo ? (
      <video
        src={image.url}
        poster={image.thumbnailUrl ?? undefined}
        className="w-full h-full object-contain object-center"
        muted
        playsInline
        loop
        preload="metadata"
      />
    ) : (
      <MediaImage
        src={image.url}
        alt={image.thumbnailUrl ?? "Media"}
        className="w-full h-full object-contain object-center"
      />
    )
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-dose-gray-dark/80 to-dose-black/60 flex items-center justify-center text-zinc-500 text-sm">
      <span>Image pending upload</span>
    </div>
  )

  const aspectRatio = image.aspectRatio || "4/3"
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-lg group flex items-center justify-center bg-dose-gray-dark/50 w-full"
      style={{
        aspectRatio,
        animationDelay: `${index * 100}ms`,
        overflow: "hidden",
      }}
    >
      <div
        className={`w-full h-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] ${
          visible ? "grid-item-animate" : "opacity-0"
        }`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {mediaContent}
      </div>
      {image.isVideo && !embedUrl && (
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
