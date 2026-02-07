"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface MediaImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
}

export function MediaImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  ...props
}: MediaImageProps & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = useState(false)
  const isPlaceholder =
    !src || src.includes("placeholder")

  if (error || isPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-zinc-800 text-zinc-500 text-sm",
          fill && "absolute inset-0",
          className
        )}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
            />
          </svg>
          <span>{alt || "Image pending upload"}</span>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      width={width}
      height={height}
      {...props}
    />
  )
}
