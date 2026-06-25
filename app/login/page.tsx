"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuthShell, SocialButtons } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { FieldSeparator } from "@/components/ui/field"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    toast.success("Welcome back!", { description: "Redirecting to your dashboard." })
    setTimeout(() => router.push("/dashboard"), 900)
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue improving your city."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="you@email.com" required />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" required />
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <FieldSeparator>or continue with</FieldSeparator>
        <SocialButtons />
      </form>
    </AuthShell>
  )
}
