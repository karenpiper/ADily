import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin-shell"
import { isAllowedAdmin, getUserRole } from "@/lib/auth-config"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && !(await isAllowedAdmin(user.email))) {
    redirect("/admin/login?error=unauthorized")
  }

  const userRole = user?.email ? await getUserRole(user.email) : null

  return (
    <div className="min-h-screen bg-[#111]" style={{ backgroundColor: "#111" }}>
      <AdminShell user={user} userRole={userRole}>
        {children}
      </AdminShell>
    </div>
  )
}
