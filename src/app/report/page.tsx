"use client"

import * as React from "react"
import { Mic, Upload, X, MapPin, Crosshair, ImageOff, Loader as Loader2, CircleCheck as CheckCircle2, Volume2, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { categories, priorityMeta, type CategoryKey, type Priority } from "@/lib/data"
import { useSpeechRecognition, type SpeechLang } from "@/hooks/use-speech-recognition"
import { analyzeSpeech, type SpeechAnalysisResult } from "@/lib/speech-analysis"
import { VoiceRecorder, type RecorderState } from "@/components/report/voice-recorder"
import { SpeechAnalysisCard } from "@/components/report/speech-analysis-card"
import { AIAssistantSidebar } from "@/components/ai/ai-assistant-sidebar"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/hooks/use-language"
import { analyzeIntake, type IntakeAnalysisResult } from "@/lib/ai-intake"
import type { TranslationKey } from "@/lib/i18n"

export default function ReportPage() {
  const { t } = useLanguage()
  const [category, setCategory] = React.useState<CategoryKey | "">("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [priority, setPriority] = React.useState<Priority | "">("")
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [hasImage, setHasImage] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [locating, setLocating] = React.useState(false)
  const [coords, setCoords] = React.useState<string | null>(null)
  const [speechAnalysis, setSpeechAnalysis] = React.useState<SpeechAnalysisResult | null>(null)
  const [analysisApplied, setAnalysisApplied] = React.useState(false)
  const [showVoicePanel, setShowVoicePanel] = React.useState(false)
  const [intakeResult, setIntakeResult] = React.useState<IntakeAnalysisResult | null>(null)
  const [intakeLoading, setIntakeLoading] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const speech = useSpeechRecognition()

  const recorderState: RecorderState = React.useMemo(() => {
    if (speech.isListening) return "recording"
    if (speech.isPaused) return "paused"
    if (speech.transcript) return "stopped"
    return "idle"
  }, [speech.isListening, speech.isPaused, speech.transcript])

  // Run AI intake analysis when form data changes
  React.useEffect(() => {
    if (!category && !description && !location) {
      setIntakeResult(null)
      return
    }
    setIntakeLoading(true)
    const timer = setTimeout(() => {
      const result = analyzeIntake({
        category,
        description,
        location,
        hasCoords: !!coords,
        hasImage,
        priority,
      })
      setIntakeResult(result)
      setIntakeLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [category, description, location, coords, hasImage, priority])

  // When recording stops, run speech analysis
  React.useEffect(() => {
    if (recorderState === "stopped" && speech.transcript && !speechAnalysis) {
      const result = analyzeSpeech(speech.transcript)
      setSpeechAnalysis(result)
    }
  }, [recorderState, speech.transcript, speechAnalysis])

  const handleApplyAnalysis = React.useCallback(() => {
    if (!speechAnalysis) return
    setCategory(speechAnalysis.category)
    setTitle(speechAnalysis.title)
    setDescription(speechAnalysis.description)
    setPriority(speechAnalysis.priority)
    setAnalysisApplied(true)
  }, [speechAnalysis])

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) return
    setHasImage(true)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const removeImage = React.useCallback(() => {
    setImagePreview(null)
    setHasImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const detectLocation = React.useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        setCoords(c)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
  }, [])

  const handleStartVoice = React.useCallback(() => {
    setShowVoicePanel(true)
    setSpeechAnalysis(null)
    setAnalysisApplied(false)
    speech.start()
  }, [speech])

  const handleStopVoice = React.useCallback(() => { speech.stop() }, [speech])
  const handleResetVoice = React.useCallback(() => {
    speech.reset()
    setSpeechAnalysis(null)
    setAnalysisApplied(false)
  }, [speech])
  const handleLangChange = React.useCallback((lang: SpeechLang) => { speech.setLang(lang) }, [speech])

  const isValid = category !== "" && title.length >= 5 && description.length >= 20 && location.length >= 3

  const catKey = (key: CategoryKey): TranslationKey => `cat.${key}` as TranslationKey
  const priKey = (p: Priority): TranslationKey => `pri.${p}` as TranslationKey

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-bold">CitySolver</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <Badge variant="outline" className="text-xs">Citizen Portal</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("report.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("report.description")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voice input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="size-5 text-primary" />
                  {t("report.voice_complaint")}
                </CardTitle>
                <CardDescription>{t("report.speak_complaint")}</CardDescription>
              </CardHeader>
              <CardContent>
                {!showVoicePanel ? (
                  <button
                    type="button"
                    onClick={handleStartVoice}
                    className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 transition-colors hover:border-primary/50 hover:bg-primary/10"
                  >
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/15">
                      <Mic className="size-7 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{t("report.tap_to_start")}</p>
                      <p className="text-xs text-muted-foreground">{t("report.supports_languages")}</p>
                    </div>
                  </button>
                ) : (
                  <VoiceRecorder
                    state={recorderState}
                    isListening={speech.isListening}
                    isPaused={speech.isPaused}
                    transcript={speech.transcript}
                    interimTranscript={speech.interimTranscript}
                    detectedLang={speech.detectedLang}
                    confidence={speech.confidence}
                    error={speech.error}
                    supported={speech.supported}
                    onStart={handleStartVoice}
                    onPause={speech.pause}
                    onResume={speech.resume}
                    onStop={handleStopVoice}
                    onReset={handleResetVoice}
                    onLangChange={handleLangChange}
                  />
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>{t("report.category")}</CardTitle>
                <CardDescription>{t("report.issue_category")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categories.map((cat) => {
                    const selected = category === cat.key
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all",
                          selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="text-sm font-medium">{t(catKey(cat.key))}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>{t("report.title")}</CardTitle>
                <CardDescription>A short summary of the issue</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g. Large pothole near MG Road junction"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">{title.length}/80</p>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>{t("report.describe_issue")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  className="min-h-32"
                />
                <div className={cn("mt-2 flex items-center justify-between text-xs", description.length >= 20 ? "text-success" : "text-muted-foreground")}>
                  <span>{description.length >= 20 ? <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> {t("report.min_reached")}</span> : `${description.length}/20 ${t("report.min_required")}`}</span>
                  <span className="text-muted-foreground">{description.length}/500</span>
                </div>
              </CardContent>
            </Card>

            {/* Priority */}
            <Card>
              <CardHeader>
                <CardTitle>{t("report.priority")}</CardTitle>
                <CardDescription>How urgent is this issue?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(priorityMeta) as Priority[]).map((p) => {
                    const selected = priority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={cn(
                          "rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all",
                          selected ? cn("border-primary", priorityMeta[p].badge) : "border-border hover:border-primary/40",
                        )}
                      >
                        {t(priKey(p))}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Photo */}
            <Card>
              <CardHeader><CardTitle>{t("report.photo")}</CardTitle></CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    <img src={imagePreview} alt="Evidence preview" className="size-full object-cover" />
                    <Button type="button" variant="destructive" size="icon-sm" className="absolute right-2 top-2" onClick={removeImage}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border">
                    <ImageOff className="size-8 text-muted-foreground" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 size-4" />{t("report.upload_image")}
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader><CardTitle>{t("report.location")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button type="button" variant="outline" onClick={detectLocation} disabled={locating}>
                  {locating ? <><Loader2 className="mr-2 size-4 animate-spin" />{t("report.detecting")}</> : <><Crosshair className="mr-2 size-4" />{t("report.auto_detect")}</>}
                </Button>
                {coords && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                    <MapPin className="size-4" />
                    <span className="text-sm font-medium">{coords}</span>
                  </div>
                )}
                <Input placeholder={t("report.address_area")} value={location} onChange={(e) => setLocation(e.target.value)} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={submitting || !isValid}>
                {submitting ? <><Loader2 className="mr-2 size-4 animate-spin" />{t("report.submitting")}</> : t("report.submit")}
              </Button>
            </div>
          </form>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
            {/* AI Speech Analysis */}
            {speechAnalysis && (
              <SpeechAnalysisCard
                result={speechAnalysis}
                applied={analysisApplied}
                onApply={handleApplyAnalysis}
              />
            )}

            {/* AI Intake Assistant */}
            <AIAssistantSidebar result={intakeResult} loading={intakeLoading} />

            {/* Voice status placeholder */}
            {!speechAnalysis && showVoicePanel && recorderState !== "idle" && (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <Loader2 className="size-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {recorderState === "recording" ? "Recording..." : recorderState === "paused" ? "Paused" : "Analyzing..."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
