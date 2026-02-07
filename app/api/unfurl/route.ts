import { createClient } from "@/lib/supabase/server"
import { isAllowedAdmin } from "@/lib/auth-config"
import { NextResponse } from "next/server"

const USER_AGENT =
  "Mozilla/5.0 (compatible; ADilyBot/1.0; +https://adily.example.com)"

function absoluteUrl(base: string, path: string): string {
  if (path.startsWith("http")) return path
  try {
    const u = new URL(base)
    return new URL(path, u.origin).href
  } catch {
    return path
  }
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch")
      return u.searchParams.get("v")
    return null
  } catch {
    return null
  }
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

function getMetaContent(html: string, selectors: { name?: string; property?: string }[]): string | null {
  for (const sel of selectors) {
    const name = sel.name ? `name="${sel.name}"` : ""
    const property = sel.property ? `property="${sel.property}"` : ""
    const attr = name || property
    if (!attr) continue
    const regex = new RegExp(
      `<meta[^>]+${attr}[^>]+content="([^"]*)"`,
      "i"
    )
    const m = html.match(regex)
    if (m?.[1]) return m[1].trim()
    const reverse = new RegExp(
      `<meta[^>]+content="([^"]*)"[^>]+${attr}`,
      "i"
    )
    const m2 = html.match(reverse)
    if (m2?.[1]) return m2[1].trim()
  }
  return null
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !(await isAllowedAdmin(user.email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { url: string; screenshot?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    )
  }

  const rawUrl = body.url?.trim()
  if (!rawUrl) {
    return NextResponse.json(
      { error: "url is required" },
      { status: 400 }
    )
  }

  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 }
    )
  }

  const result: {
    imageUrl: string | null
    title: string | null
    author: string | null
    source: string | null
    error?: string
  } = {
    imageUrl: null,
    title: null,
    author: null,
    source: null,
  }

  // YouTube: use known thumbnail URL
  const ytId = extractYouTubeVideoId(url.href)
  if (ytId) {
    result.imageUrl = getYouTubeThumbnail(ytId)
    result.title = null
    result.author = null
    result.source = "YouTube"
    return NextResponse.json(result)
  }

  // Fetch the page for Open Graph / meta
  let html: string
  try {
    const res = await fetch(url.href, {
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      result.error = `HTTP ${res.status}`
      return NextResponse.json(result)
    }
    html = await res.text()
  } catch (e) {
    result.error = e instanceof Error ? e.message : "Fetch failed"
    return NextResponse.json(result)
  }

  const base = url.origin + url.pathname

  result.imageUrl =
    getMetaContent(html, [
      { property: "og:image" },
      { name: "twitter:image" },
    ]) ?? null
  if (result.imageUrl) {
    result.imageUrl = absoluteUrl(base, result.imageUrl)
  }

  result.title =
    getMetaContent(html, [
      { property: "og:title" },
      { name: "twitter:title" },
    ]) ?? null

  result.author =
    getMetaContent(html, [
      { name: "author" },
      { property: "article:author" },
      { name: "twitter:creator" },
    ]) ?? null

  result.source =
    getMetaContent(html, [{ property: "og:site_name" }]) ?? url.hostname

  // Optional: website screengrab when no og:image and screenshot requested
  if (body.screenshot && !result.imageUrl && process.env.SCREENSHOT_SERVICE_URL) {
    try {
      const screenshotUrl = `${process.env.SCREENSHOT_SERVICE_URL}?url=${encodeURIComponent(url.href)}`
      result.imageUrl = screenshotUrl
    } catch {
      // ignore
    }
  }

  return NextResponse.json(result)
}
