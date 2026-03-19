import { NextResponse } from "next/server";

export const runtime = "edge";

type Body = { apiKey: string };

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
  const apiKey = (body?.apiKey || "").trim();
  if (!apiKey) return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });

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
          content: [{ type: "input_text", text: "Reply with exactly: ok" }],
        },
        { role: "user", content: [{ type: "input_text", text: "ok" }] },
      ],
      temperature: 0,
      max_output_tokens: 16,
    }),
  });

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    let msg = "Invalid API key";
    if (typeof json === "object" && json !== null && "error" in json) {
      const err = (json as { error?: unknown }).error;
      if (typeof err === "object" && err !== null && "message" in err) {
        msg = String((err as { message?: unknown }).message ?? msg);
      }
    }
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const text = extractResponseText(json).toLowerCase();
  const ok = text.trim() === "ok";
  if (!ok) return NextResponse.json({ error: "Unexpected response while testing key." }, { status: 422 });

  return NextResponse.json({ ok: true });
}
