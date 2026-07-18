"use client"

import * as React from "react"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Card, CardContent } from "@/components/ui/card"
import { currentUser, complaints } from "@/lib/data"
import { PriorityBadge, StatusBadge } from "@/components/status-badges"

export default function MapPage() {
  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Smart City Map"
      description="Real-time complaint mapping"
      user={{ name: currentUser.name, detail: currentUser.rank, avatar: currentUser.avatar }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-2">
            {complaints.map(c => (
              <Link key={c.id} href={`/tracking/${c.id}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent">
                <div>
                  <p className="font-medium text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
