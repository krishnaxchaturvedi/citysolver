import { notFound } from "next/navigation"
import Link from "next/link"
import { complaints } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge, PriorityBadge } from "@/components/status-badges"
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react"

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const complaint = complaints.find(c => c.id === id)
  if (!complaint) notFound()

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" render={<Link href="/complaints" />} className="mb-4" aria-label="Back to complaints">
          <ArrowLeft className="mr-2 size-4" aria-hidden="true" /> Back
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{complaint.id}</span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <CardTitle>{complaint.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              <img src={complaint.image} alt={complaint.category} className="size-full object-cover" />
            </div>
            <p className="text-sm text-muted-foreground">{complaint.description}</p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" aria-hidden="true" /> {complaint.location}</div>
              <div className="flex items-center gap-2"><Calendar className="size-4 text-muted-foreground" aria-hidden="true" /> {complaint.date}</div>
              <div className="flex items-center gap-2"><User className="size-4 text-muted-foreground" aria-hidden="true" /> {complaint.citizen}</div>
            </div>
            {complaint.officer && (
              <div className="rounded-lg bg-primary/5 p-3 text-sm">
                <span className="text-muted-foreground">Assigned Officer: </span>
                <span className="font-medium text-primary">{complaint.officer}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
