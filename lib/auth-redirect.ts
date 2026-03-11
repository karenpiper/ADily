/**
 * Base URL for OAuth redirects. Use NEXT_PUBLIC_APP_URL in production (e.g. on Vercel)
 * so redirects always go to your deployed URL, not localhost.
 *
 * In Vercel: set Environment Variable NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
 * In Supabase Dashboard → Authentication → URL Configuration:
 * - Add your production URL to Redirect URLs: https://your-app.vercel.app/auth/callback
 * - Add localhost for dev: http://localhost:3000/auth/callback
 */
export function getAuthRedirectBase(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  }
  return process.env.NEXT_PUBLIC_APP_URL || ""
}
