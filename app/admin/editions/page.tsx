"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Edition } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Pencil, Trash2, Star, Plus, X } from "lucide-react"
import { MediaImage } from "@/components/media-image"
import { getSocialEmbedUrl } from "@/lib/embed-urls"
import { cn } from "@/lib/utils"

const DEFAULT_HERO_DESCRIPTION =
  "A lightweight, always-on social intelligence and inspiration program designed to keep Amazon Ads' social work modern, credible, and performance-driven"

const TRUNCATE_LEN = 80

function truncate(s: string, len: number): string {
  if (s.length <= len) return s
  return s.slice(0, len).trim() + "…"
}

type FormState = {
  date: string
  edition_name: string
  hero_description: string
  hero_summary: string
  featured_meme_url: string
  include_meme: boolean
  is_current: boolean
}

const emptyForm: FormState = {
  date: "",
  edition_name: "",
  hero_description: DEFAULT_HERO_DESCRIPTION,
  hero_summary: "",
  featured_meme_url: "",
  include_meme: false,
  is_current: false,
}

type MediaRow = { url: string; caption: string; external_link: string }
type ContentFormState = {
  what_is_it: string
  so_what: string
  now_what: string
  media_rows: MediaRow[]
}
const emptyContentForm: ContentFormState = {
  what_is_it: "",
  so_what: "",
  now_what: "",
  media_rows: [{ url: "", caption: "", external_link: "" }],
}

function MediaRowPreview({ row }: { row: MediaRow }) {
  const embedUrl = (row.external_link && getSocialEmbedUrl(row.external_link)) || (row.url && getSocialEmbedUrl(row.url)) || null
  const isVideoUrl = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(row.url || "")

  if (embedUrl) {
    return (
      <div className="rounded overflow-hidden border border-[#333] bg-[#0a0a0a] aspect-video max-h-[220px] flex items-center justify-center">
        <iframe
          src={embedUrl}
          title="Embed preview"
          className="w-full h-full min-h-[200px] border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      </div>
    )
  }
  if (row.url?.trim()) {
    return (
      <div className="rounded overflow-hidden border border-[#333] bg-[#0a0a0a] aspect-video max-h-[220px] flex items-center justify-center">
        {isVideoUrl ? (
          <video src={row.url} className="max-h-[220px] w-auto object-contain" muted playsInline preload="metadata" />
        ) : (
          <MediaImage src={row.url} alt="" className="max-h-[220px] w-auto object-contain" />
        )}
      </div>
    )
  }
  return (
    <div className="rounded border border-dashed border-[#333] bg-[#0a0a0a] aspect-video max-h-[180px] flex items-center justify-center text-gray-500 text-sm">
      Paste URL, Instagram/TikTok link, or upload to see preview
    </div>
  )
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "theme"
}

type CreateStep = 1 | 2 | 3

