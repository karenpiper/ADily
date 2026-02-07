"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type {
  Category,
  Edition,
  PostWithRelations,
} from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus } from "lucide-react"
import { MediaImage } from "@/components/media-image"
import { cn } from "@/lib/utils"

type DateGroup = { date: string; posts: PostWithRelations[] }

interface CategoryEditorProps {
  categorySlug: string
  showArticles?: boolean
}

export function CategoryEditor({
  categorySlug,
  showArticles = false,
}: CategoryEditorProps) {
  const [category, setCategory] = useState<Category | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [dateGroups, setDateGroups] = useState<DateGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editPost, setEditPost] = useState<PostWithRelations | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PostWithRelations | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Add post form
  const [newEditionId, setNewEditionId] = useState("")
  const [newHeadline, setNewHeadline] = useState("")

  // Edit form
  const [headline, setHeadline] = useState("")
  const [insights, setInsights] = useState<{ label: string; description: string; sort_order: number }[]>([])
  const [mediaItems, setMediaItems] = useState<
    { url: string; caption: string; type: "image" | "video"; size: "small" | "medium" | "large"; sort_order: number }[]
  >([])
  const [articles, setArticles] = useState<
    { title: string; url: string; summary: string; image_url: string; sort_order: number }[]
  >([])

  const supabase = createClient()

  const fetchCategory = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", categorySlug)
      .maybeSingle()
    if (error) throw error
    setCategory(data ?? null)
    return data
  }, [supabase, categorySlug])

  const fetchEditions = useCallback(async () => {
    const { data, error } = await supabase
      .from("editions")
      .select("*")
      .order("date", { ascending: false })
    if (error) throw error
    setEditions((data ?? []) as Edition[])
  }, [supabase])

  const fetchPosts = useCallback(
    async (categoryId: string) => {
      const { data: rows, error } = await supabase
        .from("posts")
        .select(
          "*, editions(date), post_insights(*), media_items(*), articles(*)"
        )
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })
      if (error) throw error
      type Row = (typeof rows)[0] & { editions: { date: string } | null }
      const byDate = new Map<string, PostWithRelations[]>()
      for (const row of (rows ?? []) as Row[]) {
        const { editions: edition, ...rest } = row
        const date = edition?.date ?? ""
        const post: PostWithRelations = {
          id: rest.id,
          edition_id: rest.edition_id,
          category_id: rest.category_id,
          headline: rest.headline,
          created_at: rest.created_at,
          post_insights: rest.post_insights ?? [],
          media_items: rest.media_items ?? [],
          articles: rest.articles ?? [],
        }
        if (!byDate.has(date)) byDate.set(date, [])
        byDate.get(date)!.push(post)
      }
      const groups = Array.from(byDate.entries())
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, posts]) => ({ date, posts }))
      setDateGroups(groups)
    },
    [supabase]
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const cat = await fetchCategory()
      await fetchEditions()
      if (cat?.id) await fetchPosts(cat.id)
    } finally {
      setLoading(false)
    }
  }, [fetchCategory, fetchEditions, fetchPosts])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setNewEditionId(editions[0]?.id ?? "")
    setNewHeadline("")
    setAddOpen(true)
  }

  const handleAddPost = async () => {
    if (!category || !newEditionId || !newHeadline.trim()) {
      alert("Select an edition and enter a headline.")
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from("posts").insert({
        edition_id: newEditionId,
        category_id: category.id,
        headline: newHeadline.trim(),
      })
      if (error) throw error
      setAddOpen(false)
      await fetchPosts(category.id)
    } catch (e) {
      console.error(e)
      alert("Failed to create post")
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (post: PostWithRelations) => {
    setEditPost(post)
    setHeadline(post.headline)
    setInsights(
      [...post.post_insights]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({ label: i.label, description: i.description, sort_order: i.sort_order }))
    )
    setMediaItems(
      [...post.media_items]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((m) => ({
          url: m.url,
          caption: m.caption ?? "",
          type: m.type,
          size: m.size,
          sort_order: m.sort_order,
        }))
    )
    setArticles(
      [...post.articles]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((a) => ({
          title: a.title,
          url: a.url,
          summary: a.summary,
          image_url: a.image_url ?? "",
          sort_order: a.sort_order,
        }))
    )
  }

  const closeEdit = () => {
    setEditPost(null)
  }

  const addInsight = () => {
    setInsights((prev) => [
      ...prev,
      { label: "", description: "", sort_order: prev.length },
    ])
  }
  const removeInsight = (i: number) => {
    setInsights((prev) => prev.filter((_, idx) => idx !== i))
  }
  const addMediaItem = () => {
    setMediaItems((prev) => [
      ...prev,
      { url: "", caption: "", type: "image", size: "medium", sort_order: prev.length },
    ])
  }
  const removeMediaItem = (i: number) => {
    setMediaItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  const addArticle = () => {
    setArticles((prev) => [
      ...prev,
      { title: "", url: "", summary: "", image_url: "", sort_order: prev.length },
    ])
  }
  const removeArticle = (i: number) => {
    setArticles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleFileUpload = (field: "media" | "article", index: number) => {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setUploading(true)
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
        if (field === "media") {
          setMediaItems((prev) =>
            prev.map((m, i) => (i === index ? { ...m, url } : m))
          )
        } else {
          setArticles((prev) =>
            prev.map((a, i) => (i === index ? { ...a, image_url: url } : a))
          )
        }
      } finally {
        setUploading(false)
        if (e.target) e.target.value = ""
      }
    }
  }

  const handleSavePost = async () => {
    if (!editPost || !category) return
    if (!headline.trim()) {
      alert("Headline is required.")
      return
    }
    setSaving(true)
    try {
      await supabase
        .from("posts")
        .update({ headline: headline.trim() })
        .eq("id", editPost.id)

      await supabase.from("post_insights").delete().eq("post_id", editPost.id)
      if (insights.length) {
        await supabase.from("post_insights").insert(
          insights.map((i, idx) => ({
            post_id: editPost.id,
            label: i.label.trim() || "Insight",
            description: i.description.trim() || "",
            sort_order: idx,
          }))
        )
      }

      await supabase.from("media_items").delete().eq("post_id", editPost.id)
      if (mediaItems.length) {
        await supabase.from("media_items").insert(
          mediaItems
            .filter((m) => m.url.trim())
            .map((m, idx) => ({
              post_id: editPost.id,
              url: m.url.trim(),
              caption: m.caption.trim() || null,
              type: m.type,
              size: m.size,
              sort_order: idx,
            }))
        )
      }

      await supabase.from("articles").delete().eq("post_id", editPost.id)
      if (showArticles && articles.length) {
        await supabase.from("articles").insert(
          articles
            .filter((a) => a.title.trim())
            .map((a, idx) => ({
              post_id: editPost.id,
              title: a.title.trim(),
              url: a.url.trim() || "#",
              summary: a.summary.trim() || "",
              image_url: a.image_url.trim() || null,
              sort_order: idx,
            }))
        )
      }

      closeEdit()
      await fetchPosts(category.id)
    } catch (e) {
      console.error(e)
      alert("Failed to save post")
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePost = async () => {
    if (!deleteTarget || !category) return
    const { error } = await supabase.from("posts").delete().eq("id", deleteTarget.id)
    if (error) {
      console.error(error)
      alert("Failed to delete post")
      return
    }
    setDeleteTarget(null)
    await fetchPosts(category.id)
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const title =
    category?.name ??
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif text-white">{title}</h1>
        <p className="text-gray-500">Loading…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-white">{title}</h1>
        <Button onClick={openAdd} className="bg-dose-orange hover:bg-dose-orange/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      {dateGroups.length === 0 ? (
        <p className="text-gray-500">No posts yet. Add a post to get started.</p>
      ) : (
        <div className="rounded-lg border border-[#222] bg-[#0a0a0a] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-gray-400">Edition date</TableHead>
                <TableHead className="text-gray-400">Headline</TableHead>
                <TableHead className="text-gray-400 w-[120px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dateGroups.flatMap((group) =>
                group.posts.map((post) => (
                  <TableRow key={post.id} className="border-[#222]">
                    <TableCell className="text-gray-400 font-medium">
                      {formatDate(group.date)}
                    </TableCell>
                    <TableCell className="text-gray-200 max-w-md truncate">
                      {post.headline || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-dose-orange"
                          onClick={() => openEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-400"
                          onClick={() => setDeleteTarget(post)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Post modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0a] border-[#222] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-white">New Post</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Edition</Label>
              <Select value={newEditionId} onValueChange={setNewEditionId}>
                <SelectTrigger className="bg-[#111] border-[#333]">
                  <SelectValue placeholder="Select edition" />
                </SelectTrigger>
                <SelectContent>
                  {editions.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {formatDate(e.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Headline</Label>
              <Input
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
                placeholder="Post headline"
                className="bg-[#111] border-[#333]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} className="border-[#333]">
              Cancel
            </Button>
            <Button onClick={handleAddPost} disabled={saving} className="bg-dose-orange hover:bg-dose-orange/90">
              {saving ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post modal */}
      <Dialog open={!!editPost} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-[#222] text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Post</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="bg-[#111] border-[#333]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Insights</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addInsight}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {insights.map((ins, i) => (
                  <div key={i} className="flex gap-2 items-start p-2 rounded bg-[#111]">
                    <Input
                      placeholder="Label"
                      value={ins.label}
                      onChange={(e) =>
                        setInsights((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                        )
                      }
                      className="flex-1 bg-[#0a0a0a] border-[#333]"
                    />
                    <Textarea
                      placeholder="Description"
                      value={ins.description}
                      onChange={(e) =>
                        setInsights((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, description: e.target.value } : x))
                        )
                      }
                      rows={2}
                      className="flex-[2] bg-[#0a0a0a] border-[#333]"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInsight(i)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Media items</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addMediaItem}>
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {mediaItems.map((m, i) => (
                  <div key={i} className="flex gap-2 items-center p-2 rounded bg-[#111] flex-wrap">
                    <div className="w-14 h-14 rounded border border-[#333] overflow-hidden bg-[#0a0a0a] shrink-0">
                      {m.url ? (
                        m.type === "video" ? (
                          <video
                            src={m.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <MediaImage
                            src={m.url}
                            alt={m.caption || "Media"}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No URL</div>
                      )}
                    </div>
                    <label className={cn("flex items-center gap-1 border rounded px-2 py-1.5 text-sm cursor-pointer border-[#333]", uploading && "opacity-50")}>
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload("media", i)} disabled={uploading} />
                      {uploading ? "…" : "Upload"}
                    </label>
                    <Input
                      placeholder="URL"
                      value={m.url}
                      onChange={(e) =>
                        setMediaItems((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x))
                        )
                      }
                      className="flex-1 min-w-[120px] bg-[#0a0a0a] border-[#333]"
                    />
                    <Input
                      placeholder="Caption"
                      value={m.caption}
                      onChange={(e) =>
                        setMediaItems((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x))
                        )
                      }
                      className="w-32 bg-[#0a0a0a] border-[#333]"
                    />
                    <Select
                      value={m.type}
                      onValueChange={(v: "image" | "video") =>
                        setMediaItems((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, type: v } : x))
                        )
                      }
                    >
                      <SelectTrigger className="w-24 bg-[#0a0a0a] border-[#333]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={m.size}
                      onValueChange={(v: "small" | "medium" | "large") =>
                        setMediaItems((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, size: v } : x))
                        )
                      }
                    >
                      <SelectTrigger className="w-24 bg-[#0a0a0a] border-[#333]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMediaItem(i)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {showArticles && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Articles</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addArticle}>
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {articles.map((a, i) => (
                    <div key={i} className="p-3 rounded bg-[#111] space-y-2">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 rounded border border-[#333] overflow-hidden bg-[#0a0a0a] shrink-0">
                          {a.image_url ? (
                            <MediaImage
                              src={a.image_url}
                              alt={a.title || "Article"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">No image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex justify-between gap-2">
                            <Input
                              placeholder="Article title"
                              value={a.title}
                              onChange={(e) =>
                                setArticles((prev) =>
                                  prev.map((x, j) => (j === i ? { ...x, title: e.target.value } : x))
                                )
                              }
                              className="bg-[#0a0a0a] border-[#333] flex-1"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeArticle(i)} className="shrink-0">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                          <Input
                            placeholder="URL"
                            value={a.url}
                            onChange={(e) =>
                              setArticles((prev) =>
                                prev.map((x, j) => (j === i ? { ...x, url: e.target.value } : x))
                              )
                            }
                            className="bg-[#0a0a0a] border-[#333]"
                          />
                          <Textarea
                            placeholder="Summary"
                            value={a.summary}
                            onChange={(e) =>
                              setArticles((prev) =>
                                prev.map((x, j) => (j === i ? { ...x, summary: e.target.value } : x))
                              )
                            }
                            rows={2}
                            className="bg-[#0a0a0a] border-[#333]"
                          />
                          <div className="flex gap-2 items-center">
                            <label className={cn("flex items-center gap-1 border rounded px-2 py-1.5 text-sm cursor-pointer border-[#333]", uploading && "opacity-50")}>
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload("article", i)} disabled={uploading} />
                              {uploading ? "…" : "Upload image"}
                            </label>
                            <Input
                              placeholder="Image URL"
                              value={a.image_url}
                              onChange={(e) =>
                                setArticles((prev) =>
                                  prev.map((x, j) => (j === i ? { ...x, image_url: e.target.value } : x))
                                )
                              }
                              className="flex-1 bg-[#0a0a0a] border-[#333]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} className="border-[#333]">
              Cancel
            </Button>
            <Button onClick={handleSavePost} disabled={saving} className="bg-dose-orange hover:bg-dose-orange/90">
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0a0a0a] border-[#222]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete post</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Delete this post and all its insights, media, and articles? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#333]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
