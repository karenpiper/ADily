import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isAllowedAdmin } from "@/lib/auth-config"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public: auth callback must be accessible without auth
  if (pathname.startsWith("/auth/")) {
    return response
  }

  // Admin login page
  if (pathname === "/admin/login") {
    if (user) {
      if (await isAllowedAdmin(user.email)) {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL("/admin/login?error=unauthorized", request.url)
      )
    }
    return response
  }

  // Protect all other /admin routes
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
    if (!(await isAllowedAdmin(user.email))) {
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL("/admin/login?error=unauthorized", request.url)
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
