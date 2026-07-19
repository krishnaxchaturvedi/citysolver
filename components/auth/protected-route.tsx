"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/supabase/auth-context"
import type { UserRole } from "@/lib/supabase/types"
import { Loader as Loader2 } from "lucide-react"

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}) {
  const router = useRouter()
  const { user, profile, role, loading } = useAuth()
  const [checked, setChecked] = React.useState(false)

  React.useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace(role === "admin" ? "/admin" : role === "officer" ? "/admin/complaints" : "/dashboard")
      return
    }
    setChecked(true)
  }, [user, role, loading, allowedRoles, router])

  if (loading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    )
  }

  return <>{children}</>
}
