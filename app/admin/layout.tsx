import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { isAllowedAdmin } from "@/lib/auth-config"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware already redirects; layout double-checks for server-rendered content
  if (user && !isAllowedAdmin(user.email)) {
    redirect("/admin/login?error=unauthorized")
  }

  return (
    <div className="min-h-screen bg-[#111]" style={{ backgroundColor: "#111" }}>
      <AdminShell user={user}>{children}</AdminShell>
    </div>
  )
}
