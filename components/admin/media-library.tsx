"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { MediaItem } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MediaImage } from "@/components/media-image"
import { Upload, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type MediaRow = MediaItem & {
  post_headline?: string | null
  edition_date?: string | null
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    const { data: rows, error } = await supabase
      .from("media_items")
      .select(`
        *,
        posts (
          headline,
          editions (date)
        )
      `)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error(error)
      setItems([])
      return
    }

    const mapped: MediaRow[] = (rows ?? []).map((row: Record<string, unknown>) => {
      const rawPost = row.posts
      const post = Array.isArray(rawPost) ? rawPost[0] : (rawPost as Record<string, unknown> | null)
      const rawEdition = post?.editions ?? post?.edition
      const edition = Array.isArray(rawEdition) ? rawEdition[0] : (rawEdition as { date?: string } | null)
      return {
        id: row.id,
        post_id: row.post_id,
        type: row.type,
        url: row.url,
        thumbnail_url: row.thumbnail_url,
        caption: row.caption,
        external_link: row.external_link,
        sort_order: row.sort_order,
        size: row.size,
        post_headline: post?.headline ?? null,
        edition_date: edition?.date ?? null,
      } as MediaRow
    })
    setItems(mapped)
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    fetchItems().finally(() => setLoading(false))
  }, [fetchItems])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadedUrl(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? "Upload failed")
        return
      }
      const { url } = await res.json()
      setUploadedUrl(url)
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ""
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrl(url)
      setTimeout(() => setCopiedUrl(null), 2000)
    })
  }

  const formatDate = (d: string | null | undefined) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—"

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-serif text-white">Media Library</h1>

      <section className="rounded-lg border border-[#222] bg-[#0a0a0a] p-6">
        <Label className="text-gray-300 mb-2 block">Upload new file</Label>
        <p className="text-sm text-gray-500 mb-3">
          Upload an image or video to Supabase Storage. Copy the URL and paste it into a post&apos;s media item in Memes, Design, or Video.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#333] bg-[#111] text-sm font-medium cursor-pointer hover:bg-[#222] transition-colors",
              uploading && "opacity-50 pointer-events-none"
            )}
          >
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading…" : "Choose file"}
          </label>
          {uploadedUrl && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input
                readOnly
                value={uploadedUrl}
                className="bg-[#111] border-[#333] text-gray-300 text-sm flex-1 max-w-md"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-[#333] shrink-0"
                onClick={() => copyUrl(uploadedUrl)}
              >
                {copiedUrl === uploadedUrl ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-gray-300 mb-3">Media in use</h2>
        <p className="text-sm text-gray-500 mb-4">
          Media items linked to posts. Add or edit media from Memes, Design, Video, or Articles.
        </p>
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500">No media items yet.</p>
        ) : (
          <div className="rounded-lg border border-[#222] bg-[#0a0a0a] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-[#222] hover:bg-transparent">
                  <TableHead className="text-gray-400 w-[80px]">Preview</TableHead>
                  <TableHead className="text-gray-400">URL</TableHead>
                  <TableHead className="text-gray-400">Caption</TableHead>
                  <TableHead className="text-gray-400 w-[80px]">Type</TableHead>
                  <TableHead className="text-gray-400 w-[80px]">Size</TableHead>
                  <TableHead className="text-gray-400">Post / Edition</TableHead>
                  <TableHead className="text-gray-400 w-[60px] text-right">Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-[#222]">
                    <TableCell className="p-1">
                      <div className="w-14 h-14 rounded overflow-hidden bg-[#111] relative">
                        {item.type === "video" ? (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <MediaImage
                            src={item.url}
                            alt={item.caption ?? ""}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-[200px] truncate font-mono">
                      {item.url}
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm max-w-[180px] truncate">
                      {item.caption ?? "—"}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {item.type}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {item.size}
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      <span className="block truncate max-w-[160px]" title={item.post_headline ?? undefined}>
                        {item.post_headline ?? "—"}
                      </span>
                      <span className="text-gray-500 text-xs">{formatDate(item.edition_date)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-dose-orange"
                        onClick={() => copyUrl(item.url)}
                        title="Copy URL"
                      >
                        {copiedUrl === item.url ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
