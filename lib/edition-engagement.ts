"use server"

import { createClient } from "@/lib/supabase/server"

export type EditionComment = {
  id: string
  edition_id: string
  user_id: string
  body: string
  created_at: string
  author_name?: string | null
  author_avatar_url?: string | null
}

export type EditionLiker = {
  user_id: string
  liker_name?: string | null
  liker_avatar_url?: string | null
}

export async function getEditionLikes(editionId: string): Promise<{
  count: number
  userLiked: boolean
  likers: EditionLiker[]
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rows, error } = await supabase
    .from("edition_likes")
    .select("user_id, liker_name, liker_avatar_url")
    .eq("edition_id", editionId)

  if (error) return { count: 0, userLiked: false, likers: [] }

  const likers: EditionLiker[] = (rows ?? []).map((r) => ({
    user_id: r.user_id,
    liker_name: r.liker_name ?? null,
    liker_avatar_url: r.liker_avatar_url ?? null,
  }))
  const count = likers.length
  const userLiked = user ? likers.some((l) => l.user_id === user.id) : false

  return { count, userLiked, likers }
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
    const likerName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split("@")[0] ||
      null
    const likerAvatarUrl =
      (user.user_metadata?.avatar_url as string) ||
      (user.user_metadata?.picture as string) ||
      null
    await supabase.from("edition_likes").insert({
      edition_id: editionId,
      user_id: user.id,
      liker_name: likerName,
      liker_avatar_url: likerAvatarUrl,
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
    .select("id, edition_id, user_id, body, created_at, author_name, author_avatar_url")
    .eq("edition_id", editionId)
    .order("created_at", { ascending: true })

  if (error) return []

  return (data ?? []).map((row) => ({
    id: row.id,
    edition_id: row.edition_id,
    user_id: row.user_id,
    body: row.body,
    created_at: row.created_at,
    author_name: row.author_name ?? null,
    author_avatar_url: row.author_avatar_url ?? null,
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

  const authorName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split("@")[0] ||
    null
  const authorAvatarUrl =
    (user.user_metadata?.avatar_url as string) ||
    (user.user_metadata?.picture as string) ||
    null

  const { data, error } = await supabase
    .from("edition_comments")
    .insert({
      edition_id: editionId,
      user_id: user.id,
      body: trimmed,
      author_name: authorName,
      author_avatar_url: authorAvatarUrl,
    })
    .select("id, edition_id, user_id, body, created_at, author_name, author_avatar_url")
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
      author_name: data.author_name ?? null,
      author_avatar_url: data.author_avatar_url ?? null,
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
