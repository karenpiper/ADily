// MANUAL SETUP REQUIRED:
// 1. Go to Supabase Dashboard → Authentication → Providers → Google → Enable
// 2. Create OAuth credentials at console.cloud.google.com:
//    - Create a new OAuth 2.0 Client ID (Web application)
//    - Authorized redirect URI: https://<your-supabase-project>.supabase.co/auth/v1/callback
//    - Copy the Client ID and Client Secret into the Supabase Google provider settings
// 3. In Supabase Dashboard → Authentication → URL Configuration:
//    - Set Site URL to your production URL (or http://localhost:3000 for dev)
//    - Add redirect URLs: http://localhost:3000/auth/callback, https://yourdomain.com/auth/callback

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { isAllowedAdmin } from "@/lib/auth-config"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/admin"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // ignore in callback
            }
          },
        },
      }
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      if (await isAllowedAdmin(data.user.email)) {
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/admin/login?error=unauthorized`
        )
      }
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
}
