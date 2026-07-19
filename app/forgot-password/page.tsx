"use client"

import * as React from "react"
import Link from "next/link"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/supabase/auth-context"
import { toast } from "sonner"
import { Loader as Loader2, CircleCheck as CheckCircle2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }
    setSubmitting(true)
    const { error } = await resetPassword(email)
    setSubmitting(false)
    if (error) {
      toast.error("Failed to send reset email", { description: error })
      return
    }
    setSent(true)
    toast.success("Reset link sent", { description: "Check your email for a password reset link." })
  }

  return (
    <AuthShell
      title="Reset your password"
      description="We'll send you a link to reset your password"
      footer={<>Remember your password? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-6 text-center">
          <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
          <p className="font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">We've sent a password reset link to {email}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Forgot password form">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Sending...</> : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
