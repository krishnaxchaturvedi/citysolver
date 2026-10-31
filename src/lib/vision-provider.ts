// ============================================================
// Vision LLM Provider (Client-side)
// Calls the ai-vision Supabase Edge Function for image analysis.
// API keys stay server-side — never exposed to the browser.
// Falls back gracefully when no vision provider is configured.
// ============================================================

export interface ClassificationResult {
  detectedCategory: string
  confidence: number
  alternativeCategories: Array<{ category: string; confidence: number }>
  evidence: string
  isRelevant: boolean
  warnings: string[]
}

export interface EvidenceAnalysis {
  clarity: number
  brightness: number
  blur: number
  visibility: number
  relevantContent: number
  evidenceScore: number
  classificationConfidence: number
  ocrConfidence: number
  warnings: string[]
  explanation: string
}

export interface DescriptionSuggestion {
  title: string
  description: string
  detectedIssue: string
  visibleDamage: string
  publicImpact: string
  suggestedDepartment: string
  recommendedAction: string
}

export interface VisionAnalysisResult {
  classification: ClassificationResult
  evidence: EvidenceAnalysis
  description: DescriptionSuggestion
  provider: string
}

export type VisionProvider = "openai" | "gemini" | "fallback"

export interface VisionError {
  type: "missing_key" | "timeout" | "rate_limit" | "network" | "invalid_response" | "empty_response" | "file_too_large" | "invalid_format"
  message: string
}

const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB
const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function getEdgeFunctionUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
  return `${supabaseUrl}/functions/v1/ai-vision`
}

function getAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || ""
}

let cachedProvider: VisionProvider | null = null

export async function getVisionProvider(): Promise<VisionProvider> {
  if (cachedProvider) return cachedProvider
  try {
    const res = await fetch(`${getEdgeFunctionUrl()}/status`, {
      headers: { Authorization: `Bearer ${getAnonKey()}` },
    })
    if (res.ok) {
      const data = await res.json()
      cachedProvider = (data.provider as VisionProvider) || "fallback"
    } else {
      cachedProvider = "fallback"
    }
  } catch {
    cachedProvider = "fallback"
  }
  return cachedProvider!
}

export async function hasVisionAI(): Promise<boolean> {
  const provider = await getVisionProvider()
  return provider !== "fallback"
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

export function validateImageFile(file: File): VisionError | null {
  if (!VALID_MIME_TYPES.includes(file.type)) {
    return { type: "invalid_format", message: `Unsupported format: ${file.type}. Use JPEG, PNG, WebP, or GIF.` }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { type: "file_too_large", message: `Image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum is 10MB.` }
  }
  return null
}

export async function analyzeImage(
  file: File,
  categories?: string[],
): Promise<VisionAnalysisResult> {
  const validationError = validateImageFile(file)
  if (validationError) throw validationError

  const dataUrl = await fileToDataUrl(file)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const res = await fetch(getEdgeFunctionUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAnonKey()}`,
      },
      body: JSON.stringify({
        image: dataUrl,
        mimeType: file.type,
        categories,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (res.status === 429) {
      throw { type: "rate_limit", message: "Rate limit exceeded. Please wait and try again." } as VisionError
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw { type: "invalid_response", message: `Error ${res.status}: ${body.slice(0, 200)}` } as VisionError
    }

    const data = await res.json()
    if (data.provider === "fallback" || !data.classification) {
      throw { type: "empty_response", message: "Vision AI not available" } as VisionError
    }

    return data as VisionAnalysisResult
  } catch (err: any) {
    clearTimeout(timeout)
    if (err?.name === "AbortError") {
      throw { type: "timeout", message: "Image analysis timed out" } as VisionError
    }
    if (err?.type) throw err
    throw { type: "network", message: `Network error: ${err?.message || "unknown"}` } as VisionError
  }
}

// Image compression for large uploads (reduces file size before sending to vision API)
export async function compressImage(file: File, maxWidth = 1280, quality = 0.7): Promise<File> {
  if (file.size <= 2 * 1024 * 1024) return file // Skip compression for small files

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(file)
          return
        }
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressed = new File([blob], file.name, { type: file.type })
              resolve(compressed)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality,
        )
      }
      img.onerror = () => resolve(file)
      img.src = reader.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}

// Detect duplicate images by comparing perceptual hashes (simplified)
export async function computeImageHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        canvas.width = 8
        canvas.height = 8
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve("")
          return
        }
        ctx.drawImage(img, 0, 0, 8, 8)
        const data = ctx.getImageData(0, 0, 8, 8).data
        let hash = ""
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          hash += avg > 128 ? "1" : "0"
        }
        resolve(hash)
      }
      img.onerror = () => resolve("")
      img.src = reader.result as string
    }
    reader.onerror = () => resolve("")
    reader.readAsDataURL(file)
  })
}

export function hammingDistance(a: string, b: string): number {
  if (!a || !b || a.length !== b.length) return 64
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++
  }
  return dist
}

export function isLikelyDuplicate(hash1: string, hash2: string, threshold = 5): boolean {
  if (!hash1 || !hash2) return false
  return hammingDistance(hash1, hash2) <= threshold
}
