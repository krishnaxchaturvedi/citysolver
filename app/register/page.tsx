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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    toast.success("Account created!", {
      description: "Welcome to CitySolver. Redirecting...",
    })
    setTimeout(() => router.push("/dashboard"), 900)
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
            <Input id="name" placeholder="Aarav Sharma" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="you@email.com" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone number</FieldLabel>
            <Input id="phone" type="tel" placeholder="+91 98765 43210" required />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" type="password" placeholder="••••••••" required />
            <FieldDescription>Use at least 8 characters.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
            <Input id="confirm" type="password" placeholder="••••••••" required />
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
