import Link from "next/link"
import { Logo } from "@/components/logo"

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Report Issue", href: "/report" },
      { label: "City Map", href: "/map" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "Municipal",
    links: [
      { label: "Staff Dashboard", href: "/admin" },
      { label: "Analytics", href: "/admin/analytics" },
      { label: "Complaints", href: "/admin/complaints" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#features" },
      { label: "Impact", href: "/#impact" },
      { label: "Sign in", href: "/login" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A crowdsourced GovTech platform helping citizens and municipal
              bodies build cleaner, safer, smarter cities together.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="text-sm font-semibold">{col.title}</h4>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 CitySolver. Built for Smart Cities.</p>
          <p>Ready for WhatsApp reporting · DigiLocker · AI prioritization</p>
        </div>
      </div>
    </footer>
  )
}
