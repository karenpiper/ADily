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
  /** Shown on hover when present */
  caption?: string
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
  // Embed from Link out (external) or from main Image URL when user pastes Instagram/TikTok
  const embedUrl =
    (image.externalLink && getSocialEmbedUrl(image.externalLink)) ||
    (image.url && getSocialEmbedUrl(image.url)) ||
    null
  const embedSourceUrl = embedUrl
    ? (image.externalLink && getSocialEmbedUrl(image.externalLink) ? image.externalLink : image.url) || null
    : null
  const hasLink = !!image.externalLink?.trim() || !!embedSourceUrl

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

  /* Scale to fit grid: natural aspect ratio, no crop. No fixed aspect ratio on wrapper. */
  const mediaContent = embedUrl ? (
    <iframe
      src={visible ? embedUrl : undefined}
      title="Social embed"
      className="w-full min-h-[300px] border-0 block"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  ) : image.url ? (
    image.isVideo ? (
      <video
        src={image.url}
        poster={image.thumbnailUrl ?? undefined}
        className="w-full h-auto block"
        muted
        playsInline
        loop
        preload="metadata"
      />
    ) : (
      <MediaImage
        src={image.url}
        alt={image.caption ?? "Media"}
        className="w-full h-auto block"
      />
    )
  ) : (
    <div className="w-full flex items-center justify-center text-zinc-500 text-sm bg-dose-gray-dark/30 min-h-[120px]">
      <span>Image pending upload</span>
    </div>
  )

  const wrappedContent = hasLink && !embedUrl ? (
    <a
      href={image.externalLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-dose-orange focus:ring-offset-2 focus:ring-offset-dose-black rounded overflow-hidden"
    >
      {mediaContent}
    </a>
  ) : mediaContent

  return (
    <div
      ref={ref}
      className="group relative w-full rounded overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className={`w-full ${visible ? "grid-item-animate" : "opacity-0"}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {wrappedContent}
      </div>
      {hasLink && embedUrl && embedSourceUrl && (
        <a
          href={embedSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 px-3 py-1.5 rounded text-xs font-medium bg-black/70 text-white hover:bg-dose-orange transition-colors z-10"
        >
          Open in new tab
        </a>
      )}
      {image.caption?.trim() && (
        <div
          className="absolute inset-x-0 bottom-0 px-3 py-2 bg-black/75 text-white text-sm leading-snug opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          aria-hidden
        >
          {image.caption.trim()}
        </div>
      )}
      {image.isVideo && !embedUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-foreground/80">
            <span className="text-dose-black text-xl ml-1">▶</span>
          </div>
        </div>
      )}
    </div>
  )
}
