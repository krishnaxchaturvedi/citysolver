// ============================================================
// Image Analysis Service
// Combines vision AI classification + OCR into a unified
// per-image analysis result, and persists to the image_analysis table.
// ============================================================

import { supabase, STORAGE_BUCKET } from "@/lib/supabase/client"
import {
  analyzeImage as visionAnalyze,
  compressImage,
  computeImageHash,
  isLikelyDuplicate,
  type VisionAnalysisResult,
  type VisionError,
} from "./vision-provider"
import { extractText, type OCRResult } from "./ocr"
import type { ImageAnalysis } from "@/lib/supabase/types"

export interface PerImageAnalysis {
  id: string
  file: File
  preview: string
  hash: string
  status: "pending" | "analyzing" | "done" | "error"
  error?: string
  vision?: VisionAnalysisResult
  ocr?: OCRResult
  evidenceScore: number
  isDuplicate: boolean
  duplicateOf?: string
}

export interface CombinedAnalysisSummary {
  primaryCategory: string
  confidence: number
  allCategories: Array<{ category: string; confidence: number }>
  extractedText: string
  ocrConfidence: number
  averageEvidenceScore: number
  descriptionSuggestion: {
    title: string
    description: string
    detectedIssue: string
    visibleDamage: string
    publicImpact: string
    suggestedDepartment: string
    recommendedAction: string
  }
  warnings: string[]
}

function generateId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createImageEntry(file: File, preview: string): PerImageAnalysis {
  return {
    id: generateId(),
    file,
    preview,
    hash: "",
    status: "pending",
    evidenceScore: 0,
    isDuplicate: false,
  }
}

export async function analyzeSingleImage(
  entry: PerImageAnalysis,
  existingHashes: Array<{ id: string; hash: string }>,
  categories?: string[],
): Promise<PerImageAnalysis> {
  entry.status = "analyzing"

  try {
    // Compute hash for duplicate detection
    entry.hash = await computeImageHash(entry.file)
    for (const existing of existingHashes) {
      if (existing.hash && isLikelyDuplicate(entry.hash, existing.hash)) {
        entry.isDuplicate = true
        entry.duplicateOf = existing.id
        break
      }
    }

    // Compress and analyze with vision AI
    const compressed = await compressImage(entry.file)
    const [visionResult, ocrResult] = await Promise.all([
      visionAnalyze(compressed, categories).catch((err: VisionError) => {
        entry.error = err.message
        return null
      }),
      extractText(entry.file).catch(() => null),
    ])

    if (visionResult) {
      entry.vision = visionResult
      entry.evidenceScore = visionResult.evidence.evidenceScore || 0
    }

    if (ocrResult) {
      entry.ocr = ocrResult
    }

    // If OCR confidence is available, factor it into evidence score
    if (entry.evidenceScore === 0 && ocrResult && ocrResult.status === "success") {
      entry.evidenceScore = Math.round(ocrResult.confidence * 0.3)
    }

    entry.status = "done"
    return entry
  } catch (err: any) {
    entry.status = "error"
    entry.error = err?.message || "Analysis failed"
    return entry
  }
}

