import * as React from "react"
import Link from "next/link"
import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModeToggle } from "@/components/mode-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import type { NavItem } from "@/components/dashboard/nav-config"

export function DashboardShell({
  items,
  label,
  title,
  description,
  actions,
  children,
  user,
}: {
  items: NavItem[]
  label: string
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  user?: { name: string; detail: string; avatar: string }
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar items={items} label={label} user={user} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger />
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search complaints, tickets, zones..."
              className="pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Notifications"
              render={<Link href="/notifications" />}
            >
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight text-balance">
                {title}
              </h1>
              {description ? (
                <p className="text-sm text-muted-foreground text-pretty">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
