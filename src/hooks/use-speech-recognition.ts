import * as React from "react"

// ============================================================
// useSpeechRecognition — Web Speech API hook
// Supports start, pause (stop), resume, stop lifecycle.
// Auto-detects language (en-US, hi-IN, or Hinglish fallback).
// ============================================================

export type SpeechLang = "en-US" | "hi-IN" | "en-IN"

export interface SpeechRecognitionResult {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isPaused: boolean
  error: string | null
  detectedLang: SpeechLang
  confidence: number
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
  setLang: (lang: SpeechLang) => void
  supported: boolean
}

// Minimal type declarations for the Web Speech API (not in standard TS DOM lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResultItem
  [index: number]: SpeechRecognitionResultItem
}

interface SpeechRecognitionResultItem {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

// Detect if text contains Hindi (Devanagari) or Hinglish (romanized Hindi)
export function detectLanguage(text: string): SpeechLang {
  // Devanagari range: U+0900–U+097F
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"

  const lower = text.toLowerCase()
  // Common Hinglish / romanized Hindi words
  const hinglishWords = [
    "sadak", "raasta", "raaste", "paani", "paani", "kachra", "kooda",
    "nali", "naali", "bijli", "light", "pipe", "toota", "tooti", "phata",
    "ganda", "gandi", "samasya", "problem", "sarkari", "nagar", "marg",
    "raasta", "chauraha", "mandir", "school", "hospital", "market",
    "bheja", "kharab", "thik", "jaldi", "abhi", "bahut", "thoda",
    "mera", "tera", "hamara", "yaha", "waha", "kaha", "kyun",
  ]
  const words = lower.split(/\s+/)
  const hinglishHits = words.filter((w) => hinglishWords.includes(w.replace(/[^a-z]/g, "")))
  if (hinglishHits.length >= 2) return "en-IN" // Hinglish — use Indian English recognizer

  return "en-US"
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [transcript, setTranscript] = React.useState("")
  const [interimTranscript, setInterimTranscript] = React.useState("")
  const [isListening, setIsListening] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [detectedLang, setDetectedLang] = React.useState<SpeechLang>("en-US")
  const [confidence, setConfidence] = React.useState(0)
  const [manualLang, setManualLang] = React.useState<SpeechLang | null>(null)

  const recognitionRef = React.useRef<ISpeechRecognition | null>(null)
  const finalTranscriptRef = React.useRef("")
  const shouldResumeRef = React.useRef(false)
  const SpeechRecognitionCtor = React.useMemo(() => getSpeechRecognition(), [])

  const supported = SpeechRecognitionCtor !== null

  const createRecognition = React.useCallback((lang: SpeechLang) => {
    if (!SpeechRecognitionCtor) return null
    const rec = new SpeechRecognitionCtor()
    rec.lang = lang
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      let finalChunk = ""
      let lastConfidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const alt = result[0]
        if (result.isFinal) {
          finalChunk += alt.transcript + " "
          lastConfidence = alt.confidence
        } else {
          interim += alt.transcript
        }
      }

      if (finalChunk) {
        finalTranscriptRef.current += finalChunk
        setTranscript(finalTranscriptRef.current.trim())
        setConfidence(lastConfidence)

        // Auto-detect language from accumulated transcript if not manually set
        if (!manualLang && finalTranscriptRef.current.length > 10) {
          const detected = detectLanguage(finalTranscriptRef.current)
          if (detected !== detectedLang) {
            setDetectedLang(detected)
          }
        }
      }
      setInterimTranscript(interim)
    }

    rec.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech" || event.error === "aborted") return
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access denied. Please allow microphone permissions.")
        setIsListening(false)
        setIsPaused(false)
      } else {
        setError(event.error)
      }
    }

    rec.onend = () => {
      // If we were told to resume (pause was toggled), restart
      if (shouldResumeRef.current) {
        shouldResumeRef.current = false
        try {
          rec.start()
        } catch {
          // Already started or errored
        }
      } else {
        setIsListening(false)
        setIsPaused(false)
      }
    }

    rec.onstart = () => {
      setIsListening(true)
      setIsPaused(false)
      setError(null)
    }

    return rec
  }, [SpeechRecognitionCtor, manualLang, detectedLang])

  const start = React.useCallback(() => {
    if (!SpeechRecognitionCtor) {
      setError("Speech recognition is not supported in this browser.")
      return
    }
    setError(null)
    finalTranscriptRef.current = ""
    setTranscript("")
    setInterimTranscript("")
    setConfidence(0)

    const lang = manualLang || detectedLang
    const rec = createRecognition(lang)
    if (!rec) return
    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      setError("Failed to start speech recognition.")
    }
  }, [SpeechRecognitionCtor, manualLang, detectedLang, createRecognition])

  const pause = React.useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    shouldResumeRef.current = true
    try {
      rec.stop()
    } catch {
      // Already stopped
    }
    setIsListening(false)
    setIsPaused(true)
  }, [])

  const resume = React.useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) {
      // Restart fresh if recognition was fully stopped
      const lang = manualLang || detectedLang
      const newRec = createRecognition(lang)
      if (!newRec) return
      recognitionRef.current = newRec
      try {
        newRec.start()
      } catch {
        setError("Failed to resume speech recognition.")
      }
      return
    }
    shouldResumeRef.current = false
    try {
      rec.start()
    } catch {
      // If already started, try aborting first
      try {
        rec.abort()
      } catch {
        // noop
      }
    }
  }, [createRecognition, manualLang, detectedLang])

  const stop = React.useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    shouldResumeRef.current = false
    try {
      rec.stop()
    } catch {
      // Already stopped
    }
    setIsListening(false)
    setIsPaused(false)
  }, [])

  const reset = React.useCallback(() => {
    finalTranscriptRef.current = ""
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    setConfidence(0)
    setIsListening(false)
    setIsPaused(false)
  }, [])

  const setLang = React.useCallback((lang: SpeechLang) => {
    setManualLang(lang)
    setDetectedLang(lang)
  }, [])

  React.useEffect(() => {
    return () => {
      const rec = recognitionRef.current
      if (rec) {
        shouldResumeRef.current = false
        try {
          rec.abort()
        } catch {
          // noop
        }
      }
    }
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    isPaused,
    error,
    detectedLang,
    confidence,
    start,
    pause,
    resume,
    stop,
    reset,
    setLang,
    supported,
  }
}
