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
import { createComplaint, generateComplaintId, calculateSeverity, calculateCoins, addComplaintImage } from "@/lib/supabase/services"
import { AIRecommendationPanel } from "@/components/ai/ai-recommendation-panel"
import { AIReasoningPanel } from "@/components/ai/ai-reasoning-panel"
import { DuplicateDetectionCard } from "@/components/ai/duplicate-detection-card"
import { runDuplicateDetection, runPriorityEngine } from "@/lib/ai/ai-services"
import type { DuplicateResult, PriorityResult } from "@/lib/ai/engine"
import { MultiImageUploader } from "@/components/ai/multi-image-uploader"
import { ImageClassificationCard } from "@/components/ai/image-classification-card"
import { OcrCard } from "@/components/ai/ocr-card"
import { EvidenceQualityCard } from "@/components/ai/evidence-quality-card"
import { DescriptionGeneratorCard } from "@/components/ai/description-generator-card"
import {
  createImageEntry,
  analyzeSingleImage,
  combineAnalyses,
  uploadAndSaveAnalysis,
  type PerImageAnalysis,
  type CombinedAnalysisSummary,
} from "@/lib/image-analysis"
import { cn } from "@/lib/utils"
import { MapPin, Crosshair, Loader as Loader2, CircleCheck as CheckCircle2, Brain } from "lucide-react"
import { toast } from "sonner"

const reportLat = 28.62
const reportLng = 77.22

const CATEGORY_MAP: Record<string, CategoryKey> = {
  "Potholes": "Pothole",
  "Road Damage": "Pothole",
  "Garbage Accumulation": "Garbage",
  "Illegal Dumping": "Illegal Dumping",
  "Water Leakage": "Water Leakage",
  "Sewage Overflow": "Drainage Issue",
  "Flooding": "Water Leakage",
  "Street Light Failure": "Broken Streetlight",
  "Broken Infrastructure": "Public Safety",
  "Other Civic Issues": "Other",
}

