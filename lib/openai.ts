export type ProdLensResult = {
  overview: string;
  users: string;
  features: string[];
  competitors: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategy: string;
  ideas: string[];
};

const MODEL = "gpt-4o-mini";

function buildPrompt(productName: string) {
  return `You are a senior product manager and strategist.

Analyze the product: ${productName}

Provide a structured response:

1. Product Overview
2. Target Users
3. Core Features
4. Competitor Analysis
5. SWOT Analysis
6. Strategic Insights (most important)
7. What should a startup build to compete?

Be concise, structured, and insightful.

Return STRICT JSON with exactly this shape:
{
  "overview": "...",
  "users": "...",
  "features": ["..."],
  "competitors": ["..."],
  "swot": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  },
  "strategy": "...",
  "ideas": ["..."]
}

No markdown. No backticks. No extra keys.`;
}

function extractJson(text: string): unknown {
  const raw = (text || "").trim();
  if (!raw) throw new Error("Empty response from model.");

  try {
    return JSON.parse(raw);
  } catch {
    // Try to extract first JSON object
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return valid JSON.");
    return JSON.parse(match[0]);
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function normalizeResult(obj: unknown): ProdLensResult {
  const o = isRecord(obj) ? obj : {};
  const swot = isRecord(o.swot) ? (o.swot as Record<string, unknown>) : {};

  const features = Array.isArray(o.features) ? o.features.map(String) : [];
  const competitors = Array.isArray(o.competitors) ? o.competitors.map(String) : [];
  const ideas = Array.isArray(o.ideas) ? o.ideas.map(String) : [];

  return {
    overview: String(o.overview ?? ""),
    users: String(o.users ?? ""),
    features,
    competitors,
    swot: {
      strengths: Array.isArray(swot.strengths) ? (swot.strengths as unknown[]).map(String) : [],
      weaknesses: Array.isArray(swot.weaknesses) ? (swot.weaknesses as unknown[]).map(String) : [],
      opportunities: Array.isArray(swot.opportunities) ? (swot.opportunities as unknown[]).map(String) : [],
      threats: Array.isArray(swot.threats) ? (swot.threats as unknown[]).map(String) : [],
    },
    strategy: String(o.strategy ?? ""),
    ideas,
  };
}

export async function analyzeProduct(opts: {
  apiKey: string;
  productName: string;
}): Promise<ProdLensResult> {
  const apiKey = opts.apiKey.trim();
  const productName = opts.productName.trim();

  if (!apiKey) throw new Error("Please enter your OpenAI API key.");
  if (!productName) throw new Error("Please enter a product name.");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: "You are a precise JSON generator." }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: buildPrompt(productName) }],
        },
      ],
      temperature: 0.2,
      max_output_tokens: 1200,
    }),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = `Request failed (${res.status}).`;

    if (isRecord(json)) {
      // { error: { message: string } }
      if (isRecord(json.error) && typeof json.error.message === "string") {
        msg = json.error.message;
      } else if (typeof json.message === "string") {
        msg = json.message;
      }
    }

    throw new Error(msg);
  }

  const outputText: string = (() => {
    if (typeof json === "object" && json !== null && "output_text" in json) {
      const t = (json as { output_text?: unknown }).output_text;
      if (typeof t === "string") return t;
    }

    const out =
      typeof json === "object" && json !== null && "output" in json
        ? (json as { output?: unknown }).output
        : null;

    if (!Array.isArray(out)) return "";

    const chunks: string[] = [];

    for (const item of out) {
      if (typeof item !== "object" || item === null) continue;
      const content = (item as { content?: unknown }).content;
      if (!Array.isArray(content)) continue;

      for (const c of content) {
        if (typeof c !== "object" || c === null) continue;
        const type = (c as { type?: unknown }).type;
        const text = (c as { text?: unknown }).text;
        if (type === "output_text" && typeof text === "string") chunks.push(text);
      }
    }

    return chunks.join("");
  })();

  const parsed = extractJson(outputText);
  return normalizeResult(parsed);
}
