import { createClient } from "@supabase/supabase-js"

// Hardcoded fallback so you can never lock yourself out. Use the first admin email.
const SUPER_ADMIN_EMAIL = "millie.tunnell@codeandtheory.com"

/** Server-side check: user is in allowed_users table (or is super admin). */
export async function isAllowedAdmin(
  email: string | undefined
): Promise<boolean> {
  if (!email) return false
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) return true

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("allowed_users")
    .select("id")
    .ilike("email", email)
    .maybeSingle()
  return !!data
}

/** Get a user's role from allowed_users. */
export async function getUserRole(email: string): Promise<string | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from("allowed_users")
    .select("role")
    .ilike("email", email)
    .maybeSingle()
  return data?.role ?? null
}

export { SUPER_ADMIN_EMAIL }
