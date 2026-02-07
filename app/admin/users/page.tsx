import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserRole, SUPER_ADMIN_EMAIL } from "@/lib/auth-config"
import { UsersPageContent } from "./users-page-content"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")
  const role = await getUserRole(user.email ?? "")
  // TODO: enforce editor/viewer restrictions on other admin pages
  if (role !== "admin") {
    redirect("/admin?error=admin_required")
  }

  return (
    <UsersPageContent
      currentUserEmail={user.email ?? ""}
      superAdminEmail={SUPER_ADMIN_EMAIL}
    />
  )
}
