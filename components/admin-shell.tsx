"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import type { User } from "@supabase/supabase-js"

interface AdminShellProps {
  user: User | null
  children: React.ReactNode
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <>
      <AdminSidebar user={user} />
      <main className="ml-64 p-8">{children}</main>
    </>
  )
}
