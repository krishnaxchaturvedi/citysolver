"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Check, Edit3, Building2, Wrench } from "lucide-react"
import type { CombinedAnalysisSummary } from "@/lib/image-analysis"

interface DescriptionGeneratorCardProps {
  summary: CombinedAnalysisSummary | null
  onAccept: (data: { title: string; description: string; category: string }) => void
  accepted: boolean
}

export function DescriptionGeneratorCard({ summary, onAccept, accepted }: DescriptionGeneratorCardProps) {
  const [editing, setEditing] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("")

  React.useEffect(() => {
    if (summary) {
      setTitle(summary.descriptionSuggestion.title || "")
      setDescription(summary.descriptionSuggestion.description || "")
      setCategory(summary.primaryCategory || "")
    }
  }, [summary])

  if (!summary) return null

  const handleAccept = () => {
    onAccept({ title, description, category })
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          AI Complaint Description
        </CardTitle>
        <CardDescription>Generated from image analysis — review and edit before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs font-medium">Detected Issue</Label>
          <div className="flex items-center gap-2">
            <Badge variant="default">{summary.primaryCategory}</Badge>
            <span className="text-xs text-muted-foreground">{summary.confidence}% confidence</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-title" className="text-xs font-medium">Suggested Title</Label>
          <Input
            id="ai-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!editing && accepted}
            placeholder="AI-generated title"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-description" className="text-xs font-medium">Suggested Description</Label>
          <Textarea
            id="ai-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!editing && accepted}
            placeholder="AI-generated description"
            className="min-h-28 text-sm"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">{description.length}/500</p>
        </div>

        {summary.descriptionSuggestion.visibleDamage && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">Visible Damage</Label>
            <p className="text-sm text-muted-foreground">{summary.descriptionSuggestion.visibleDamage}</p>
          </div>
        )}

        {summary.descriptionSuggestion.publicImpact && (
          <div className="space-y-1">
            <Label className="text-xs font-medium">Potential Public Impact</Label>
            <p className="text-sm text-muted-foreground">{summary.descriptionSuggestion.publicImpact}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summary.descriptionSuggestion.suggestedDepartment && (
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Building2 className="size-3" aria-hidden="true" /> Suggested Department
              </Label>
              <p className="text-sm text-muted-foreground">{summary.descriptionSuggestion.suggestedDepartment}</p>
            </div>
          )}
          {summary.descriptionSuggestion.recommendedAction && (
            <div className="space-y-1">
              <Label className="text-xs font-medium flex items-center gap-1">
                <Wrench className="size-3" aria-hidden="true" /> Recommended Action
              </Label>
              <p className="text-sm text-muted-foreground">{summary.descriptionSuggestion.recommendedAction}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {accepted ? (
            <>
              <div className="flex items-center gap-2 text-sm text-success flex-1">
                <Check className="size-4" aria-hidden="true" />
                Description accepted
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit3 className="mr-1 size-3" aria-hidden="true" /> Edit
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                <Edit3 className="mr-1 size-3" aria-hidden="true" />
                {editing ? "Preview" : "Edit"}
              </Button>
              <Button type="button" size="sm" onClick={handleAccept} disabled={!title || !description}>
                <Check className="mr-1 size-3" aria-hidden="true" /> Accept & Use
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground italic">
          You must review and approve this description. Nothing is submitted without your confirmation.
        </p>
      </CardContent>
    </Card>
  )
}