"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FileText, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import type { PerImageAnalysis } from "@/lib/image-analysis"

interface OcrCardProps {
  analysis: PerImageAnalysis
  onTextEdit: (id: string, text: string) => void
}

export function OcrCard({ analysis, onTextEdit }: OcrCardProps) {
  if (!analysis.ocr) return null

  const { status, text, confidence, error } = analysis.ocr

  const statusIcon = {
    success: <CheckCircle2 className="size-4 text-success" aria-hidden="true" />,
    no_text: <XCircle className="size-4 text-muted-foreground" aria-hidden="true" />,
    error: <AlertTriangle className="size-4 text-destructive" aria-hidden="true" />,
  }[status]

  const statusLabel = {
    success: "Text extracted",
    no_text: "No text detected",
    error: "OCR failed",
  }[status]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4 text-primary" aria-hidden="true" />
          Text Extraction (OCR)
        </CardTitle>
        <CardDescription>Text visible in the image</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusIcon}
            <span className="text-sm font-medium">{statusLabel}</span>
          </div>
          {status === "success" && (
            <Badge variant="outline">{confidence}% OCR confidence</Badge>
          )}
        </div>
        {status === "error" && error && (
          <p className="text-sm text-muted-foreground">{error}</p>
        )}
        {status === "no_text" && (
          <p className="text-sm text-muted-foreground">
            No readable text was found in this image. This is normal for many civic issue photos.
          </p>
        )}
        {status === "success" && text && (
          <Textarea
            value={text}
            onChange={(e) => onTextEdit(analysis.id, e.target.value)}
            className="min-h-20 text-sm"
            aria-label="Extracted text (editable)"
          />
        )}
        {status === "success" && text && (
          <p className="text-xs text-muted-foreground">
            Review and edit the extracted text above. This is a suggestion — verify before including in your complaint.
          </p>
        )}
      </CardContent>
    </Card>
  )
}