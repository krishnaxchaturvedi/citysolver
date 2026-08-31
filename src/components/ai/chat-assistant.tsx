"use client"

import * as React from "react"
import { Sparkles, Send, X, Trash2, Loader as Loader2, CircleAlert as AlertCircle, MessageCircle, User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  type ChatMessage,
  sendChatMessage,
  getSuggestedQuestions,
} from "@/lib/llm/chat"
import type { ChatContext } from "@/lib/llm/context"

interface ChatAssistantProps {
  context: ChatContext | null
}

export function ChatAssistant({ context }: ChatAssistantProps) {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const role = context?.role || "citizen"
  const suggestions = React.useMemo(() => getSuggestedQuestions(role), [role])

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleSend = React.useCallback(
    async (text?: string) => {
      const content = (text || input).trim()
      if (!content || loading) return

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setLoading(true)
      setError(null)

      try {
        if (!context) {
          throw new Error("No context available")
        }
        const response = await sendChatMessage(content, context, [...messages, userMsg])
        setMessages((prev) => [...prev, response.message])
      } catch (err) {
        const errMsg: ChatMessage = {
          id: `msg-${Date.now()}-e`,
          role: "assistant",
          content: "I'm having trouble responding right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
          error: true,
        }
        setMessages((prev) => [...prev, errMsg])
        setError("Failed to get response")
      } finally {
        setLoading(false)
      }
    },
    [input, loading, context, messages],
  )

  const handleClear = React.useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    },
    [handleSend],
  )

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "rotate-180",
        )}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          role="dialog"
          aria-label="AI Chat Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">CitySolver AI</p>
                <p className="text-xs text-muted-foreground">
                  {context ? `${role.charAt(0).toUpperCase() + role.slice(1)} Assistant` : "Loading..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleClear}
                  aria-label="Clear conversation"
                  title="Clear conversation"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="size-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ask me anything about your complaints</p>
                  <p className="text-xs text-muted-foreground">I can help with status, priority, timelines, and more</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="size-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.error
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-muted/40 text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <User className="size-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-muted/40 px-4 py-3">
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => handleSend()} className="ml-auto">
                  Retry
                </Button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                aria-label="Chat message input"
              />
              <Button
                type="button"
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
