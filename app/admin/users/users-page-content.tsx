"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AllowedUser, UserRole } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Lock, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
]

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    admin: "bg-orange-500/20 text-orange-400 border-orange-500/40",
    editor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    viewer: "bg-gray-500/20 text-gray-400 border-gray-500/40",
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        styles[role]
      )}
    >
      {role}
    </span>
  )
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface UsersPageContentProps {
  currentUserEmail: string
  superAdminEmail: string
}

export function UsersPageContent({
  currentUserEmail,
  superAdminEmail,
}: UsersPageContentProps) {
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [addEmail, setAddEmail] = useState("")
  const [addName, setAddName] = useState("")
  const [addRole, setAddRole] = useState<UserRole>("admin")
  const [addSaving, setAddSaving] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<AllowedUser | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [editingRole, setEditingRole] = useState<{ user: AllowedUser; role: UserRole } | null>(null)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("allowed_users")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      toast({ title: "Error loading users", description: error.message, variant: "destructive" })
      return
    }
    setUsers((data as AllowedUser[]) ?? [])
  }, [toast])

  useEffect(() => {
    fetchUsers().finally(() => setLoading(false))
  }, [fetchUsers])

  const isSuperAdmin = (email: string) =>
    email.toLowerCase() === superAdminEmail.toLowerCase()
  const isCurrentUser = (email: string) =>
    email.toLowerCase() === currentUserEmail.toLowerCase()

  const handleAddUser = async () => {
    setAddError(null)
    const email = addEmail.trim()
    if (!email) {
      setAddError("Email is required")
      return
    }
    if (!EMAIL_REGEX.test(email)) {
      setAddError("Please enter a valid email address")
      return
    }
    setAddSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from("allowed_users").insert({
      email,
      name: addName.trim() || null,
      role: addRole,
    })
    setAddSaving(false)
    if (error) {
      if (error.code === "23505") {
        setAddError("This email is already authorized")
      } else {
        setAddError(error.message)
      }
      return
    }
    toast({ title: "User added", description: `${email} has been granted access.` })
    setAddOpen(false)
    setAddEmail("")
    setAddName("")
    setAddRole("admin")
    setAddError(null)
    fetchUsers()
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoveLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("allowed_users")
      .delete()
      .eq("id", removeTarget.id)
    setRemoveLoading(false)
    setRemoveTarget(null)
    if (error) {
      toast({ title: "Error removing user", description: error.message, variant: "destructive" })
      return
    }
    toast({
      title: "Access removed",
      description: `${removeTarget.email} will be logged out on their next visit.`,
    })
    fetchUsers()
  }

  const handleRoleChange = async (user: AllowedUser, newRole: UserRole) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("allowed_users")
      .update({ role: newRole })
      .eq("id", user.id)
    setEditingRole(null)
    if (error) {
      toast({ title: "Error updating role", description: error.message, variant: "destructive" })
      return
    }
    toast({ title: "Role updated", description: `${user.email} is now ${newRole}.` })
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-gray-500">Manage who can access the admin dashboard</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading users…</p>
      ) : (
        <div className="rounded-lg border border-[#222] bg-[#0a0a0a]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#222] hover:bg-transparent">
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Role</TableHead>
                <TableHead className="text-gray-400">Added</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={cn(
                    "border-[#222]",
                    isCurrentUser(user.email) && "bg-dose-orange/10"
                  )}
                >
                  <TableCell className="font-medium text-white">
                    <span className="flex items-center gap-2">
                      {user.email}
                      {isSuperAdmin(user.email) && (
                        <Lock className="h-3.5 w-3.5 text-gray-500" title="Super admin (cannot be removed)" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {user.name || "—"}
                  </TableCell>
                  <TableCell>
                    {editingRole?.user.id === user.id ? (
                      <Select
                        value={editingRole.role}
                        onValueChange={(v) =>
                          setEditingRole((prev) =>
                            prev ? { ...prev, role: v as UserRole } : null
                          )
                        }
                      >
                        <SelectTrigger className="h-8 w-28 border-[#333] bg-[#111] text-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingRole?.user.id === user.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingRole(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRoleChange(editingRole.user, editingRole.role)
                          }
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setEditingRole({ user, role: user.role })
                          }
                        >
                          Edit role
                        </Button>
                        {!isSuperAdmin(user.email) && !isCurrentUser(user.email) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => setRemoveTarget(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="border-[#222] bg-[#111] text-white">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="user@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="border-[#333] bg-[#0a0a0a]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">Name (optional)</Label>
              <Input
                id="add-name"
                placeholder="Full name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="border-[#333] bg-[#0a0a0a]"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={addRole} onValueChange={(v) => setAddRole(v as UserRole)}>
                <SelectTrigger className="border-[#333] bg-[#0a0a0a] text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {addError && (
              <p className="text-sm text-red-400">{addError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} disabled={addSaving}>
              {addSaving ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent className="border-[#222] bg-[#111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove access?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove access for {removeTarget?.email}? They will be logged out on
              their next visit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#333] text-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault()
                await handleRemove()
              }}
              disabled={removeLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {removeLoading ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
