"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { categories, type CategoryKey, type Priority } from "@/lib/data"
import { useAuth } from "@/lib/supabase/auth-context"
import { createComplaint, generateComplaintId, calculateSeverity, calculateCoins } from "@/lib/supabase/services"
import { RecommendationPanel } from "@/components/recommendation-panel"
import { cn } from "@/lib/utils"
import { Upload, X, MapPin, Crosshair, ImageOff, Loader as Loader2, CircleCheck as CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

const reportLat = 28.62
const reportLng = 77.22

export default function ReportPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [category, setCategory] = React.useState<CategoryKey | "">("")
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [image, setImage] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [locating, setLocating] = React.useState(false)
  const [coords, setCoords] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isValid = React.useMemo(() =>
    category !== "" && description.length >= 20 && description.length <= 500 && location.length >= 3 && image !== null,
    [category, description, location, image]
  )

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", { description: "Please upload an image file." })
      return
    }
    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const removeImage = React.useCallback(() => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const detectLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        setCoords(c)
        setLocating(false)
        toast.success("Location detected", { description: c })
      },
      () => {
        setLocating(false)
        toast.error("Location access denied")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || !user) {
      toast.error("Please complete all fields")
      return
    }
    setSubmitting(true)
    try {
      const id = generateComplaintId()
      const priority: Priority = "Medium"
      await createComplaint({
        id,
        category: category as CategoryKey,
        title: description.slice(0, 60),
        description,
        priority,
        location,
        lat: reportLat,
        lng: reportLng,
        severity: calculateSeverity(priority),
        coins: calculateCoins(priority),
      }, image || undefined)
      toast.success("Issue Reported Successfully!", { description: `Ticket ID: ${id}` })
      router.push(`/tracking/${id}`)
    } catch (err: any) {
      toast.error("Failed to submit report", { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }, [isValid, user, category, description, location, image, router])

  return (
    <ProtectedRoute>
      <DashboardShell
        items={citizenNav}
        label="Citizen Portal"
        title="Report an Issue"
        description="File a new civic complaint"
        user={{ name: profile?.full_name || "Citizen", detail: profile?.role || "citizen", avatar: profile?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Report a civic issue form">
            <Card>
              <CardHeader>
                <CardTitle>Issue Category</CardTitle>
                <CardDescription>Select the type of civic issue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label="Issue category">
                  {categories.map(cat => {
                    const Icon = cat.icon
                    const selected = category === cat.key
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setCategory(cat.key)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                          selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        )}
                      >
                        <Icon className="size-6" aria-hidden="true" />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Describe the issue (20-500 characters)</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="description" className="sr-only">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  maxLength={500}
                  className="min-h-32"
                  aria-describedby="desc-counter"
                />
                <div id="desc-counter" className={cn("mt-2 flex items-center justify-between text-xs", description.length >= 20 ? "text-success" : "text-muted-foreground")}>
                  <span>{description.length >= 20 ? <span className="flex items-center gap-1"><CheckCircle2 className="size-3" aria-hidden="true" /> Minimum reached</span> : `${description.length}/20 minimum`}</span>
                  <span className="text-muted-foreground">{description.length}/500</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Photo Evidence</CardTitle></CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    <img src={imagePreview} alt="Evidence preview" className="size-full object-cover" />
                    <Button type="button" variant="destructive" size="icon-sm" className="absolute right-2 top-2" onClick={removeImage} aria-label="Remove image">
                      <X className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
                    <ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} aria-label="Upload image">
                      <Upload className="mr-2 size-4" aria-hidden="true" />Upload Image
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} aria-label="File upload" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button type="button" variant="outline" onClick={detectLocation} disabled={locating} aria-label="Auto detect GPS location">
                  {locating ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Detecting...</> : <><Crosshair className="mr-2 size-4" aria-hidden="true" />Auto Detect GPS</>}
                </Button>
                {coords && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                    <MapPin className="size-4" aria-hidden="true" />
                    <span className="text-sm font-medium">{coords}</span>
                  </div>
                )}
                <Label htmlFor="location" className="sr-only">Address or area</Label>
                <Input id="location" placeholder="Address / Area" value={location} onChange={e => setLocation(e.target.value)} aria-label="Address or area" />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={submitting} aria-label="Submit report">
                {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Submitting...</> : "Submit Report"}
              </Button>
            </div>
          </form>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <RecommendationPanel category={category || ""} lat={reportLat} lng={reportLng} />
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  )
}
