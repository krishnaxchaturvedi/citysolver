"use client"

import * as React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/states"
import { useAuth } from "@/lib/supabase/auth-context"
import { useNotifications } from "@/lib/supabase/use-notifications"
import { Bell, CircleCheck as CheckCircle2 } from "lucide-react"

export default function NotificationsPage() {
  const { profile } = useAuth()
  const { notifications, loading, markAllRead } = useNotifications()

  return (
    <ProtectedRoute>
      <DashboardShell
        items={citizenNav}
        label="Citizen Portal"
        title="Notifications"
        description="Stay updated on your complaints"
        user={{ name: profile?.full_name || "Citizen", detail: profile?.role || "citizen", avatar: profile?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" }}
      >
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-live="polite">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! New notifications will appear here."
          />
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
                aria-label="Mark all notifications as read"
              >
                <CheckCircle2 className="size-4" />
                Mark all as read
              </button>
            </div>
            <div className="space-y-3">
              {notifications.map(n => (
                <Card key={n.id} className={n.read ? "opacity-70" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 size-2 shrink-0 rounded-full ${n.type === "success" ? "bg-success" : n.type === "warning" ? "bg-warning" : "bg-primary"}`}
                        aria-hidden="true"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </DashboardShell>
    </ProtectedRoute>
  )
}
