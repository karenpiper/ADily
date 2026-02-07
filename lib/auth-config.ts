// Add authorized admin emails here
export const ALLOWED_ADMIN_EMAILS: string[] = [
  // 'you@gmail.com',
  // 'teammate@gmail.com',
]

export function isAllowedAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ALLOWED_ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(
    email.toLowerCase()
  )
}
