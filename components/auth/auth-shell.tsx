import * as React from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

import { Logo } from "@/components/logo"

const highlights = [
  "Report issues in under a minute",
  "Track resolutions in real time",
  "Earn reward coins and badges",
  "Powered by AI priority detection",
]

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_80%_10%,rgba(255,255,255,0.15),transparent)]" />
        <Logo href="/" className="text-primary-foreground [&_span:last-child]:text-primary-foreground" />
        <div className="relative flex flex-col gap-6">
          <h2 className="max-w-md text-3xl font-bold tracking-tight text-balance">
            Building Better Cities Together
          </h2>
          <p className="max-w-md text-primary-foreground/80 text-pretty">
            Join a community of citizens and municipal teams resolving civic
            issues faster than ever.
          </p>
          <ul className="flex flex-col gap-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="size-5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">
          © 2026 CitySolver · GovTech Platform
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-4 lg:hidden">
            <Logo href="/" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="mt-6">{children}</div>
          {footer ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {footer}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
          />
        </svg>
        Google
      </Link>
      <Link
        href="/dashboard"
        className="flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
      >
        <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
          />
        </svg>
        GitHub
      </Link>
    </div>
  )
}
