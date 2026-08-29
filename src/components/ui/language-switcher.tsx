"use client"

import * as React from "react"
import { Globe, Check, ChevronDown } from "lucide-react"
import { languages, type LanguageCode } from "@/lib/i18n"
import { useLanguage } from "@/hooks/use-language"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const current = languages.find((l) => l.code === lang) || languages[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact && "px-2 py-1.5",
        )}
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe className="size-4 text-muted-foreground" />
        <span>{current.nativeLabel}</span>
        <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="max-h-64 overflow-y-auto p-1">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLang(l.code as LanguageCode)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                  lang === l.code ? "bg-primary/10 text-primary" : "text-foreground",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex size-6 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                    {l.flag}
                  </span>
                  <div>
                    <p className="font-medium">{l.nativeLabel}</p>
                    <p className="text-xs text-muted-foreground">{l.label}</p>
                  </div>
                </div>
                {lang === l.code && <Check className="size-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
