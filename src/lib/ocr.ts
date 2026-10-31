// ============================================================
// OCR Module (Client-side)
// Uses Tesseract.js to extract visible text from complaint photos.
// Runs entirely in the browser — no server-side calls.
// ============================================================

export interface OCRResult {
  text: string
  confidence: number
  status: "success" | "no_text" | "error"
  words: Array<{ text: string; confidence: number }>
  lines: string[]
  error?: string
}

let tesseractWorker: any = null
let workerPromise: Promise<any> | null = null

async function getWorker(): Promise<any> {
  if (tesseractWorker) return tesseractWorker
  if (workerPromise) return workerPromise

  workerPromise = (async () => {
    try {
      // Dynamically import tesseract.js to keep initial bundle small
      const Tesseract = await import("tesseract.js")
      const worker = await Tesseract.createWorker("eng", 1, {
        logger: () => {},
      })
      tesseractWorker = worker
      return worker
    } catch (err) {
      workerPromise = null
      throw new Error(`Failed to initialize OCR engine: ${(err as Error).message}`)
    }
  })()

  return workerPromise
}

export async function extractText(file: File): Promise<OCRResult> {
  try {
    const worker = await getWorker()
    const imageUrl = URL.createObjectURL(file)

    try {
      const { data } = await worker.recognize(imageUrl)

      if (!data || data.confidence < 30) {
        return {
          text: "",
          confidence: 0,
          status: "no_text",
          words: [],
          lines: [],
          error: "No readable text detected in the image",
        }
      }

      const words = (data.words || [])
        .filter((w: any) => w.text && w.text.trim().length > 0)
        .map((w: any) => ({ text: w.text.trim(), confidence: Math.round(w.confidence || 0) }))

      const lines = (data.lines || [])
        .map((l: any) => (l.text || "").trim())
        .filter((t: string) => t.length > 0)

      const text = (data.text || "").trim()

      return {
        text,
        confidence: Math.round(data.confidence || 0),
        status: text.length > 0 ? "success" : "no_text",
        words,
        lines,
      }
    } finally {
      URL.revokeObjectURL(imageUrl)
    }
  } catch (err: any) {
    return {
      text: "",
      confidence: 0,
      status: "error",
      words: [],
      lines: [],
      error: err?.message || "OCR processing failed",
    }
  }
}

export async function isOCRReady(): Promise<boolean> {
  try {
    await getWorker()
    return true
  } catch {
    return false
  }
}

export function cleanupOCR(): void {
  if (tesseractWorker) {
    tesseractWorker.terminate()
    tesseractWorker = null
    workerPromise = null
  }
}