export function combineAnalyses(images: PerImageAnalysis[]): CombinedAnalysisSummary | null {
  const analyzed = images.filter(img => img.status === "done" && img.vision)
  if (analyzed.length === 0) return null

  // Primary category = highest confidence across all images
  let bestCategory = "Other Civic Issues"
  let bestConfidence = 0
  const categoryMap = new Map<string, { total: number; count: number }>()

  for (const img of analyzed) {
    if (!img.vision) continue
    const cat = img.vision.classification.detectedCategory
    const conf = img.vision.classification.confidence
    if (conf > bestConfidence) {
      bestConfidence = conf
      bestCategory = cat
    }

    const entry = categoryMap.get(cat) || { total: 0, count: 0 }
    entry.total += conf
    entry.count += 1
    categoryMap.set(cat, entry)

    for (const alt of img.vision.classification.alternativeCategories) {
      const altEntry = categoryMap.get(alt.category) || { total: 0, count: 0 }
      altEntry.total += alt.confidence * 0.5
      altEntry.count += 1
      categoryMap.set(alt.category, altEntry)
    }
  }

  const allCategories = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      confidence: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.confidence - a.confidence)

  // Combine OCR text from all images
  const allText = analyzed
    .filter(img => img.ocr && img.ocr.status === "success")
    .map(img => img.ocr!.text)
    .join("\n")
    .trim()

  const ocrConfidence = analyzed.length > 0
    ? Math.round(
        analyzed
          .filter(img => img.ocr && img.ocr.status === "success")
          .reduce((sum, img) => sum + (img.ocr!.confidence || 0), 0) /
          Math.max(1, analyzed.filter(img => img.ocr && img.ocr.status === "success").length),
      )
    : 0

  const avgEvidence = Math.round(
    analyzed.reduce((sum, img) => sum + (img.evidenceScore || 0), 0) / analyzed.length,
  )

  // Use the best vision description
  const bestVision = analyzed.find(img => img.vision?.description?.title) || analyzed[0]
  const descriptionSuggestion = bestVision?.vision?.description || {
    title: "",
    description: "",
    detectedIssue: "",
    visibleDamage: "",
    publicImpact: "",
    suggestedDepartment: "General Municipal Services",
    recommendedAction: "",
  }

  const warnings: string[] = []
  for (const img of analyzed) {
    if (img.vision?.evidence.warnings) {
      warnings.push(...img.vision.evidence.warnings)
    }
    if (img.isDuplicate) {
      warnings.push("Duplicate image detected and will be skipped.")
    }
  }

  return {
    primaryCategory: bestCategory,
    confidence: bestConfidence,
    allCategories,
    extractedText: allText,
    ocrConfidence,
    averageEvidenceScore: avgEvidence,
    descriptionSuggestion,
    warnings: [...new Set(warnings)],
  }
}

// ============ Database persistence ============

export async function uploadAndSaveAnalysis(
  complaintId: string,
  images: PerImageAnalysis[],
): Promise<{ uploadedUrls: string[]; savedAnalyses: ImageAnalysis[] }> {
  const uploadedUrls: string[] = []
  const savedAnalyses: ImageAnalysis[] = []

  for (const img of images) {
    if (img.isDuplicate) continue
    if (img.status !== "done" && img.status !== "error") continue

    // Upload to storage
    const ext = img.file.name.split(".").pop() || "jpg"
    const path = `${complaintId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, img.file, { cacheControl: "3600", upsert: false })
    if (uploadError) continue

    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    const imageUrl = pub.publicUrl
    uploadedUrls.push(imageUrl)

    // Save to complaint_images
    await supabase
      .from("complaint_images")
      .insert({ complaint_id: complaintId, image_url: imageUrl })

    // Save to image_analysis
    const analysisResult = {
      clarity: img.vision?.evidence.clarity || 0,
      brightness: img.vision?.evidence.brightness || 0,
      blur: img.vision?.evidence.blur || 0,
      visibility: img.vision?.evidence.visibility || 0,
      relevantContent: img.vision?.evidence.relevantContent || 0,
      warnings: img.vision?.evidence.warnings || [],
      explanation: img.vision?.evidence.explanation || "",
      evidence: img.vision?.classification.evidence || "",
      isRelevant: img.vision?.classification.isRelevant || false,
      ocrLines: img.ocr?.lines || [],
      ocrWords: img.ocr?.words || [],
      isDuplicate: img.isDuplicate,
    }

    const { data, error } = await supabase
      .from("image_analysis")
      .insert({
        complaint_id: complaintId,
        image_url: imageUrl,
        detected_category: img.vision?.classification.detectedCategory || null,
        confidence_score: img.vision?.classification.confidence || null,
        alternative_categories: img.vision?.classification.alternativeCategories || [],
        extracted_text: img.ocr?.text || null,
        ocr_confidence: img.ocr?.status === "success" ? img.ocr.confidence : null,
        evidence_score: img.evidenceScore || 0,
        analysis_result: analysisResult,
        model_provider: img.vision?.provider || "fallback",
      })
      .select()
      .single()

    if (!error && data) {
      savedAnalyses.push(data as ImageAnalysis)
    }
  }

  return { uploadedUrls, savedAnalyses }
}

export async function getImageAnalysis(complaintId: string): Promise<ImageAnalysis[]> {
  const { data, error } = await supabase
    .from("image_analysis")
    .select("*")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data as ImageAnalysis[]) ?? []
}
