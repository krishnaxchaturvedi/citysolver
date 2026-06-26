"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Camera,
  Upload,
  MapPin,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ImageOff,
  Crosshair,
  Building2,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Truck,
  ShieldAlert,
  HelpCircle,
} from "lucide-react"
import { toast } from "sonner"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { citizenNav } from "@/components/dashboard/nav-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { PriorityBadge } from "@/components/status-badges"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { currentUser, type Priority, type CategoryKey, categories, priorityMeta } from "@/lib/data"

const categoryIcons: Record<CategoryKey, React.ElementType> = {
  "Pothole": Building2,
  "Garbage": Trash2,
  "Broken Streetlight": Lightbulb,
  "Water Leakage": Droplets,
  "Drainage Issue": Waves,
  "Illegal Dumping": Truck,
  "Public Safety": ShieldAlert,
  "Other": HelpCircle,
}

function calculatePriority(category: CategoryKey, description: string): Priority {
  const desc = description.toLowerCase()

  const criticalKeywords = ["highway", "main road", "arterial", "live wire", "electrocution", "flood", "burst", "explosion", "collapse", "accident"]
  const highKeywords = ["dangerous", "risk", "children", "school", "hospital", "night", "dark", "large", "deep", "blocked", "overflow"]
  const mediumKeywords = ["broken", "damage", "leak", "garbage", "waste", "overflow"]

  const catPriority: Record<CategoryKey, "Critical" | "High" | "Medium"> = {
    "Public Safety": "Critical",
    "Pothole": "High",
    "Broken Streetlight": "High",
    "Water Leakage": "High",
    "Garbage": "Medium",
    "Drainage Issue": "Medium",
    "Illegal Dumping": "Medium",
    "Other": "Medium",
  }

  if (criticalKeywords.some(k => desc.includes(k))) return "Critical"
  if (highKeywords.some(k => desc.includes(k))) return "High"
  if (mediumKeywords.some(k => desc.includes(k))) return "Medium"
  if (mediumKeywords.some(k => desc.includes(k))) return "Medium"

  return catPriority[category] || "Low"
}

