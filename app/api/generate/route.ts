import { NextResponse } from "next/server";
import { StrategySchema } from "@/lib/schema";
import { masterPrompt } from "@/lib/ai/prompts";

export const runtime = "edge";

type Body = {
  product_name?: string;
  // Optional: this app supports user-provided API keys stored client-side.
  // If not provided, falls back to server env OPENAI_API_KEY.
  apiKey?: string;
};

function extractJson(text: string): unknown {
  const raw = (text || "").trim();
  if (!raw) throw new Error("Empty model response.");
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Model did not return JSON.");
    return JSON.parse(m[0]);
  }
}

function extractResponseText(json: unknown): string {
  if (typeof json === "object" && json !== null && "output_text" in json) {
    const t = (json as { output_text?: unknown }).output_text;
    if (typeof t === "string") return t;
  }

  if (!(typeof json === "object" && json !== null && "output" in json)) return "";
  const out = (json as { output?: unknown }).output;
  if (!Array.isArray(out)) return "";

  const parts: string[] = [];
  for (const item of out) {
    if (typeof item !== "object" || item === null) continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const c of content) {
      if (typeof c !== "object" || c === null) continue;
      const type = (c as { type?: unknown }).type;
      const text = (c as { text?: unknown }).text;
      if ((type === "output_text" || type === "text") && typeof text === "string") parts.push(text);
    }
  }
  return parts.join("").trim();
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const productName = (body.product_name || "").trim();
  if (!productName) return NextResponse.json({ error: "Missing product_name" }, { status: 400 });

  const apiKey = (body.apiKey || process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing apiKey (send apiKey or set OPENAI_API_KEY)" },
      { status: 400 }
    );
  }

  const prompt = masterPrompt({
    productName,
    mode: "generate",
    scope: "strategy",
    current: null,
  });

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Return ONLY valid JSON with this exact shape: {\"strategy\":{\"positioning\":string,\"insights\":string[],\"bets\":string[],\"risks\":string[]}}. No extra keys. No markdown.",
            },
          ],
        },
        { role: "user", content: [{ type: "input_text", text: prompt }] },
      ],
      temperature: 0.2,
      max_output_tokens: 800,
    }),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = "OpenAI request failed";
    if (typeof json === "object" && json !== null && "error" in json) {
      const err = (json as { error?: unknown }).error;
      if (typeof err === "object" && err !== null && "message" in err) {
        msg = String((err as { message?: unknown }).message ?? msg);
      }
    }
    return NextResponse.json({ error: msg }, { status: res.status });
  }

  const outputText = extractResponseText(json);

  let parsed: unknown;
  try {
    parsed = extractJson(outputText);
  } catch (e: unknown) {
    const msg =
      typeof e === "object" && e !== null && "message" in e
        ? String((e as { message: unknown }).message)
        : "Failed to parse model JSON.";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  // Validate + map into workspace strategy keys.
  // Your UI uses: positioning, strategic_insights, what_to_build, key_risks.
  const rawStrategy =
    typeof parsed === "object" && parsed !== null && "strategy" in parsed
      ? (parsed as { strategy?: unknown }).strategy
      : null;

  if (!rawStrategy || typeof rawStrategy !== "object") {
    return NextResponse.json({ error: "Missing strategy in response" }, { status: 422 });
  }

  const positioning = String((rawStrategy as any).positioning || "");
  const insights = Array.isArray((rawStrategy as any).insights) ? (rawStrategy as any).insights : [];
  const bets = Array.isArray((rawStrategy as any).bets) ? (rawStrategy as any).bets : [];
  const risks = Array.isArray((rawStrategy as any).risks) ? (rawStrategy as any).risks : [];

  // Validate the final shape we store (workspace schema)
  const validated = StrategySchema.parse({
    positioning,
    strategic_insights: insights.map(String),
    what_to_build: bets.map(String),
    key_risks: risks.map(String),
    strengths_to_double_down: [],
  });

  return NextResponse.json({
    strategy: {
      positioning: validated.positioning,
      insights: validated.strategic_insights,
      bets: validated.what_to_build,
      risks: validated.key_risks,
    },
  });
}
