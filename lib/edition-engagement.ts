"use server"

import { createClient } from "@/lib/supabase/server"

export type EditionComment = {
  id: string
  edition_id: string
  user_id: string
  body: string
  created_at: string
  user_email?: string | null
}

export async function getEditionLikes(editionId: string): Promise<{
  count: number
  userLiked: boolean
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count, error: countError } = await supabase
    .from("edition_likes")
    .select("*", { count: "exact", head: true })
    .eq("edition_id", editionId)

  if (countError) return { count: 0, userLiked: false }

  let userLiked = false
  if (user) {
    const { data: like } = await supabase
      .from("edition_likes")
      .select("edition_id")
      .eq("edition_id", editionId)
      .eq("user_id", user.id)
      .maybeSingle()
    userLiked = !!like
  }

  return { count: count ?? 0, userLiked }
}

export async function toggleEditionLike(editionId: string): Promise<
  | { ok: true; count: number; userLiked: boolean }
  | { ok: false; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to like." }

  const { data: existing } = await supabase
    .from("edition_likes")
    .select("edition_id")
    .eq("edition_id", editionId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    await supabase
      .from("edition_likes")
      .delete()
      .eq("edition_id", editionId)
      .eq("user_id", user.id)
  } else {
    await supabase.from("edition_likes").insert({
      edition_id: editionId,
      user_id: user.id,
    })
  }

  return getEditionLikes(editionId).then((r) => ({ ok: true as const, ...r }))
}

export async function getEditionComments(editionId: string): Promise<EditionComment[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("edition_comments")
    .select("id, edition_id, user_id, body, created_at")
    .eq("edition_id", editionId)
    .order("created_at", { ascending: true })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    edition_id: row.edition_id,
    user_id: row.user_id,
    body: row.body,
    created_at: row.created_at,
  }))
}

export async function addEditionComment(
  editionId: string,
  body: string
): Promise<{ ok: true; comment: EditionComment } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to comment." }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: "Comment cannot be empty." }

  const { data, error } = await supabase
    .from("edition_comments")
    .insert({ edition_id: editionId, user_id: user.id, body: trimmed })
    .select("id, edition_id, user_id, body, created_at")
    .single()

  if (error) return { ok: false, error: error.message }

  return {
    ok: true,
    comment: {
      id: data.id,
      edition_id: data.edition_id,
      user_id: data.user_id,
      body: data.body,
      created_at: data.created_at,
    },
  }
}

export async function deleteEditionComment(commentId: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sign in to delete." }

  const { error } = await supabase
    .from("edition_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
