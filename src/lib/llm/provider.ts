// ============================================================
// LLM Provider Abstraction
// Supports OpenAI and Google Gemini via environment variables.
// Falls back to deterministic engine when no API key is set.
// Server-side only — never expose API keys to client.
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

// ---------- Provider detection ----------

export function getProvider(): LLMProvider {
  const provider = (process?.env?.LLM_PROVIDER || "").toLowerCase()
  if (provider === "openai" && process?.env?.OPENAI_API_KEY) return "openai"
  if (provider === "gemini" && process?.env?.GEMINI_API_KEY) return "gemini"
  if (process?.env?.OPENAI_API_KEY) return "openai"
  if (process?.env?.GEMINI_API_KEY) return "gemini"
  return "fallback"
}

export function hasLLM(): boolean {
  return getProvider() !== "fallback"
}

// ---------- OpenAI ----------

async function callOpenAI(req: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw { type: "missing_key", message: "OPENAI_API_KEY not set" } as LLMError

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 800,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (res.status === 429) throw { type: "rate_limit", message: "OpenAI rate limit exceeded" } as LLMError
    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw { type: "invalid_response", message: `OpenAI error ${res.status}: ${body.slice(0, 200)}` } as LLMError
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content
    if (!text || text.trim().length === 0) throw { type: "empty_response", message: "OpenAI returned empty content" } as LLMError

    return {
      text: text.trim(),
      provider: "openai",
      usage: { promptTokens: data?.usage?.prompt_tokens, completionTokens: data?.usage?.completion_tokens },
    }
  } catch (err: any) {
    clearTimeout(timeout)
    if (err?.name === "AbortError") throw { type: "timeout", message: "OpenAI request timed out" } as LLMError
    if (err?.type) throw err
    throw { type: "network", message: `Network error: ${err?.message || "unknown"}` } as LLMError
  }
}

// ---------- Gemini ----------

async function callGemini(req: LLMRequest): Promise<LLMResponse> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw { type: "missing_key", message: "GEMINI_API_KEY not set" } as LLMError

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const systemMsg = req.messages.find((m) => m.role === "system")
    const userMsgs = req.messages.filter((m) => m.role !== "system")

    const contents = userMsgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens ?? 800,
      },
    }
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] }
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    )

    clearTimeout(timeout)

    if (res.status === 429) throw { type: "rate_limit", message: "Gemini rate limit exceeded" } as LLMError
    if (!res.ok) {
      const errBody = await res.text().catch(() => "")
      throw { type: "invalid_response", message: `Gemini error ${res.status}: ${errBody.slice(0, 200)}` } as LLMError
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text || text.trim().length === 0) throw { type: "empty_response", message: "Gemini returned empty content" } as LLMError

    return {
      text: text.trim(),
      provider: "gemini",
      usage: {
        promptTokens: data?.usageMetadata?.promptTokenCount,
        completionTokens: data?.usageMetadata?.candidatesTokenCount,
      },
    }
  } catch (err: any) {
    clearTimeout(timeout)
    if (err?.name === "AbortError") throw { type: "timeout", message: "Gemini request timed out" } as LLMError
    if (err?.type) throw err
    throw { type: "network", message: `Network error: ${err?.message || "unknown"}` } as LLMError
  }
}

// ---------- Main entry point ----------

export async function callLLM(req: LLMRequest): Promise<LLMResponse> {
  const provider = getProvider()

  if (provider === "fallback") {
    throw { type: "missing_key", message: "No LLM provider configured" } as LLMError
  }

  try {
    if (provider === "openai") return await callOpenAI(req)
    return await callGemini(req)
  } catch (err) {
    const llmErr = err as LLMError
    if (llmErr?.type) throw llmErr
    throw { type: "network", message: `Unexpected error: ${String(err)}` } as LLMError
  }
}

// ---------- Safe call with fallback ----------

export async function callLLMWithFallback(
  req: LLMRequest,
  fallbackFn: () => string,
): Promise<LLMResponse> {
  try {
    return await callLLM(req)
  } catch {
    return { text: fallbackFn(), provider: "fallback" }
  }
}
