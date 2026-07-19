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

export default function LoginPage() {
  const router = useRouter()
  const { signIn, user, loading: authLoading } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard")
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter your email and password")
      return
    }
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      toast.error("Login failed", { description: error })
      return
    }
    toast.success("Welcome back!")
    router.replace("/dashboard")
  }

  return (
    <AuthShell
      title="Sign in to CitySolver"
      description="Enter your credentials to access your account"
      footer={<>Don't have an account? <Link href="/register" className="font-medium text-primary hover:underline">Sign up</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Signing in...</> : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  )
}
