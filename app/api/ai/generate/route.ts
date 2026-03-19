import { NextResponse } from "next/server";
import { ProdLensWorkspaceSchema } from "@/lib/schema";
import { ensureWorkspaceIds } from "@/lib/normalize";
import { masterPrompt, type AIMode, type AIScope } from "@/lib/ai/prompts";

export const runtime = "edge";

type Body = {
  apiKey: string;
  productName: string;
  mode: AIMode;
  scope: AIScope;
  current?: unknown;
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
  // Prefer output_text if present.
  if (typeof json === "object" && json !== null && "output_text" in json) {
    const t = (json as { output_text?: unknown }).output_text;
    if (typeof t === "string") return t;
  }

  // Fallback: walk output[].content[].text
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
      if (type === "output_text" && typeof text === "string") parts.push(text);
      if (type === "text" && typeof text === "string") parts.push(text);
    }
  }

  return parts.join("").trim();
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const apiKey = (body.apiKey || "").trim();
  const productName = (body.productName || "").trim();
  const mode = body.mode || "generate";
  const scope = body.scope || "full";

  if (!apiKey) return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
  if (!productName) return NextResponse.json({ error: "Missing productName" }, { status: 400 });

  const currentParsed = ProdLensWorkspaceSchema.safeParse(body.current);

  const prompt = masterPrompt({
    productName,
    mode,
    scope,
    current: currentParsed.success ? currentParsed.data : null,
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
          content: [{ type: "input_text", text: "You return strict JSON for product workspaces." }],
        },
        { role: "user", content: [{ type: "input_text", text: prompt }] },
      ],
      temperature: 0.2,
      max_output_tokens: 1600,
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
    return NextResponse.json({ error: msg, raw: outputText.slice(0, 2000) }, { status: 422 });
  }

  // Validate/normalize when full workspace.
  if (scope === "full") {
    const validated = ProdLensWorkspaceSchema.parse(parsed);
    return NextResponse.json({ data: ensureWorkspaceIds(validated) });
  }

  // Partial scopes: return as-is (client will merge).
  return NextResponse.json({ data: parsed });
}