export default function ReportIssuePage() {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const [formData, setFormData] = React.useState({
    category: "" as CategoryKey | "",
    description: "",
    location: "",
    landmark: "",
    landmarkType: "near",
  })
  const [image, setImage] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [isCapturing, setIsCapturing] = React.useState(false)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [isLocating, setIsLocating] = React.useState(false)
  const [coordinates, setCoordinates] = React.useState<{lat: number; lng: number} | null>(null)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const priority = formData.category && formData.description.length >= 20
    ? calculatePriority(formData.category, formData.description)
    : null

  const priorityInfo = priority ? priorityMeta[priority] : null

  const selectedCategory = formData.category
    ? categories.find(c => c.key === formData.category)
    : null

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      processImageFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const processImageFile = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      })
      setStream(mediaStream)
      setIsCapturing(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      toast.error("Camera access denied", {
        description: "Please allow camera access or use file upload instead."
      })
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
      setImage(dataUrl)
      stopCamera()
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: parseFloat(position.coords.latitude.toFixed(4)),
          lng: parseFloat(position.coords.longitude.toFixed(4)),
        })
        setIsLocating(false)
        toast.success("Location detected", {
          description: `Coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        })
      },
      (error) => {
        setIsLocating(false)
        let message = "Unable to retrieve your location"
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access."
            break
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable"
            break
          case error.TIMEOUT:
            message = "Location request timed out"
            break
        }
        setLocationError(message)
        toast.error("Location Error", { description: message })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const isValid = formData.category &&
    formData.description.length >= 20 &&
    formData.description.length <= 500 &&
    formData.location.length >= 3 &&
    image &&
    coordinates

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const ticketId = `CTS-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`

    toast.success("Issue Reported Successfully!", {
      description: `Your ticket ID is ${ticketId}. Redirecting to tracking...`
    })

    setTimeout(() => {
      router.push(`/tracking/${ticketId}`)
    }, 1000)
  }

  return (
    <DashboardShell
      items={citizenNav}
      label="Citizen Portal"
      title="Report an Issue"
      description="Help improve your city by reporting civic issues"
      user={{
        name: currentUser.name,
        detail: currentUser.rank,
        avatar: currentUser.avatar,
      }}
    >
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 grid gap-6">
          {/* Citizen Info Card */}
          <Card size="sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Welcome, {currentUser.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.phone} · {currentUser.city}, {currentUser.state}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Issue Category */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Category</CardTitle>
              <CardDescription>
                Select the type of civic issue you want to report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = formData.category === cat.key
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleInputChange("category", cat.key)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-accent/50"
                      )}
                    >
                      <span className={cn(
                        "flex size-12 items-center justify-center rounded-xl transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Icon className="size-6" />
                      </span>
                      <span className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {cat.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Describe the issue in detail (20-500 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Example: A large pothole has formed on the main road near the school gate. It's approximately 2 feet wide and very deep, causing vehicles to swerve dangerously. This is a major safety hazard for children crossing the road during school hours."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-32"
                maxLength={500}
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className={cn(
                  formData.description.length >= 20 ? "text-success" : "text-muted-foreground"
                )}>
                  {formData.description.length >= 20 ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      Minimum reached
                    </span>
                  ) : (
                    `${formData.description.length}/20 minimum`
                  )}
                </span>
                <span className="text-muted-foreground">
                  {formData.description.length}/500
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Evidence</CardTitle>
              <CardDescription>
                Upload or capture a photo of the issue
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isCapturing ? (
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4">
                    <Button type="button" variant="outline" onClick={stopCamera}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={capturePhoto}>
                      <Camera className="mr-2 size-4" />
                      Capture
                    </Button>
                  </div>
                </div>
              ) : image ? (
                <div className="relative aspect-video overflow-hidden rounded-xl border">
                  <Image
                    src={image}
                    alt="Uploaded evidence"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="absolute right-2 top-2"
                    onClick={removeImage}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className={cn(
                    "flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                >
                  <div className="flex size-16 items-center justify-center rounded-xl bg-muted">
                    <ImageOff className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Drag and drop an image here</p>
                    <p className="text-sm text-muted-foreground">or use the buttons below</p>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 size-4" />
                      Browse Files
                    </Button>
                    <Button type="button" variant="outline" onClick={startCamera}>
                      <Camera className="mr-2 size-4" />
                      Use Camera
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Provide the exact location of the issue
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={detectLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Crosshair className="mr-2 size-4" />
                      Auto Detect GPS
                    </>
                  )}
                </Button>
              </div>

              {coordinates && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                  <MapPin className="size-4" />
                  <span className="text-sm font-medium">
                    {coordinates.lat}, {coordinates.lng}
                  </span>
                </div>
              )}

              {locationError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive">
                  <AlertTriangle className="size-4" />
                  <span className="text-sm">{locationError}</span>
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="location">Address / Area</FieldLabel>
                  <Input
                    id="location"
                    placeholder="Example: MG Road Junction, Sector 14"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                  <FieldDescription>
                    Enter the street name, sector, or landmark
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="landmark">Nearby Landmark (Optional)</FieldLabel>
                  <Input
                    id="landmark"
                    placeholder="Example: Near City Hospital"
                    value={formData.landmark}
                    onChange={(e) => handleInputChange("landmark", e.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" render={<Link href="/dashboard" />}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <Card className="overflow-hidden">
              <CardHeader>
                <Badge variant="outline" className="w-fit text-xs">
                  Live Preview
                </Badge>
                <CardTitle className="text-lg">
                  {formData.category ? categories.find(c => c.key === formData.category)?.label : "Issue Preview"}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {image ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageOff className="size-8" />
                      <span className="text-sm">No photo added</span>
                    </div>
                  </div>
                )}

                {priority && (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">AI Detected Priority</span>
                    <PriorityBadge priority={priority} />
                  </div>
                )}

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 text-muted-foreground" />
                    <div className="flex-1">
                      {formData.location ? (
                        <span className="text-foreground">{formData.location}</span>
                      ) : (
                        <span className="text-muted-foreground">Location not specified</span>
                      )}
                      {coordinates && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({coordinates.lat}, {coordinates.lng})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 size-4 text-muted-foreground" />
                    <p className="flex-1 text-foreground">
                      {formData.description || (
                        <span className="text-muted-foreground">No description provided</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                  Estimated reward: <span className="font-semibold text-foreground">
                    {priority === "Critical" ? "150" : priority === "High" ? "90" : priority === "Medium" ? "60" : "30"} coins
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardShell>
  )
}
