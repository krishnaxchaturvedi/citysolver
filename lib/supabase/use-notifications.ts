"use client"

import * as React from "react"
import { getNotifications, markNotificationRead, markAllNotificationsRead, subscribeToNotifications } from "@/lib/supabase/services"
import type { Notification } from "@/lib/supabase/types"

export function useNotifications() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [loading, setLoading] = React.useState(true)

  const load = React.useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
    const sub = subscribeToNotifications(() => load())
    return () => { sub() }
  }, [load])

  const markRead = React.useCallback(async (id: string) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = React.useCallback(async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  return { notifications, loading, markRead, markAllRead, reload: load }
}
