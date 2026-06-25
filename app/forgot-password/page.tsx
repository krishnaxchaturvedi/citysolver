"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, MailCheck } from "lucide-react"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    toast.success("Reset link sent", {
      description: "Check your inbox for instructions.",
    })
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <MailCheck className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to your inbox.
            </p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Resend link
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="you@email.com" required />
            </Field>
          </FieldGroup>
          <Button type="submit">Send reset link</Button>
        </form>
      )}
    </AuthShell>
  )
}
