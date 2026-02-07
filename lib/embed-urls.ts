/**
 * Detect and build embed URLs for TikTok and Instagram so we can render
 * the actual post (iframe) instead of just the thumbnail.
 */

export function isTikTokUrl(url: string): boolean {
  if (!url?.trim()) return false
  try {
    const u = new URL(url.trim())
    return (
      u.hostname === "www.tiktok.com" ||
      u.hostname === "tiktok.com" ||
      u.hostname === "vm.tiktok.com"
    )
  } catch {
    return false
  }
}

export function isInstagramUrl(url: string): boolean {
  if (!url?.trim()) return false
  try {
    const u = new URL(url.trim())
    return (
      u.hostname === "www.instagram.com" || u.hostname === "instagram.com"
    )
  } catch {
    return false
  }
}

/** TikTok embed iframe: https://www.tiktok.com/player/v1/{video_id} */
export function getTikTokEmbedUrl(postUrl: string): string | null {
  if (!isTikTokUrl(postUrl)) return null
  try {
    const u = new URL(postUrl.trim())
    // Long form: /@user/video/6718335390845095173
    const match = u.pathname.match(/\/video\/(\d+)/)
    if (match?.[1]) {
      return `https://www.tiktok.com/player/v1/${match[1]}`
    }
    // Short form vm.tiktok.com - we'd need to resolve; for now return null so we fall back to thumbnail
    return null
  } catch {
    return null
  }
}

/** Instagram embed iframe: /p/{shortcode}/embed/ or /reel/{shortcode}/embed/ */
export function getInstagramEmbedUrl(postUrl: string): string | null {
  if (!isInstagramUrl(postUrl)) return null
  try {
    const u = new URL(postUrl.trim())
    // /p/SHORTCODE/ or /reel/SHORTCODE/ or /reels/SHORTCODE/
    const match =
      u.pathname.match(/^\/(p|reel|reels)\/([^/]+)/) ||
      u.pathname.match(/^\/(p|reel|reels)\/([^/]+)\/$/)
    if (match?.[1] && match?.[2]) {
      const type = match[1]
      const shortcode = match[2]
      if (type === "p") {
        return `https://www.instagram.com/p/${shortcode}/embed/`
      }
      return `https://www.instagram.com/reel/${shortcode}/embed/`
    }
    return null
  } catch {
    return null
  }
}

export function getSocialEmbedUrl(url: string): string | null {
  return getTikTokEmbedUrl(url) ?? getInstagramEmbedUrl(url)
}

export function isEmbeddableUrl(url: string): boolean {
  return isTikTokUrl(url) || isInstagramUrl(url)
}
