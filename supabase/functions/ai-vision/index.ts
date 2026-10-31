// ============================================================
// AI Vision Edge Function
// Server-side proxy for vision-capable LLM calls (OpenAI / Gemini).
// Accepts a base64 image and returns classification, evidence
// analysis, and complaint description suggestions.
// API keys stay server-side — never exposed to the browser.
// Falls back gracefully when no keys are configured.
// ============================================================

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VisionRequest {
  image: string; // base64 data URL
  mimeType: string;
  categories?: string[];
}

interface ClassificationResult {
  detectedCategory: string;
  confidence: number;
  alternativeCategories: Array<{ category: string; confidence: number }>;
  evidence: string;
  isRelevant: boolean;
  warnings: string[];
}

interface EvidenceAnalysis {
  clarity: number;
  brightness: number;
  blur: number;
  visibility: number;
  relevantContent: number;
  evidenceScore: number;
  classificationConfidence: number;
  ocrConfidence: number;
  warnings: string[];
  explanation: string;
}

interface DescriptionSuggestion {
  title: string;
  description: string;
  detectedIssue: string;
  visibleDamage: string;
  publicImpact: string;
  suggestedDepartment: string;
  recommendedAction: string;
}

interface VisionResponse {
  classification: ClassificationResult;
  evidence: EvidenceAnalysis;
  description: DescriptionSuggestion;
  provider: string;
}

const CIVIC_CATEGORIES = [
  "Potholes",
  "Road Damage",
  "Garbage Accumulation",
  "Illegal Dumping",
  "Water Leakage",
  "Sewage Overflow",
  "Flooding",
  "Street Light Failure",
  "Broken Infrastructure",
  "Other Civic Issues",
];

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

async function callOpenAIVision(
  imageDataUrl: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY")!;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: imageDataUrl, detail: "low" },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 1200,
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
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiVision(
  imageDataUrl: string,
  mimeType: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY")!;

  // Extract base64 data from data URL
  const base64Data = imageDataUrl.split(",")[1] || "";

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [
          { text: userPrompt },
          { inline_data: { mime_type: mimeType, data: base64Data } },
        ],
      },
    ],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1200 },
  };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

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
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}

function parseJSONResponse(text: string): any {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

function buildFallbackResult(): VisionResponse {
  return {
    classification: {
      detectedCategory: "Other Civic Issues",
      confidence: 0,
      alternativeCategories: [],
      evidence: "AI vision analysis is not available. Please select the category manually.",
      isRelevant: true,
      warnings: ["Vision AI not configured — manual categorization required."],
    },
    evidence: {
      clarity: 50,
      brightness: 50,
      blur: 50,
      visibility: 50,
      relevantContent: 50,
      evidenceScore: 0,
      classificationConfidence: 0,
      ocrConfidence: 0,
      warnings: ["AI analysis unavailable — server-side fallback active."],
      explanation: "No vision AI provider is configured. Evidence quality cannot be assessed automatically.",
    },
    description: {
      title: "",
      description: "",
      detectedIssue: "Unknown",
      visibleDamage: "",
      publicImpact: "",
      suggestedDepartment: "General Municipal Services",
      recommendedAction: "Manual inspection required.",
    },
    provider: "fallback",
  };
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
    const body: VisionRequest = await req.json();

    if (!body.image) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const categories = body.categories?.length ? body.categories : CIVIC_CATEGORIES;
    const provider = getProvider();

    if (provider === "fallback") {
      return new Response(
        JSON.stringify(buildFallbackResult()),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = `You are a civic infrastructure AI vision analyst. You analyze photographs of civic issues and classify them.
You must respond with ONLY valid JSON (no markdown, no extra text).
The available civic issue categories are: ${categories.join(", ")}.

Analyze the image and return a JSON object with this exact structure:
{
  "classification": {
    "detectedCategory": "one of the categories above",
    "confidence": 0-100,
    "alternativeCategories": [{"category": "name", "confidence": 0-100}],
    "evidence": "detailed text explanation of what visual evidence supports this classification",
    "isRelevant": true/false,
    "warnings": ["list of warnings if image is blurry, dark, irrelevant, etc."]
  },
  "evidence": {
    "clarity": 0-100,
    "brightness": 0-100,
    "blur": 0-100 (higher = more blurry),
    "visibility": 0-100,
    "relevantContent": 0-100,
    "evidenceScore": 0-100 (overall quality of the image as complaint evidence),
    "classificationConfidence": same as classification.confidence,
    "ocrConfidence": 0 (OCR not performed by vision model),
    "warnings": ["warnings about image quality"],
    "explanation": "human-readable summary distinguishing technical image quality from whether a civic issue is visible"
  },
  "description": {
    "title": "concise complaint title (max 60 chars)",
    "description": "detailed complaint description (100-300 chars)",
    "detectedIssue": "what the issue is",
    "visibleDamage": "description of visible damage or problem",
    "publicImpact": "potential impact on public",
    "suggestedDepartment": "which municipal department should handle this",
    "recommendedAction": "recommended action to resolve the issue"
  }
}`;

    const userPrompt = `Analyze this photograph for a civic complaint. Classify the issue, assess evidence quality, and generate a complaint description. Return ONLY the JSON object.`;

    let rawText: string;
    try {
      if (provider === "openai") {
        rawText = await callOpenAIVision(body.image, systemPrompt, userPrompt);
      } else {
        rawText = await callGeminiVision(body.image, body.mimeType || "image/jpeg", systemPrompt, userPrompt);
      }
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          ...buildFallbackResult(),
          evidence: {
            ...buildFallbackResult().evidence,
            warnings: [`Vision AI error: ${err?.message || "unknown error"}`],
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    try {
      const parsed = parseJSONResponse(rawText) as VisionResponse;
      parsed.provider = provider;
      return new Response(
        JSON.stringify(parsed),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch {
      return new Response(
        JSON.stringify(buildFallbackResult()),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
