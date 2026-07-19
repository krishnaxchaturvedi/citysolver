"use client"

import * as React from "react"
import { getMyComplaints, subscribeToComplaints } from "@/lib/supabase/services"
import type { Complaint } from "@/lib/supabase/types"

export function useComplaints() {
  const [complaints, setComplaints] = React.useState<Complaint[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyComplaints()
      setComplaints(data)
    } catch (err: any) {
      setError(err.message || "Failed to load complaints")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
    const sub = subscribeToComplaints(() => load())
    return () => { sub() }
  }, [load])

  return { complaints, loading, error, reload: load }
}
