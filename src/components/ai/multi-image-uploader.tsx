"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, RotateCw, Copy, AlertTriangle, ImageOff, Loader2 } from "lucide-react"
import type { PerImageAnalysis } from "@/lib/image-analysis"
import { validateImageFile } from "@/lib/vision-provider"
import { cn } from "@/lib/utils"

interface MultiImageUploaderProps {
  images: PerImageAnalysis[]
  onAddImage: (file: File) => void
  onRemoveImage: (id: string) => void
  onRetry: (id: string) => void
  maxImages?: number
}

export function MultiImageUploader({
  images,
  onAddImage,
  onRemoveImage,
  onRetry,
  maxImages = 5,
}: MultiImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)

  const handleFiles = React.useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return
    const remaining = maxImages - images.length
    if (remaining <= 0) return
    const toAdd = Array.from(files).slice(0, remaining)
    for (const file of toAdd) {
      const error = validateImageFile(file)
      if (error) continue
      onAddImage(file)
    }
  }, [images.length, maxImages, onAddImage])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo Evidence</CardTitle>
        <CardDescription>
          Upload up to {maxImages} photos. AI will analyze each image automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload zone */}
        {images.length < maxImages && (
          <div
            className={cn(
              "flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors",
              dragOver ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <ImageOff className="size-8 text-muted-foreground" aria-hidden="true" />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload images"
            >
              <Upload className="mr-2 size-4" aria-hidden="true" />
              Upload {images.length > 0 ? "More" : ""} Images
            </Button>
            <p className="text-xs text-muted-foreground">Or drag and drop — JPEG, PNG, WebP (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              aria-label="File upload"
            />
          </div>
        )}

        {/* Image previews grid */}
        {images.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl border border-border"
              >
                <div className="relative aspect-video bg-muted">
                  <img
                    src={img.preview}
                    alt={`Evidence ${img.id}`}
                    className="size-full object-cover"
                  />
                  {/* Status overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    {img.status === "pending" && (
                      <span className="text-xs text-white/80">Queued...</span>
                    )}
                    {img.status === "analyzing" && (
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        Analyzing...
                      </div>
                    )}
                    {img.status === "error" && (
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
                        <span className="text-xs text-white">Analysis failed</span>
                      </div>
                    )}
                    {img.status === "done" && (
                      <div className="flex items-center gap-2 text-sm text-white">
                        <span className="rounded-full bg-success/80 px-2 py-0.5 text-xs font-medium">
                          {img.evidenceScore > 0 ? `${img.evidenceScore}/100` : "Done"}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Remove button */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="absolute right-2 top-2 opacity-90"
                    onClick={() => onRemoveImage(img.id)}
                    aria-label={`Remove image ${images.indexOf(img) + 1}`}
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                  {/* Duplicate badge */}
                  {img.isDuplicate && (
                    <div className="absolute left-2 bottom-2 flex items-center gap-1 rounded-full bg-warning/90 px-2 py-0.5 text-xs text-warning-foreground">
                      <Copy className="size-3" aria-hidden="true" /> Duplicate
                    </div>
                  )}
                  {/* Retry button */}
                  {img.status === "error" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 bg-background/90"
                      onClick={() => onRetry(img.id)}
                      aria-label="Retry analysis"
                    >
                      <RotateCw className="mr-1 size-3" aria-hidden="true" /> Retry
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {images.length} of {maxImages} images uploaded · {images.filter(i => i.status === "done").length} analyzed
          </p>
        )}
      </CardContent>
    </Card>
  )
}