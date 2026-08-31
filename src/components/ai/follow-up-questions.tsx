"use client"

import * as React from "react"
import { Circle as HelpCircle, Plus, X, Loader as Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { generateFollowUpQuestions, type SmartFollowUp } from "@/lib/llm/follow-ups"
import type { CategoryKey } from "@/lib/data"

interface FollowUpQuestionsProps {
  category: CategoryKey | ""
  description: string
  location: string
  hasImage: boolean
  onAnswer: (question: SmartFollowUp, answer: string) => void
}

export function FollowUpQuestions({
  category,
  description,
  location,
  hasImage,
  onAnswer,
}: FollowUpQuestionsProps) {
  const [questions, setQuestions] = React.useState<SmartFollowUp[]>([])
  const [loading, setLoading] = React.useState(false)
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [answers, setAnswers] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!category && !description) {
      setQuestions([])
      return
    }
    setLoading(true)
    const timer = setTimeout(() => {
      generateFollowUpQuestions({ category, description, location, hasImage })
        .then((qs) => {
          setQuestions(qs)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }, 800)
    return () => clearTimeout(timer)
  }, [category, description, location, hasImage])

  const handleAnswer = React.useCallback(
    (q: SmartFollowUp) => {
      const answer = answers[q.id]
      if (!answer?.trim()) return
      onAnswer(q, answer.trim())
      setExpanded((prev) => ({ ...prev, [q.id]: false }))
      setAnswers((prev) => ({ ...prev, [q.id]: "" }))
      setQuestions((prev) => prev.filter((item) => item.id !== q.id))
    },
    [answers, onAnswer],
  )

  if (loading && questions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center gap-2 p-4">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Detecting missing information...</span>
        </CardContent>
      </Card>
    )
  }

  if (questions.length === 0) return null

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <HelpCircle className="size-4 text-primary" />
          Smart Follow-up Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {questions.map((q) => (
          <div key={q.id} className="rounded-lg border border-border bg-muted/20 p-2.5">
            {expanded[q.id] ? (
              <div className="space-y-2">
                <p className="text-xs font-medium">{q.question}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAnswer(q)
                    }}
                    placeholder="Type your answer..."
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAnswer(q)}
                    disabled={!answers[q.id]?.trim()}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: false }))}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: true }))}
                className="flex w-full items-center gap-2 text-left"
              >
                <Plus className="size-3.5 shrink-0 text-primary" />
                <span className="text-xs text-foreground">{q.question}</span>
                <span className="ml-auto text-xs text-muted-foreground">{q.field}</span>
              </button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
