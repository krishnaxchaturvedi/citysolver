// ============================================================
// LLM Provider Abstraction (Client-side)
// Calls a Supabase Edge Function that proxies to OpenAI/Gemini.
// API keys stay server-side — never exposed to the browser.
// Falls back to deterministic engine when unavailable.
// ============================================================

export type LLMProvider = "openai" | "gemini" | "fallback"

export interface LLMMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface LLMRequest {
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
}

export interface LLMResponse {
  text: string
  provider: LLMProvider
  usage?: { promptTokens?: number; completionTokens?: number }
}

export interface LLMError {
  type: "missing_key" | "timeout" | "rate_limit" | "network" | "invalid_response" | "empty_response"
  message: string
}

function getEdgeFunctionUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
  return `${supabaseUrl}/functions/v1/ai-chat`
}

function getAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || ""
}

let cachedProvider: LLMProvider | null = null

export async function getProvider(): Promise<LLMProvider> {
  if (cachedProvider) return cachedProvider
  try {
    const res = await fetch(`${getEdgeFunctionUrl()}/status`, {
      headers: { Authorization: `Bearer ${getAnonKey()}` },
    })
    if (res.ok) {
      const data = await res.json()
      cachedProvider = (data.provider as LLMProvider) || "fallback"
    } else {
      cachedProvider = "fallback"
    }
  } catch {
    cachedProvider = "fallback"
  }
  return cachedProvider!
}

export async function hasLLM(): Promise<boolean> {
  const provider = await getProvider()
  return provider !== "fallback"
}

export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(getEdgeFunctionUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAnonKey()}`,
      },
      body: JSON.stringify({
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        maxTokens: req.maxTokens ?? 800,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (res.status === 429) {
      throw { type: "rate_limit", message: "Rate limit exceeded" } as LLMError
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw { type: "invalid_response", message: `Error ${res.status}: ${body.slice(0, 200)}` } as LLMError
    }

    const data = await res.json()
    if (data.provider === "fallback" || !data.text) {
      throw { type: "empty_response", message: "LLM not available" } as LLMError
    }

    return {
      text: data.text.trim(),
      provider: data.provider || "fallback",
      usage: data.usage,
    }
  } catch (err: any) {
    clearTimeout(timeout)
    if (err?.name === "AbortError") {
      throw { type: "timeout", message: "Request timed out" } as LLMError
    }
    if (err?.type) throw err
    throw { type: "network", message: `Network error: ${err?.message || "unknown"}` } as LLMError
  }
}

export async function callLLMWithFallback(
  messages: LLMMessage[],
  fallbackFn: () => string,
): Promise<LLMResponse> {
  try {
    return await callLLM({ messages })
  } catch {
    return { text: fallbackFn(), provider: "fallback" }
  }
}
