"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

export interface NavItem {
  title: string
  href: string
  icon: React.ElementType
}

export function DashboardShell({
  items,
  label,
  title,
  description,
  user,
  children,
}: {
  items: NavItem[]
  label: string
  user: { name: string; detail: string; avatar: string }
  title?: string
  description?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const sidebarRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [sidebarOpen])

  const navItems = React.useMemo(() => items, [items])

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        aria-label={`${label} navigation`}
        role="navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background transition-transform duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold" aria-hidden="true">
            C
          </div>
          <span className="font-semibold">CitySolver</span>
        </div>
        <div className="px-3 py-2">
          <p className="px-3 py-1 text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <nav className="space-y-1" aria-label={label}>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} alt={user.name} className="size-9" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.detail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={sidebarOpen}
              aria-controls="mobile-sidebar"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            {title && (
              <div>
                <h1 className="text-lg font-semibold">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6" id="main-content">{children}</main>
      </div>
    </div>
  )
}
