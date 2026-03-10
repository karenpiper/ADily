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
  hero_description: string
  hero_summary: string
  featured_meme_url: string
  include_meme: boolean
  is_current: boolean
}

const emptyForm: FormState = {
  date: "",
  hero_description: DEFAULT_HERO_DESCRIPTION,
  hero_summary: "",
  featured_meme_url: "",
  include_meme: false,
  is_current: false,
}

type ThemeFormState = { theme_name: string; theme_write_up: string }
const emptyThemeForm: ThemeFormState = { theme_name: "", theme_write_up: "" }

type MediaRow = { url: string; caption: string }
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
  media_rows: [{ url: "", caption: "" }],
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
  const [themeForm, setThemeForm] = useState<ThemeFormState>(emptyThemeForm)
  const [contentForm, setContentForm] = useState<ContentFormState>(emptyContentForm)
  const [createStep, setCreateStep] = useState<CreateStep>(1)
  const [createdEditionId, setCreatedEditionId] = useState<string | null>(null)
  const [createdThemeId, setCreatedThemeId] = useState<string | null>(null)
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
    setThemeForm(emptyThemeForm)
    setContentForm(emptyContentForm)
    setCreateStep(1)
    setCreatedEditionId(null)
    setCreatedThemeId(null)
    setModalOpen(true)
  }

  const openEdit = (e: Edition) => {
    setEditingEdition(e)
    setForm({
      date: e.date,
      hero_description: e.hero_description,
      hero_summary: e.hero_summary,
      featured_meme_url: e.featured_meme_url ?? "",
      include_meme: !!e.featured_meme_url,
      is_current: e.is_current,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingEdition(null)
    setForm(emptyForm)
    setThemeForm(emptyThemeForm)
    setContentForm(emptyContentForm)
    setCreateStep(1)
    setCreatedEditionId(null)
    setCreatedThemeId(null)
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
    if (!form.date || !form.hero_summary.trim() || !form.hero_description.trim()) {
      alert("Date, Hero Description, and Hero Summary are required.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        date: form.date,
        hero_description: form.hero_description.trim(),
        hero_summary: form.hero_summary.trim(),
        featured_meme_url: form.include_meme ? (form.featured_meme_url.trim() || null) : null,
        is_current: form.is_current,
      }
      const { data, error } = await supabase.from("editions").insert(payload).select("id").single()
      if (error) throw error
      if (data?.id && form.is_current) {
        await supabase.from("editions").update({ is_current: false }).neq("id", data.id)
      }
      if (data?.id) {
        setCreatedEditionId(data.id)
        setCreateStep(2)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save edition")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveStep2 = async () => {
    if (!createdEditionId || !themeForm.theme_name.trim()) {
      alert("Theme name is required.")
      return
    }
    setSaving(true)
    try {
      const slug = slugify(themeForm.theme_name)
      const { data, error } = await supabase
        .from("themes")
        .insert({
          edition_id: createdEditionId,
          name: themeForm.theme_name.trim(),
          slug,
          description: themeForm.theme_write_up.trim() || null,
          sort_order: 0,
        })
        .select("id")
        .single()
      if (error) throw error
      if (data?.id) {
        setCreatedThemeId(data.id)
        setCreateStep(3)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to save theme")
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
      const headline = themeForm.theme_name.trim() || "Content"
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
    if (!editingEdition || !form.date || !form.hero_summary.trim() || !form.hero_description.trim()) {
      alert("Date, Hero Description, and Hero Summary are required.")
      return
    }
    setSaving(true)
    try {
      if (form.is_current) {
        await supabase
          .from("editions")
          .update({ is_current: false })
          .neq("id", editingEdition.id)
      }
      const payload = {
        date: form.date,
        hero_description: form.hero_description.trim(),
        hero_summary: form.hero_summary.trim(),
        featured_meme_url: form.include_meme ? (form.featured_meme_url.trim() || null) : null,
        is_current: form.is_current,
      }
      const { error } = await supabase.from("editions").update(payload).eq("id", editingEdition.id)
      if (error) throw error
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
                <TableHead className="text-gray-400">Hero Summary</TableHead>
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
        <DialogContent className={cn("bg-[#0a0a0a] border-[#222] text-gray-200", createStep === 3 ? "max-w-2xl" : "max-w-lg")}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingEdition
                ? "Edit Edition"
                : createStep === 1
                  ? "New Edition"
                  : createStep === 2
                    ? "Add theme"
                    : "Add content"}
            </DialogTitle>
          </DialogHeader>

          {editingEdition ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="bg-[#111] border-[#333]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hero_description">Hero Description</Label>
                  <Textarea
                    id="hero_description"
                    value={form.hero_description}
                    onChange={(e) => setForm((f) => ({ ...f, hero_description: e.target.value }))}
                    rows={4}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hero_summary">Hero Summary</Label>
                  <Textarea
                    id="hero_summary"
                    value={form.hero_summary}
                    onChange={(e) => setForm((f) => ({ ...f, hero_summary: e.target.value }))}
                    placeholder="This week, users are…"
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
                  <Switch id="is_current" checked={form.is_current} onCheckedChange={handleIsCurrentChange} />
                  <Label htmlFor="is_current">Set as Current Edition</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal} className="border-[#333]">Cancel</Button>
                <Button onClick={handleSaveEdit} disabled={saving} className="bg-dose-orange hover:bg-dose-orange/90">
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
                  <Label htmlFor="hero_description">Hero description</Label>
                  <Textarea
                    id="hero_description"
                    value={form.hero_description}
                    onChange={(e) => setForm((f) => ({ ...f, hero_description: e.target.value }))}
                    rows={4}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hero_summary">Hero summary</Label>
                  <Textarea
                    id="hero_summary"
                    value={form.hero_summary}
                    onChange={(e) => setForm((f) => ({ ...f, hero_summary: e.target.value }))}
                    placeholder="This week, users are…"
                    rows={3}
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
          ) : createStep === 2 ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="theme_name">Theme name</Label>
                  <Input
                    id="theme_name"
                    value={themeForm.theme_name}
                    onChange={(e) => setThemeForm((f) => ({ ...f, theme_name: e.target.value }))}
                    placeholder="e.g. Audience & Culture"
                    className="bg-[#111] border-[#333]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="theme_write_up">Write-up</Label>
                  <Textarea
                    id="theme_write_up"
                    value={themeForm.theme_write_up}
                    onChange={(e) => setThemeForm((f) => ({ ...f, theme_write_up: e.target.value }))}
                    placeholder="Theme description or copy…"
                    rows={4}
                    className="bg-[#111] border-[#333] resize-y"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeModal} className="border-[#333]">Cancel</Button>
                <Button onClick={handleSaveStep2} disabled={saving} className="bg-dose-orange hover:bg-dose-orange/90">
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
                  <Label>Media (link or upload + caption, one per line)</Label>
                  {contentForm.media_rows.map((row, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <Input
                        value={row.url}
                        onChange={(e) =>
                          setContentForm((f) => ({
                            ...f,
                            media_rows: f.media_rows.map((r, j) => (j === i ? { ...r, url: e.target.value } : r)),
                          }))
                        }
                        placeholder="URL or use Upload"
                        className="bg-[#111] border-[#333] flex-1"
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
                        {uploadingMediaRow === i ? "…" : "Upload"}
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
                            media_rows: f.media_rows.filter((_, j) => j !== i).length ? f.media_rows.filter((_, j) => j !== i) : [{ url: "", caption: "" }],
                          }))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit border-[#333] text-gray-400"
                    onClick={() => setContentForm((f) => ({ ...f, media_rows: [...f.media_rows, { url: "", caption: "" }] }))}
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
