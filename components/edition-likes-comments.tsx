"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { EditionComment } from "@/lib/edition-engagement"
import {
  toggleEditionLike,
  addEditionComment,
  deleteEditionComment,
} from "@/lib/edition-engagement"
import { Heart, MessageCircle, LogOut } from "lucide-react"

type InitialState = {
  likeCount: number
  userLiked: boolean
  comments: EditionComment[]
}

export function EditionLikesComments({
  editionId,
  user,
  initial,
}: {
  editionId: string
  user: User | null
  initial: InitialState | null
}) {
  const [state, setState] = useState<InitialState>(
    initial ?? { likeCount: 0, userLiked: false, comments: [] }
  )
  const [commentBody, setCommentBody] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  const handleLike = () => {
    if (!user) return
    startTransition(async () => {
      const result = await toggleEditionLike(editionId)
      if (result.ok) {
        setState((s) => ({
          ...s,
          likeCount: result.count,
          userLiked: result.userLiked,
        }))
      }
    })
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentBody.trim()) return
    startTransition(async () => {
      const result = await addEditionComment(editionId, commentBody.trim())
      if (result.ok) {
        setState((s) => ({
          ...s,
          comments: [...s.comments, result.comment],
        }))
        setCommentBody("")
      }
    })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!user) return
    startTransition(async () => {
      const result = await deleteEditionComment(commentId)
      if (result.ok) {
        setState((s) => ({
          ...s,
          comments: s.comments.filter((c) => c.id !== commentId),
        }))
      }
    })
  }

  if (!user) {
    return (
      <section className="mt-16 pt-10 border-t border-[#333]">
        <p className="text-dose-gray-mid text-sm mb-4">
          Sign in to like and comment on this edition.
        </p>
        <Link href={`/login?next=${encodeURIComponent(`/edition/${editionId}`)}`}>
          <Button className="bg-dose-orange hover:bg-dose-orange/90">
            Sign in with Google
          </Button>
        </Link>
      </section>
    )
  }

  return (
    <section className="mt-16 pt-10 border-t border-[#333]">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-8">
          <button
          type="button"
          onClick={handleLike}
          disabled={pending}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            state.userLiked ? "text-dose-orange" : "text-gray-400 hover:text-dose-orange"
          }`}
        >
          <Heart
            className={`h-5 w-5 ${state.userLiked ? "fill-current" : ""}`}
          />
          <span>{state.likeCount} like{state.likeCount !== 1 ? "s" : ""}</span>
        </button>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments
        </h3>

        <form onSubmit={handleSubmitComment} className="mb-6">
          <Textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="bg-[#111] border-[#333] text-gray-200 placeholder:text-gray-500 mb-2"
            disabled={pending}
          />
          <Button
            type="submit"
            disabled={pending || !commentBody.trim()}
            className="bg-dose-orange hover:bg-dose-orange/90"
          >
            {pending ? "Posting…" : "Post comment"}
          </Button>
        </form>

        <ul className="space-y-4">
          {state.comments.map((c) => (
            <li
              key={c.id}
              className="py-3 px-4 rounded-lg bg-[#111] border border-[#222]"
            >
              <p className="text-sm text-dose-gray-light whitespace-pre-wrap">
                {c.body}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(c.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                {c.user_id === user.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    disabled={pending}
                    className="text-xs text-gray-500 hover:text-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {state.comments.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        )}
      </div>
    </section>
  )
}
