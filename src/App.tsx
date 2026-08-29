import ReportPage from "@/app/report/page"
import { LanguageProvider } from "@/hooks/use-language"

export default function App() {
  return (
    <LanguageProvider>
      <ReportPage />
    </LanguageProvider>
  )
}
