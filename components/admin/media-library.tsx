"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button"
import { MediaImage } from "@/components/media-image"
import { Upload, Copy, Check, Trash2, Play } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const ACCEPT_TYPES = ".jpg,.jpeg,.png,.gif,.webp,.mp4"
const ACCEPT_TYPES_ATTR = "image/jpeg,image/png,image/gif,image/webp,video/mp4"

type StorageFile = {
  name: string
  url: string
  updated_at: string
  isVideo: boolean
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_")
}

export function MediaLibrary() {
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    current: number
    total: number
    uploading: boolean
  } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [copiedName, setCopiedName] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StorageFile | null>(null)
  const [deleting, setDeleting] = useState(false)

  const supabase = createClient()

  const fetchFiles = useCallback(async () => {
    const { data, error } = await supabase.storage
      .from("media")
      .list("", { limit: 1000 })

    if (error) {
      console.error(error)
      setFiles([])
      return
    }

    const list = (data ?? []).filter(
      (item): item is { name: string; updated_at?: string } =>
        !!item.name && typeof item.name === "string"
    )

    const withUrls: StorageFile[] = list.map((item) => {
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(item.name)
      const ext = item.name.split(".").pop()?.toLowerCase() ?? ""
      const isVideo = ["mp4", "webm", "mov"].includes(ext)
      return {
        name: item.name,
        url: urlData.publicUrl,
        updated_at: item.updated_at ?? "",
        isVideo,
      }
    })

    withUrls.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
    setFiles(withUrls)
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    fetchFiles().finally(() => setLoading(false))
  }, [fetchFiles])

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return
      const accepted = Array.from(fileList).filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase()
        return ["jpg", "jpeg", "png", "gif", "webp", "mp4"].includes(ext ?? "")
      })
      if (accepted.length === 0) {
        alert("No valid files. Use .jpg, .jpeg, .png, .gif, .webp, or .mp4")
        return
      }
      const total = accepted.length
      setUploadProgress({ current: 0, total, uploading: true })
      for (let i = 0; i < accepted.length; i++) {
        const file = accepted[i]
        const path = `${Date.now()}-${i}-${sanitizeFileName(file.name)}`
        const { error } = await supabase.storage.from("media").upload(path, file, {
          contentType: file.type,
          upsert: false,
        })
        if (error) {
          console.error(error)
          alert(`Upload failed: ${file.name} - ${error.message}`)
        }
        setUploadProgress((p) => (p ? { ...p, current: i + 1 } : null))
      }
      setUploadProgress(null)
      setUploadModalOpen(false)
      await fetchFiles()
    },
    [supabase, fetchFiles]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const onDragLeave = () => setDragOver(false)

  const copyUrl = (file: StorageFile) => {
    navigator.clipboard.writeText(file.url).then(() => {
      setCopiedName(file.name)
      setTimeout(() => setCopiedName(null), 2000)
    })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.storage.from("media").remove([deleteTarget.name])
    setDeleting(false)
    setDeleteTarget(null)
    if (error) {
      console.error(error)
      alert("Failed to delete file")
      return
    }
    await fetchFiles()
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif text-white">Media Library</h1>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="bg-dose-orange hover:bg-dose-orange/90 gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">No files yet. Upload images or videos to get started.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="rounded-lg border border-[#222] bg-[#0a0a0a] overflow-hidden flex flex-col"
              >
                <div className="aspect-square w-full min-h-[120px] bg-[#111] relative overflow-hidden">
                  {file.isVideo ? (
                    <>
                      <video
                        src={file.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="rounded-full bg-black/60 p-3">
                          <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <MediaImage
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-300 truncate px-2 py-2" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-1 p-2 pt-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-dose-orange shrink-0"
                        onClick={() => copyUrl(file)}
                      >
                        {copiedName === file.name ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{copiedName === file.name ? "Copied!" : "Copy URL"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 shrink-0"
                        onClick={() => setDeleteTarget(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload modal */}
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="max-w-md bg-[#0a0a0a] border-[#222] text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-white">Upload files</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragOver ? "border-dose-orange bg-dose-orange/10" : "border-[#333] bg-[#111]"
                )}
              >
                <input
                  type="file"
                  accept={ACCEPT_TYPES_ATTR}
                  multiple
                  className="hidden"
                  id="media-upload-input"
                  onChange={(e) => {
                    handleFiles(e.target.files)
                    e.target.value = ""
                  }}
                  disabled={!!uploadProgress?.uploading}
                />
                <label
                  htmlFor="media-upload-input"
                  className="cursor-pointer block text-sm text-gray-400 hover:text-gray-200"
                >
                  <Upload className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p>Drag & drop files here, or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">
                    .jpg, .jpeg, .png, .gif, .webp, .mp4
                  </p>
                </label>
              </div>
              {uploadProgress?.uploading && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">
                    Uploading {uploadProgress.current} of {uploadProgress.total}…
                  </p>
                  <div className="h-2 rounded-full bg-[#222] overflow-hidden">
                    <div
                      className="h-full bg-dose-orange transition-all duration-300"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => !deleting && setDeleteTarget(null)}>
          <AlertDialogContent className="bg-[#0a0a0a] border-[#222]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Delete file
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Remove &quot;{deleteTarget?.name}&quot; from storage? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#333]" disabled={deleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
