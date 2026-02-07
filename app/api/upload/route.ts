import { createClient } from "@/lib/supabase/server"
import { isAllowedAdmin } from "@/lib/auth-config"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email || !isAllowedAdmin(user.email)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    )
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const timestamp = Date.now()
  const path = `${timestamp}-${sanitizedName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error } = await supabase.storage
    .from("media")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
