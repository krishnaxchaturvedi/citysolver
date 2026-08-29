"use client"

import {
  Mic, MicOff, Pause, Play, Square, Languages, Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SpeechLang } from "@/hooks/use-speech-recognition"

export type RecorderState = "idle" | "recording" | "paused" | "stopped"

interface VoiceRecorderProps {
  state: RecorderState
  isListening: boolean
  isPaused: boolean
  transcript: string
  interimTranscript: string
  detectedLang: SpeechLang
  confidence: number
  error: string | null
  supported: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onReset: () => void
  onLangChange: (lang: SpeechLang) => void
}

const langLabels: Record<SpeechLang, string> = {
  "en-US": "English",
  "hi-IN": "हिन्दी (Hindi)",
  "en-IN": "Hinglish",
}

export function VoiceRecorder({
  state,
  isListening,
  isPaused,
  transcript,
  interimTranscript,
  detectedLang,
  confidence,
  error,
  supported,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onLangChange,
}: VoiceRecorderProps) {
  if (!supported) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <MicOff className="size-5 text-destructive" />
        <div>
          <p className="text-sm font-medium text-destructive">Voice not supported</p>
          <p className="text-xs text-muted-foreground">
            Your browser does not support the Web Speech API. Try Chrome or Edge.
          </p>
        </div>
      </div>
    )
  }

  const isRecording = isListening
  const showPauseResume = state === "recording" || state === "paused"

  return (
    <div className="space-y-4">
      {/* Mic button + status */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Pulse ring when recording */}
          {isRecording && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
              <span className="absolute inset-0 animate-pulse rounded-full bg-destructive/20" />
            </>
          )}
          <button
            type="button"
            onClick={isRecording ? onPause : isPaused ? onResume : onStart}
            disabled={state === "stopped"}
            className={cn(
              "relative flex size-20 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isRecording
                ? "bg-destructive text-white shadow-lg shadow-destructive/30"
                : isPaused
                  ? "bg-warning text-warning-foreground shadow-lg shadow-warning/30"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90",
            )}
            aria-label={isRecording ? "Pause recording" : isPaused ? "Resume recording" : "Start recording"}
          >
            {isRecording ? (
              <Pause className="size-8" />
            ) : isPaused ? (
              <Play className="size-8" />
            ) : (
              <Mic className="size-8" />
            )}
          </button>
        </div>

        {/* Status text */}
        <div className="text-center">
          {state === "idle" && (
            <p className="text-sm text-muted-foreground">Tap the microphone to start speaking</p>
          )}
          {isRecording && (
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <span className="size-2 animate-pulse rounded-full bg-destructive" />
              Recording... Tap to pause
            </p>
          )}
          {isPaused && (
            <p className="text-sm font-medium text-warning-foreground">Paused — tap to resume</p>
          )}
          {state === "stopped" && transcript && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-success">
              <Check className="size-4" /> Recording complete
            </p>
          )}
        </div>

        {/* Control buttons */}
        {showPauseResume && (
          <div className="flex gap-2">
            {isRecording && (
              <Button type="button" variant="outline" size="sm" onClick={onPause}>
                <Pause className="mr-1.5 size-4" /> Pause
              </Button>
            )}
            {isPaused && (
              <Button type="button" variant="outline" size="sm" onClick={onResume}>
                <Play className="mr-1.5 size-4" /> Resume
              </Button>
            )}
            <Button type="button" variant="destructive" size="sm" onClick={onStop}>
              <Square className="mr-1.5 size-4" /> Stop & Analyze
            </Button>
          </div>
        )}

        {state === "stopped" && transcript && (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            <Mic className="mr-1.5 size-4" /> Record Again
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Language selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Languages className="size-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Language</span>
          {state !== "idle" && state !== "stopped" && (
            <Badge variant="secondary" className="text-xs">
              Auto-detected: {langLabels[detectedLang]}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {(Object.keys(langLabels) as SpeechLang[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onLangChange(lang)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                detectedLang === lang
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {langLabels[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Live transcript */}
      {(transcript || interimTranscript) && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Live Transcript</span>
          <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3 text-sm leading-relaxed">
            <span className="text-foreground">{transcript}</span>
            {interimTranscript && (
              <span className="text-muted-foreground italic"> {interimTranscript}</span>
            )}
            {isListening && (
              <span className="ml-1 inline-block size-3 animate-pulse rounded-full bg-primary align-middle" />
            )}
          </div>
          {confidence > 0 && (
            <p className="text-xs text-muted-foreground">
              Recognition confidence: {Math.round(confidence * 100)}%
            </p>
          )}
        </div>
      )}
    </div>
  )
}