export default function AdminEditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [categories, setCategories] = useState<{ id: string; sort_order: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [contentForm, setContentForm] = useState<ContentFormState>(emptyContentForm)
  const [createStep, setCreateStep] = useState<CreateStep>(1)
  const [createdEditionId, setCreatedEditionId] = useState<string | null>(null)
  const [createdThemeId, setCreatedThemeId] = useState<string | null>(null)
  const [createdThemeName, setCreatedThemeName] = useState<string>("")
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingMediaRow, setUploadingMediaRow] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Edition | null>(null)
  const [setCurrentTarget, setSetCurrentTarget] = useState<Edition | null>(null)
  const [isCurrentConfirmOpen, setIsCurrentConfirmOpen] = useState(false)
  const [pendingIsCurrent, setPendingIsCurrent] = useState(false)

  const supabase = createClient()

  const fetchEditions = useCallback(async () => {
    const { data, error } = await supabase
      .from("editions")
      .select("*")
      .order("date", { ascending: false })
    if (error) {
      console.error(error)
      return
    }
    setEditions(data ?? [])
  }, [supabase])

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, sort_order")
      .order("sort_order", { ascending: true })
    if (error) {
      console.error(error)
      return
    }
    setCategories(data ?? [])
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchEditions(), fetchCategories()]).finally(() => setLoading(false))
  }, [fetchEditions, fetchCategories])

  const openCreate = () => {
    setEditingEdition(null)
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
    })
    setContentForm(emptyContentForm)
    setCreateStep(1)
    setCreatedEditionId(null)
    setCreatedThemeId(null)
    setCreatedThemeName("")
    setModalOpen(true)
  }

  const openEdit = async (e: Edition) => {
    setEditingEdition(e)
    setForm({
      date: e.date,
      edition_name: "",
      hero_description: e.hero_description,
      hero_summary: e.hero_summary,
      featured_meme_url: e.featured_meme_url ?? "",
      include_meme: !!e.featured_meme_url,
      is_current: e.is_current,
    })
    setContentForm(emptyContentForm)
    setEditingThemeId(null)
    setEditingPostId(null)
    setModalOpen(true)
    setEditLoading(true)
    try {
      const { data: themes } = await supabase
        .from("themes")
        .select("id, name, description")
        .eq("edition_id", e.id)
        .order("sort_order", { ascending: true })
        .limit(1)
      const theme = themes?.[0] ?? null
      if (theme) {
        setForm((f) => ({ ...f, edition_name: theme.name }))
        setEditingThemeId(theme.id)
        const { data: posts } = await supabase
          .from("posts")
          .select("id, post_insights(label, description, sort_order), media_items(url, caption, sort_order, external_link)")
          .eq("theme_id", theme.id)
          .order("created_at", { ascending: false })
          .limit(1)
        const post = posts?.[0] as {
          id: string
          post_insights: { label: string; description: string; sort_order: number }[]
          media_items: { url: string; caption: string | null; sort_order: number; external_link: string | null }[]
        } | undefined
        if (post) {
          setEditingPostId(post.id)
          const insights = (post.post_insights ?? []).sort((a, b) => a.sort_order - b.sort_order)
          const whatIsIt = insights.find((i) => i.label === "What is it")?.description ?? ""
          const soWhat = insights.find((i) => i.label === "So what")?.description ?? ""
          const nowWhat = insights.find((i) => i.label === "Now what")?.description ?? ""
          const mediaRows = (post.media_items ?? [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((m) => ({ url: m.url, caption: m.caption ?? "", external_link: m.external_link ?? "" }))
          setContentForm({
            what_is_it: whatIsIt,
            so_what: soWhat,
            now_what: nowWhat,
            media_rows: mediaRows.length ? mediaRows : [{ url: "", caption: "", external_link: "" }],
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setEditLoading(false)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingEdition(null)
    setForm(emptyForm)
    setContentForm(emptyContentForm)
    setCreateStep(1)
    setCreatedEditionId(null)
    setCreatedThemeId(null)
    setCreatedThemeName("")
    setEditingThemeId(null)
    setEditingPostId(null)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm((f) => ({ ...f, featured_meme_url: url }))
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const handleMediaRowUpload = async (e: React.ChangeEvent<HTMLInputElement>, rowIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMediaRow(rowIndex)
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
      setContentForm((f) => ({
        ...f,
        media_rows: f.media_rows.map((r, j) => (j === rowIndex ? { ...r, url } : r)),
      }))
    } finally {
      setUploadingMediaRow(null)
      e.target.value = ""
    }
  }

  const handleSaveStep1 = async () => {
    if (!form.date || !form.edition_name.trim()) {
      alert("Date and Edition name are required.")
      return
    }
    setSaving(true)
    try {
      const editionPayload = {
        date: form.date,
        hero_description: (form.hero_description || "").trim() || "",
        hero_summary: form.edition_name.trim(),
        featured_meme_url: form.include_meme ? (form.featured_meme_url.trim() || null) : null,
        is_current: form.is_current,
      }
      const { data: editionData, error: edError } = await supabase
        .from("editions")
        .insert(editionPayload)
        .select("id")
        .single()
      if (edError) throw edError
      const editionId = editionData?.id
      if (!editionId) throw new Error("Edition not created")

      if (form.is_current) {
        await supabase.from("editions").update({ is_current: false }).neq("id", editionId)
      }

      const themeName = form.edition_name.trim()
      const slug = slugify(themeName)
      const { data: themeData, error: thError } = await supabase
        .from("themes")
        .insert({
          edition_id: editionId,
          name: themeName,
          slug,
          description: null,
          sort_order: 0,
        })
        .select("id")
        .single()
      if (thError) throw thError

      setCreatedEditionId(editionId)
      setCreatedThemeId(themeData?.id ?? null)
      setCreatedThemeName(themeName)
      setCreateStep(3)
    } catch (err) {
      console.error(err)
      alert("Failed to save edition")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStep3 = async () => {
    if (!createdEditionId || !createdThemeId) return
    const categoryId = categories[0]?.id
    if (!categoryId) {
      alert("No category found. Please add a category first.")
      return
    }
    setSaving(true)
    try {
      const headline = createdThemeName.trim() || "Content"
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert({
          edition_id: createdEditionId,
          theme_id: createdThemeId,
          category_id: categoryId,
          headline,
        })
        .select("id")
        .single()
      if (postError) throw postError
      const postId = postData?.id
      if (!postId) throw new Error("Post not created")

      const insights = [
        { label: "What is it", description: contentForm.what_is_it.trim(), sort_order: 0 },
        { label: "So what", description: contentForm.so_what.trim(), sort_order: 1 },
        { label: "Now what", description: contentForm.now_what.trim(), sort_order: 2 },
      ].filter((i) => i.description)
      if (insights.length) {
        await supabase.from("post_insights").insert(
          insights.map((i) => ({ post_id: postId, ...i }))
        )
      }

      const mediaRows = contentForm.media_rows.filter((r) => r.url.trim())
      if (mediaRows.length) {
        await supabase.from("media_items").insert(
          mediaRows.map((r, i) => ({
            post_id: postId,
            type: "image",
            url: r.url.trim(),
            caption: r.caption.trim() || null,
            external_link: r.external_link.trim() || null,
            sort_order: i,
          }))
        )
      }

      closeModal()
      await fetchEditions()
    } catch (err) {
      console.error(err)
      alert("Failed to save content")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingEdition || !form.date || !form.edition_name.trim()) {
      alert("Date and Edition name are required.")
      return
    }
    setSaving(true)
    try {
      if (form.is_current) {
        await supabase.from("editions").update({ is_current: false }).neq("id", editingEdition.id)
      }
      const editionPayload = {
        date: form.date,
        hero_description: (form.hero_description || "").trim() || "",
        hero_summary: form.edition_name.trim(),
        featured_meme_url: form.include_meme ? (form.featured_meme_url.trim() || null) : null,
        is_current: form.is_current,
      }
      const { error: edError } = await supabase.from("editions").update(editionPayload).eq("id", editingEdition.id)
      if (edError) throw edError

      let themeId = editingThemeId
      if (editingThemeId) {
        await supabase
          .from("themes")
          .update({
            name: form.edition_name.trim() || "Theme",
            description: null,
          })
          .eq("id", editingThemeId)
      } else {
        const slug = slugify(form.edition_name.trim() || "theme")
        const { data: newTheme, error: thError } = await supabase
          .from("themes")
          .insert({
            edition_id: editingEdition.id,
            name: form.edition_name.trim() || "Theme",
            slug,
            description: null,
            sort_order: 0,
          })
          .select("id")
          .single()
        if (thError) throw thError
        themeId = newTheme?.id ?? null
      }
      const categoryId = categories[0]?.id
      const headline = form.edition_name.trim() || "Content"

      if (editingPostId) {
        await supabase.from("posts").update({ headline }).eq("id", editingPostId)
        await supabase.from("post_insights").delete().eq("post_id", editingPostId)
        const insights = [
          { label: "What is it", description: contentForm.what_is_it.trim(), sort_order: 0 },
          { label: "So what", description: contentForm.so_what.trim(), sort_order: 1 },
          { label: "Now what", description: contentForm.now_what.trim(), sort_order: 2 },
        ].filter((i) => i.description)
        if (insights.length) {
          await supabase.from("post_insights").insert(
            insights.map((i) => ({ post_id: editingPostId, ...i }))
          )
        }
        await supabase.from("media_items").delete().eq("post_id", editingPostId)
        const mediaRows = contentForm.media_rows.filter((r) => r.url.trim())
        if (mediaRows.length) {
          await supabase.from("media_items").insert(
            mediaRows.map((r, i) => ({
              post_id: editingPostId,
              type: "image",
              url: r.url.trim(),
              caption: r.caption.trim() || null,
              external_link: r.external_link.trim() || null,
              sort_order: i,
            }))
          )
        }
      } else if (themeId && categoryId) {
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .insert({
            edition_id: editingEdition.id,
            theme_id: themeId,
            category_id: categoryId,
            headline,
          })
          .select("id")
          .single()
        if (postError) throw postError
        const postId = postData?.id
        if (postId) {
          const insights = [
            { label: "What is it", description: contentForm.what_is_it.trim(), sort_order: 0 },
            { label: "So what", description: contentForm.so_what.trim(), sort_order: 1 },
            { label: "Now what", description: contentForm.now_what.trim(), sort_order: 2 },
          ].filter((i) => i.description)
          if (insights.length) {
            await supabase.from("post_insights").insert(insights.map((i) => ({ post_id: postId, ...i })))
          }
          const mediaRows = contentForm.media_rows.filter((r) => r.url.trim())
          if (mediaRows.length) {
            await supabase.from("media_items").insert(
              mediaRows.map((r, i) => ({
                post_id: postId,
                type: "image",
                url: r.url.trim(),
                caption: r.caption.trim() || null,
                external_link: r.external_link.trim() || null,
                sort_order: i,
              }))
            )
          }
        }
      }

      closeModal()
      await fetchEditions()
    } catch (err) {
      console.error(err)
      alert("Failed to save edition")
    } finally {
      setSaving(false)
    }
  }

  const handleIsCurrentChange = (checked: boolean) => {
    if (checked) {
      setPendingIsCurrent(true)
      setIsCurrentConfirmOpen(true)
    } else {
      setForm((f) => ({ ...f, is_current: false }))
    }
  }

  const confirmIsCurrent = () => {
    setForm((f) => ({ ...f, is_current: true }))
    setPendingIsCurrent(false)
    setIsCurrentConfirmOpen(false)
  }

  const cancelIsCurrentConfirm = () => {
    setPendingIsCurrent(false)
    setIsCurrentConfirmOpen(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase
      .from("editions")
      .delete()
      .eq("id", deleteTarget.id)
    setDeleteTarget(null)
    if (error) {
      console.error(error)
      alert("Failed to delete edition")
      return
    }
    await fetchEditions()
  }

  const handleSetCurrent = async () => {
    if (!setCurrentTarget) return
    await supabase.from("editions").update({ is_current: false }).neq("id", setCurrentTarget.id)
    await supabase
      .from("editions")
      .update({ is_current: true })
      .eq("id", setCurrentTarget.id)
    setSetCurrentTarget(null)
    await fetchEditions()
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-white">Editions</h1>
        <Button onClick={openCreate} className="bg-dose-orange hover:bg-dose-orange/90">
          New Edition
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : (
        <div className="rounded-lg border border-[#222] bg-[#0a0a0a] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400 w-[100px]">Current</TableHead>
                <TableHead className="text-gray-400 w-[180px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editions.map((e) => (
                <TableRow
                  key={e.id}
                  className={cn(
                    "border-[#222]",
                    e.is_current && "border-l-4 border-l-dose-orange bg-dose-orange/5"
                  )}
                >
                  <TableCell className="text-gray-200 font-medium">
                    {formatDate(e.date)}
                  </TableCell>
                  <TableCell className="text-gray-400 max-w-[400px]">
                    {truncate(e.hero_summary, TRUNCATE_LEN)}
                  </TableCell>
                  <TableCell>
                    {e.is_current ? (
                      <Badge className="bg-green-600/80 hover:bg-green-600/80 text-white">
                        Current
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-600/50 text-gray-400">
                        —
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!e.is_current && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-dose-orange"
                          onClick={() => setSetCurrentTarget(e)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-dose-orange"
                        onClick={() => openEdit(e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => setDeleteTarget(e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className={cn("bg-[#0a0a0a] border-[#222] text-gray-200", (createStep === 3 || editingEdition) ? "max-w-2xl" : "max-w-lg")}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingEdition
                ? "Edit Edition"
                : createStep === 1
                  ? "New Edition"
                  : "Add content"}
            </DialogTitle>
          </DialogHeader>

          {editingEdition ? (
            <>
              {editLoading ? (
                <div className="py-12 text-center text-gray-400">Loading edition…</div>
              ) : (
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="edit_date">Date</Label>
                    <Input
                      id="edit_date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="bg-[#111] border-[#333]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_edition_name">Edition name</Label>
                    <Input
                      id="edit_edition_name"
                      value={form.edition_name}
                      onChange={(e) => setForm((f) => ({ ...f, edition_name: e.target.value }))}
                      placeholder="Theme name for this edition"
                      className="bg-[#111] border-[#333]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit_hero_description">Frontpage summary (optional)</Label>
                    <Textarea
                      id="edit_hero_description"
                      value={form.hero_description}
                      onChange={(e) => setForm((f) => ({ ...f, hero_description: e.target.value }))}
                      rows={3}
                      className="bg-[#111] border-[#333] resize-y"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include_meme_edit"
                      checked={form.include_meme}
                      onCheckedChange={(checked) => setForm((f) => ({ ...f, include_meme: checked }))}
                    />
                    <Label htmlFor="include_meme_edit">Include featured meme</Label>
                  </div>
                  {form.include_meme && (
                    <div className="grid gap-2">
                      <Label>Featured Meme URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={form.featured_meme_url}
                          onChange={(e) => setForm((f) => ({ ...f, featured_meme_url: e.target.value }))}
                          placeholder="https://…"
                          className="bg-[#111] border-[#333] flex-1"
                        />
                        <label
                          className={cn(
                            "inline-flex items-center justify-center h-10 px-4 rounded-md border border-[#333] bg-[#111] text-sm font-medium cursor-pointer hover:bg-[#222] transition-colors",
                            uploading && "opacity-50 pointer-events-none"
                          )}
                        >
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                          {uploading ? "Uploading…" : "Upload"}
                        </label>
                      </div>
                      {form.featured_meme_url && (
                        <div className="mt-2 h-24 w-32 rounded border border-[#333] overflow-hidden bg-[#111]">
                          <MediaImage src={form.featured_meme_url} alt="Featured meme" className="h-full w-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Switch id="is_current_edit" checked={form.is_current} onCheckedChange={handleIsCurrentChange} />
                    <Label htmlFor="is_current_edit">Set as Current Edition</Label>
                  </div>

                  <div className="border-t border-[#333] pt-6 mt-2">
                    <h3 className="text-sm font-medium text-gray-300 mb-4">Content</h3>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit_what_is_it">What is it</Label>
                        <Textarea
                          id="edit_what_is_it"
                          value={contentForm.what_is_it}
                          onChange={(e) => setContentForm((f) => ({ ...f, what_is_it: e.target.value }))}
                          placeholder="Brief description…"
                          rows={2}
                          className="bg-[#111] border-[#333] resize-y"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit_so_what">So what</Label>
                        <Textarea
                          id="edit_so_what"
                          value={contentForm.so_what}
                          onChange={(e) => setContentForm((f) => ({ ...f, so_what: e.target.value }))}
                          placeholder="Why it matters…"
                          rows={2}
                          className="bg-[#111] border-[#333] resize-y"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit_now_what">Now what</Label>
                        <Textarea
                          id="edit_now_what"
                          value={contentForm.now_what}
                          onChange={(e) => setContentForm((f) => ({ ...f, now_what: e.target.value }))}
                          placeholder="Next steps or takeaway…"
                          rows={2}
                          className="bg-[#111] border-[#333] resize-y"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Media: image URL or upload, optional caption and link out</Label>
                        {contentForm.media_rows.map((row, i) => (
                          <div key={i} className="flex flex-col gap-2 p-2 rounded border border-[#222]">
                            <div className="flex gap-2 items-center flex-wrap">
                              <Input
                                value={row.url}
                                onChange={(e) =>
                                  setContentForm((f) => ({
                                    ...f,
                                    media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)),
                                  }))
                                }
                                placeholder="Image URL, or Instagram/TikTok link (embeds), or Upload below"
                                className="bg-[#111] border-[#333] flex-1 min-w-[200px]"
                              />
                              <label
                                className={cn(
                                  "inline-flex items-center justify-center h-10 px-3 rounded-md border border-[#333] bg-[#111] text-sm font-medium cursor-pointer hover:bg-[#222] transition-colors shrink-0",
                                  uploadingMediaRow === i && "opacity-50 pointer-events-none"
                                )}
                              >
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  className="hidden"
                                  onChange={(ev) => handleMediaRowUpload(ev, i)}
                                  disabled={uploadingMediaRow !== null}
                                />
                                {uploadingMediaRow === i ? "Uploading…" : "Upload"}
                              </label>
                              <Input
                                value={row.caption}
                                onChange={(e) =>
                                  setContentForm((f) => ({
                                    ...f,
                                    media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, caption: e.target.value } : r)),
                                  }))
                                }
                                placeholder="Caption"
                                className="bg-[#111] border-[#333] w-28 shrink-0"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-gray-400 hover:text-red-400 shrink-0"
                                onClick={() =>
                                  setContentForm((f) => ({
                                    ...f,
                                    media_rows: f.media_rows.filter((_, j) => j !== i).length
                                      ? f.media_rows.filter((_, j) => j !== i)
                                      : [{ url: "", caption: "", external_link: "" }],
                                  }))
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              value={row.external_link}
                              onChange={(e) =>
                                setContentForm((f) => ({
                                  ...f,
                                  media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, external_link: e.target.value } : r)),
                                }))
                              }
                              placeholder="Link out (optional) — URL when user clicks the image"
                              className="bg-[#111] border-[#333] text-sm"
                            />
                            <div className="mt-1">
                              <MediaRowPreview row={row} />
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-fit border-[#333] text-gray-400"
                          onClick={() => setContentForm((f) => ({ ...f, media_rows: [...f.media_rows, { url: "", caption: "", external_link: "" }] }))}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add media
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={closeModal} className="border-[#333]">Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={saving || editLoading} className="bg-dose-orange hover:bg-dose-orange/90">
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </>
          ) : createStep === 1 ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Edition date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="bg-[#111] border-[#333]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edition_name">Edition name</Label>
                  <Input
                    id="edition_name"
                    value={form.edition_name}
                    onChange={(e) => setForm((f) => ({ ...f, edition_name: e.target.value }))}
                    placeholder="This is the theme name for this edition"
                    className="bg-[#111] border-[#333]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hero_description">Frontpage summary (optional)</Label>
                  <Textarea
                    id="hero_description"
                    value={form.hero_description}
                    onChange={(e) => setForm((f) => ({ ...f, hero_description: e.target.value }))}
                    placeholder="Summary or description for the front page"
                    rows={4}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="include_meme"
                    checked={form.include_meme}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, include_meme: checked }))}
                  />
                  <Label htmlFor="include_meme">Include featured meme</Label>
                </div>
                {form.include_meme && (
                  <div className="grid gap-2">
                    <Label>Meme URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={form.featured_meme_url}
                        onChange={(e) => setForm((f) => ({ ...f, featured_meme_url: e.target.value }))}
                        placeholder="https://… or upload"
                        className="bg-[#111] border-[#333] flex-1"
                      />
                      <label
                        className={cn(
                          "inline-flex items-center justify-center h-10 px-4 rounded-md border border-[#333] bg-[#111] text-sm font-medium cursor-pointer hover:bg-[#222] transition-colors",
                          uploading && "opacity-50 pointer-events-none"
                        )}
                      >
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                        {uploading ? "Uploading…" : "Upload"}
                      </label>
                    </div>
                    {form.featured_meme_url && (
                      <div className="mt-2 h-24 w-32 rounded border border-[#333] overflow-hidden bg-[#111]">
                        <MediaImage src={form.featured_meme_url} alt="Meme preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch id="is_current" checked={form.is_current} onCheckedChange={handleIsCurrentChange} />
                  <Label htmlFor="is_current">Set as Current Edition</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal} className="border-[#333]">Cancel</Button>
                <Button onClick={handleSaveStep1} disabled={saving} className="bg-dose-orange hover:bg-dose-orange/90">
                  {saving ? "Saving…" : "Save & continue"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="what_is_it">What is it</Label>
                  <Textarea
                    id="what_is_it"
                    value={contentForm.what_is_it}
                    onChange={(e) => setContentForm((f) => ({ ...f, what_is_it: e.target.value }))}
                    placeholder="Brief description…"
                    rows={2}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="so_what">So what</Label>
                  <Textarea
                    id="so_what"
                    value={contentForm.so_what}
                    onChange={(e) => setContentForm((f) => ({ ...f, so_what: e.target.value }))}
                    placeholder="Why it matters…"
                    rows={2}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="now_what">Now what</Label>
                  <Textarea
                    id="now_what"
                    value={contentForm.now_what}
                    onChange={(e) => setContentForm((f) => ({ ...f, now_what: e.target.value }))}
                    placeholder="Next steps or takeaway…"
                    rows={2}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Media: image URL or upload, optional caption and link out</Label>
                  {contentForm.media_rows.map((row, i) => (
                    <div key={i} className="flex flex-col gap-2 p-2 rounded border border-[#222]">
                      <div className="flex gap-2 items-center flex-wrap">
                        <Input
                          value={row.url}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)),
                            }))
                          }
                          placeholder="Image URL, or Instagram/TikTok link (embeds), or Upload below"
                          className="bg-[#111] border-[#333] flex-1 min-w-[200px]"
                        />
                        <label
                          className={cn(
                            "inline-flex items-center justify-center h-10 px-3 rounded-md border border-[#333] bg-[#111] text-sm font-medium cursor-pointer hover:bg-[#222] transition-colors shrink-0",
                            uploadingMediaRow === i && "opacity-50 pointer-events-none"
                          )}
                        >
                          <input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(ev) => handleMediaRowUpload(ev, i)}
                            disabled={uploadingMediaRow !== null}
                          />
                          {uploadingMediaRow === i ? "Uploading…" : "Upload"}
                        </label>
                        <Input
                          value={row.caption}
                          onChange={(e) =>
                            setContentForm((f) => ({
                              ...f,
                              media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, caption: e.target.value } : r)),
                            }))
                          }
                          placeholder="Caption"
                          className="bg-[#111] border-[#333] w-28 shrink-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-red-400 shrink-0"
                          onClick={() =>
                            setContentForm((f) => ({
                              ...f,
                              media_rows: f.media_rows.filter((_, j) => j !== i).length ? f.media_rows.filter((_, j) => j !== i) : [{ url: "", caption: "", external_link: "" }],
                            }))
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        value={row.external_link}
                        onChange={(e) =>
                          setContentForm((f) => ({
                            ...f,
                            media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, external_link: e.target.value } : r)),
                          }))
                        }
                        placeholder="Link out (optional) — URL when user clicks the image"
                        className="bg-[#111] border-[#333] text-sm"
                      />
                      <div className="mt-1">
                        <MediaRowPreview row={row} />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit border-[#333] text-gray-400"
                    onClick={() => setContentForm((f) => ({ ...f, media_rows: [...f.media_rows, { url: "", caption: "", external_link: "" }] }))}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add media
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal} className="border-[#333]">Cancel</Button>
                <Button onClick={handleSaveStep3} disabled={saving} className="bg-dose-orange hover:bg-dose-orange/90">
                  {saving ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isCurrentConfirmOpen} onOpenChange={setIsCurrentConfirmOpen}>
        <AlertDialogContent className="bg-[#0a0a0a] border-[#222]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Set as current edition
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will unset the current edition. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelIsCurrentConfirm} className="border-[#333]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmIsCurrent} className="bg-dose-orange hover:bg-dose-orange/90">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#0a0a0a] border-[#222]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete edition
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this edition? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#333]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!setCurrentTarget} onOpenChange={() => setSetCurrentTarget(null)}>
        <AlertDialogContent className="bg-[#0a0a0a] border-[#222]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Set as current edition
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This will unset the current edition. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#333]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSetCurrent}
              className="bg-dose-orange hover:bg-dose-orange/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
