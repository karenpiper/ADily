"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import type { User } from "@supabase/supabase-js"

interface AdminShellProps {
  user: User | null
  userRole?: string | null
  children: React.ReactNode
}

export function AdminShell({ user, userRole, children }: AdminShellProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <>
      <AdminSidebar user={user} userRole={userRole ?? null} />
      <main className="ml-64 p-8">{children}</main>
    </>
  )
}
