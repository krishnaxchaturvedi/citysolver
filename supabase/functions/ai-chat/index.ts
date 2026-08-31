// ============================================================
// AI Chat Edge Function
// Server-side proxy for LLM calls (OpenAI / Gemini).
// API keys are read from environment — never sent to client.
// Falls back gracefully when no keys are configured.
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

function getProvider(): "openai" | "gemini" | "fallback" {
  const provider = (Deno.env.get("LLM_PROVIDER") || "").toLowerCase();
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");

  if (provider === "openai" && openaiKey) return "openai";
  if (provider === "gemini" && geminiKey) return "gemini";
  if (openaiKey) return "openai";
  if (geminiKey) return "gemini";
  return "fallback";
}

async function callOpenAI(messages: LLMMessage[], temperature: number, maxTokens: number): Promise<{ text: string; usage?: any }> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")!;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenAI error ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text || text.trim().length === 0) throw new Error("Empty response from OpenAI");

    return {
      text: text.trim(),
      usage: {
        promptTokens: data?.usage?.prompt_tokens,
        completionTokens: data?.usage?.completion_tokens,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function callGemini(messages: LLMMessage[], temperature: number, maxTokens: number): Promise<{ text: string; usage?: any }> {
  const apiKey = Deno.env.get("GEMINI_API_KEY")!;

  const systemMsg = messages.find((m) => m.role === "system");
  const userMsgs = messages.filter((m) => m.role !== "system");

  const contents = userMsgs.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body: Record<string, unknown> = {
    contents,
    generationConfig: { temperature, maxOutputTokens: maxTokens },
  };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Gemini error ${res.status}: ${errBody.slice(0, 300)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.trim().length === 0) throw new Error("Empty response from Gemini");

    return {
      text: text.trim(),
      usage: {
        promptTokens: data?.usageMetadata?.promptTokenCount,
        completionTokens: data?.usageMetadata?.candidatesTokenCount,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method === "GET") {
    const provider = getProvider();
    return new Response(
      JSON.stringify({ provider, available: provider !== "fallback" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const { messages, temperature = 0.7, maxTokens = 800 }: RequestBody = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const provider = getProvider();

    if (provider === "fallback") {
      return new Response(
        JSON.stringify({ text: "", provider: "fallback", error: "No LLM provider configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    try {
      let result;
      if (provider === "openai") {
        result = await callOpenAI(messages, temperature, maxTokens);
      } else {
        result = await callGemini(messages, temperature, maxTokens);
      }

      return new Response(
        JSON.stringify({ text: result.text, provider, usage: result.usage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ text: "", provider: "fallback", error: err?.message || "LLM call failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
