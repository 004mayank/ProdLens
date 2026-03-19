import { NextResponse } from "next/server";
import { ProdLensWorkspaceSchema } from "@/lib/schema";
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

  let outputText = "";
  if (typeof json === "object" && json !== null && "output_text" in json) {
    const t = (json as { output_text?: unknown }).output_text;
    if (typeof t === "string") outputText = t;
  }

  const parsed = extractJson(outputText);

  // Validate/normalize when full workspace.
  if (scope === "full") {
    const validated = ProdLensWorkspaceSchema.parse(parsed);
    return NextResponse.json({ data: validated });
  }

  // Partial scopes: return as-is (client will merge).
  return NextResponse.json({ data: parsed });
}
