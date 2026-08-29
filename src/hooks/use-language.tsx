import * as React from "react"
import { translations, translate, type LanguageCode, type TranslationKey } from "@/lib/i18n"

interface LanguageContextValue {
  lang: LanguageCode
  setLang: (lang: LanguageCode) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = "citysolver-lang"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<LanguageCode>("en")

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null
      if (stored && translations[stored]) {
        setLangState(stored)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  const setLang = React.useCallback((code: LanguageCode) => {
    setLangState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      // noop
    }
  }, [])

  const t = React.useCallback(
    (key: TranslationKey) => translate(lang, key),
    [lang],
  )

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
