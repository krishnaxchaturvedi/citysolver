"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, CircleCheck as CheckCircle2, Circle as XCircle, Coins, UserPlus, Search, TriangleAlert as AlertTriangle, Eye, Trash2, Check, ListFilter as Filter } from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { currentUser, notifications as initialNotifications, type NotificationItem } from "@/lib/data"

const typeConfig: Record<NotificationItem["type"], { icon: React.ElementType; color: string }> = {
  approved: { icon: CheckCircle2, color: "text-success bg-success/10" },
  assigned: { icon: UserPlus, color: "text-primary bg-primary/10" },
  resolved: { icon: CheckCircle2, color: "text-success bg-success/10" },
  coins: { icon: Coins, color: "text-warning bg-warning/10" },
  review: { icon: Eye, color: "text-primary bg-primary/10" },
}

const filterTypes: NotificationItem["type"][] = ["approved", "assigned", "resolved", "coins", "review"]

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [typeFilter, setTypeFilter] = React.useState<NotificationItem["type"][]>([])
  const [readFilter, setReadFilter] = React.useState<"all" | "read" | "unread">("all")
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  React.useEffect(() => {
    let active = true
    fetch("/api/notifications").then(async response => {
      if (!response.ok) throw new Error("Unable to load notifications")
      return response.json()
    }).then(({ notifications: rows }) => {
      if (!active) return
      setNotifications((rows || []).map((row: { id: string; title: string; message: string; read_at: string | null; created_at: string }) => ({
        id: row.id, title: row.title, message: row.message, read: Boolean(row.read_at), time: new Date(row.created_at).toLocaleString(),
        type: /coin|reward/i.test(row.title) ? "coins" : /assign/i.test(row.title) ? "assigned" : /resolv/i.test(row.title) ? "resolved" : /approv/i.test(row.title) ? "approved" : "review",
        ticket: row.message.match(/CS-\\d{4}-[A-Z0-9]+/)?.[0],
      })))
    }).catch(() => toast.error("Could not load notifications"))
    return () => { active = false }
  }, [])

  const toggleType = (type: NotificationItem["type"]) => {
    setTypeFilter(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const filteredNotifications = React.useMemo(() => {
    let result = [...notifications]

    if (typeFilter.length > 0) {
      result = result.filter(n => typeFilter.includes(n.type))
    }

    if (readFilter === "read") {
      result = result.filter(n => n.read)
    } else if (readFilter === "unread") {
      result = result.filter(n => !n.read)
    }

    return result.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1
      return 0
    })
  }, [notifications, typeFilter, readFilter])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
      if (!response.ok) throw new Error("Update failed")
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { toast.error("Could not update notification") }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mark_all: true }) })
      if (!response.ok) throw new Error("Update failed")
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success("All notifications marked as read")
    } catch { toast.error("Could not update notifications") }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Delete failed")
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success("Notification deleted")
    } catch { toast.error("Could not delete notification") }
  }

  const clearFilters = () => {
    setTypeFilter([])
    setReadFilter("all")
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Notifications"
      description={`${unreadCount} unread notifications`}
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
      actions={
        unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="mr-2 size-4" />
            Mark All Read
          </Button>
        )
      }
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="size-4" />
                  Type
                  {typeFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {typeFilter.length}
                    </Badge>
                  )}
                </Button>
              } />
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filterTypes.map(type => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={typeFilter.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                    className="capitalize"
                  >
                    {type}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={readFilter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setReadFilter(readFilter === "unread" ? "all" : "unread")}
            >
              Unread Only
              {readFilter === "unread" && (
                <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
              )}
            </Button>

            <Button
              variant={readFilter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setReadFilter(readFilter === "read" ? "all" : "read")}
            >
              Read Only
            </Button>

            {(typeFilter.length > 0 || readFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <Empty className="min-h-64">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bell className="size-6" />
                  </EmptyMedia>
                  <EmptyTitle>No notifications found</EmptyTitle>
                  <EmptyDescription>
                    {typeFilter.length > 0 || readFilter !== "all"
                      ? "Try adjusting your filters"
                      : "You're all caught up!"}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => {
                  const config = typeConfig[notification.type]

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-4 p-4 transition-colors hover:bg-muted/50",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        config.color
                      )}>
                        <config.icon className="size-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{notification.title}</p>
                              {!notification.read && (
                                <span className="size-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">
                                {notification.time}
                              </span>
                              {notification.ticket && (
                                <Link
                                  href={`/tracking/${notification.ticket}`}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  View Ticket →
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => markAsRead(notification.id)}
                                aria-label="Mark as read"
                              >
                                <Check className="size-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => deleteNotification(notification.id)}
                              aria-label="Delete notification"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {notifications.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredNotifications.length} of {notifications.length} notifications
            · {unreadCount} unread
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
