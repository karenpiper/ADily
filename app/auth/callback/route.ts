// MANUAL SETUP REQUIRED:
// 1. Go to Supabase Dashboard → Authentication → Providers → Google → Enable
// 2. Create OAuth credentials at console.cloud.google.com:
//    - Authorized redirect URI: https://<your-supabase-project>.supabase.co/auth/v1/callback
//    - Copy Client ID and Secret into Supabase Google provider
// 3. Supabase → Authentication → URL Configuration:
//    - Site URL: your production URL (e.g. https://your-app.vercel.app)
//    - Redirect URLs: add BOTH:
//      http://localhost:3000/auth/callback
//      https://your-app.vercel.app/auth/callback  (your real production URL)
//    If the production URL is missing, OAuth may redirect to localhost and fail.
// 4. In Vercel (or your host), set env: NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

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
      const isAdminPath = next === "/admin" || next.startsWith("/admin/")
      if (isAdminPath) {
        if (await isAllowedAdmin(data.user.email)) {
          return NextResponse.redirect(`${origin}${next}`)
        }
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/admin/login?error=unauthorized`
        )
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  const isAdminPath = (next === "/admin" || next.startsWith("/admin/"))
  if (isAdminPath) {
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
