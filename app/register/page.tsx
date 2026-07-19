"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/supabase/auth-context"
import { toast } from "sonner"
import { Loader as Loader2 } from "lucide-react"
import type { UserRole } from "@/lib/supabase/types"

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, user, loading: authLoading } = useAuth()
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<UserRole>("citizen")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard")
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setSubmitting(true)
    const { error } = await signUp(email, password, fullName, role)
    setSubmitting(false)
    if (error) {
      toast.error("Registration failed", { description: error })
      return
    }
    toast.success("Account created!", { description: "Please sign in with your credentials." })
    router.replace("/login")
  }

  return (
    <AuthShell
      title="Create your CitySolver account"
      description="Join citizens and officers resolving civic issues"
      footer={<>Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Registration form">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" type="text" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" minLength={6} />
        </div>
        <div className="space-y-2">
          <Label>Account Type</Label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account type">
            {(["citizen", "officer", "admin"] as UserRole[]).map(r => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={role === r}
                onClick={() => setRole(r)}
                className={`rounded-lg border-2 px-3 py-2 text-sm font-medium capitalize transition-all ${role === r ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-accent"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Creating account...</> : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  )
}