export default function ReportPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [category, setCategory] = React.useState<CategoryKey | "">("")
  const [categoryManuallySet, setCategoryManuallySet] = React.useState(false)
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [images, setImages] = React.useState<PerImageAnalysis[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [locating, setLocating] = React.useState(false)
  const [coords, setCoords] = React.useState<string | null>(null)
  const [duplicate, setDuplicate] = React.useState<DuplicateResult | null>(null)
  const [priorityResult, setPriorityResult] = React.useState<PriorityResult | null>(null)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [combinedSummary, setCombinedSummary] = React.useState<CombinedAnalysisSummary | null>(null)
  const [descriptionAccepted, setDescriptionAccepted] = React.useState(false)
  const [ocrTexts, setOcrTexts] = React.useState<Record<string, string>>({})

  const isValid = React.useMemo(() =>
    category !== "" && description.length >= 20 && description.length <= 500 && location.length >= 3 && images.length > 0,
    [category, description, location, images]
  )

  // Recompute combined summary when images change
  React.useEffect(() => {
    const summary = combineAnalyses(images)
    setCombinedSummary(summary)

    // Auto-set category from AI if user hasn't manually chosen
    if (summary && !categoryManuallySet) {
      const mapped = CATEGORY_MAP[summary.primaryCategory]
      if (mapped && summary.confidence > 40) {
        setCategory(mapped)
      }
    }
  }, [images, categoryManuallySet])

  // Run AI duplicate detection + priority engine when form has enough data
  React.useEffect(() => {
    if (!category || description.length < 20 || !location) {
      setDuplicate(null)
      setPriorityResult(null)
      return
    }
    setAiLoading(true)
    const timer = setTimeout(async () => {
      try {
        const evidenceScore = combinedSummary?.averageEvidenceScore || 0
        const [dup, prio] = await Promise.all([
          runDuplicateDetection(category as CategoryKey, description.slice(0, 60), description, reportLat, reportLng),
          runPriorityEngine(category as CategoryKey, description, reportLat, reportLng, user?.id),
        ])
        setDuplicate(dup)
        // Enhance priority result with visual evidence
        if (prio && evidenceScore > 0) {
          const adjusted = { ...prio }
          if (evidenceScore >= 70) adjusted.confidence = Math.min(95, adjusted.confidence + 5)
          adjusted.reasoning.push(`Visual evidence quality score: ${evidenceScore}/100`)
          setPriorityResult(adjusted)
        } else {
          setPriorityResult(prio)
        }
      } catch {
        // AI analysis is best-effort; don't block submission
      } finally {
        setAiLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [category, description, location, user?.id, combinedSummary?.averageEvidenceScore])

  const handleAddImage = React.useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const preview = ev.target?.result as string
      const entry = createImageEntry(file, preview)
      setImages(prev => [...prev, entry])
      // Analyze asynchronously
      analyzeSingleImage(entry, images.map(i => ({ id: i.id, hash: i.hash })), categories.map(c => c.label)).then(updated => {
        setImages(prev => prev.map(i => i.id === updated.id ? { ...updated } : i))
      })
    }
    reader.readAsDataURL(file)
  }, [images])

  const handleRemoveImage = React.useCallback((id: string) => {
    setImages(prev => prev.filter(i => i.id !== id))
  }, [])

  const handleRetry = React.useCallback((id: string) => {
    setImages(prev => prev.map(i => {
      if (i.id !== id) return i
      const reset = { ...i, status: "pending" as const, error: undefined }
      analyzeSingleImage(reset, prev.filter(j => j.id !== id).map(j => ({ id: j.id, hash: j.hash })), categories.map(c => c.label)).then(updated => {
        setImages(curr => curr.map(j => j.id === updated.id ? { ...updated } : j))
      })
      return reset
    }))
  }, [])

  const handleOcrTextEdit = React.useCallback((id: string, text: string) => {
    setOcrTexts(prev => ({ ...prev, [id]: text }))
  }, [])

  const handleAcceptDescription = React.useCallback((data: { title: string; description: string; category: string }) => {
    if (data.title) setDescription(d => d.length < 20 ? data.description || d : d)
    if (data.description && description.length < 20) {
      setDescription(data.description)
    } else if (data.description) {
      setDescription(data.description)
    }
    if (data.category) {
      const mapped = CATEGORY_MAP[data.category] || data.category
      setCategory(mapped as CategoryKey)
      setCategoryManuallySet(true)
    }
    setDescriptionAccepted(true)
    toast.success("AI description applied", { description: "Review the fields before submitting." })
  }, [description])

  const handleCategorySelect = React.useCallback((key: CategoryKey) => {
    setCategory(key)
    setCategoryManuallySet(true)
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
      const priority: Priority = priorityResult?.priority ?? "Medium"
      const validImages = images.filter(img => !img.isDuplicate && img.file)
      const primaryImage = validImages[0]?.file || null

      await createComplaint({
        id,
        category: category as CategoryKey,
        title: description.slice(0, 60),
        description,
        priority,
        location,
        lat: reportLat,
        lng: reportLng,
        severity: priorityResult?.severity ?? calculateSeverity(priority),
        coins: calculateCoins(priority),
      }, primaryImage || undefined)

      // Upload remaining images and save all analysis results
      if (validImages.length > 0) {
        // Add extra images to complaint_images table
        for (let i = 1; i < validImages.length; i++) {
          const img = validImages[i]
          try {
            const ext = img.file.name.split(".").pop() || "jpg"
            const path = `${id}-${Date.now()}-${i}.${ext}`
            const { supabase, STORAGE_BUCKET } = await import("@/lib/supabase/client")
            const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, img.file, { cacheControl: "3600", upsert: false })
            if (!error) {
              const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
              await addComplaintImage(id, pub.publicUrl)
            }
          } catch {
            // best-effort
          }
        }

        // Save AI analysis results to image_analysis table
        await uploadAndSaveAnalysis(id, validImages)
      }

      toast.success("Issue Reported Successfully!", { description: `Ticket ID: ${id}` })
      router.push(`/tracking/${id}`)
    } catch (err: any) {
      toast.error("Failed to submit report", { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }, [isValid, user, category, description, location, images, router, priorityResult])

  // Find the first analyzed image for showing detailed cards
  const analyzedImage = images.find(img => img.status === "done" && img.vision)

  return (
    <ProtectedRoute>
      <DashboardShell
        items={citizenNav}
        label="Citizen Portal"
        title="Report an Issue"
        description="File a new civic complaint with AI-powered image analysis"
        user={{ name: profile?.full_name || "Citizen", detail: profile?.role || "citizen", avatar: profile?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200" }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Report a civic issue form">
            {/* Multi-image upload */}
            <MultiImageUploader
              images={images}
              onImagesChange={setImages}
              onAddImage={handleAddImage}
              onRemoveImage={handleRemoveImage}
              onRetry={handleRetry}
              maxImages={5}
            />

            {/* AI analysis results for first analyzed image */}
            {analyzedImage && (
              <div className="space-y-4">
                <ImageClassificationCard analysis={analyzedImage} />
                <OcrCard analysis={analyzedImage} onTextEdit={handleOcrTextEdit} />
                <EvidenceQualityCard analysis={analyzedImage} />
              </div>
            )}

            {/* AI description generator */}
            {combinedSummary && (
              <DescriptionGeneratorCard
                summary={combinedSummary}
                onAccept={handleAcceptDescription}
                accepted={descriptionAccepted}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Issue Category</CardTitle>
                <CardDescription>
                  {categoryManuallySet ? "Category selected manually" : "AI-suggested category — confirm or change"}
                </CardDescription>
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
                        onClick={() => handleCategorySelect(cat.key)}
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

          <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
            {aiLoading && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
                <Brain className="size-4 animate-pulse" aria-hidden="true" />
                AI analyzing your report...
              </div>
            )}
            {combinedSummary && (
              <Card>
                <CardContent className="py-3">
                  <p className="text-xs text-muted-foreground mb-1">Combined Evidence Summary</p>
                  <p className="text-sm font-medium">{combinedSummary.primaryCategory}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg evidence: {combinedSummary.averageEvidenceScore}/100
                    {combinedSummary.extractedText && ` · OCR: ${combinedSummary.ocrConfidence}%`}
                  </p>
                </CardContent>
              </Card>
            )}
            {duplicate && duplicate.duplicateProbability > 40 && (
              <DuplicateDetectionCard
                duplicate={duplicate}
                onReportAnyway={() => {}}
              />
            )}
            {priorityResult && <AIReasoningPanel result={priorityResult} />}
            <AIRecommendationPanel category={category || ""} lat={reportLat} lng={reportLng} />
          </div>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  )
}