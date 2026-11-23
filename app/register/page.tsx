"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuthShell, SocialButtons } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const password = String(form.get("password") || "")
    if (password !== String(form.get("confirm") || "")) {
      toast.error("Passwords do not match.")
      setLoading(false)
      return
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone"), password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to create account.")
      if (result.confirmationRequired) {
        toast.success("Account created. Check your email to confirm, then sign in.")
        router.push("/login")
      } else {
        toast.success("Account created successfully.")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start reporting issues and earning rewards today."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input id="name" name="name" placeholder="Aarav Sharma" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" name="email" type="email" placeholder="you@email.com" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
            <FieldDescription>Use at least 8 characters.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <Input id="confirm" name="confirm" type="password" placeholder="••••••••" required />
          </Field>
        </FieldGroup>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
        <FieldSeparator>or sign up with</FieldSeparator>
        <SocialButtons />
      </form>
    </AuthShell>
  )
}
