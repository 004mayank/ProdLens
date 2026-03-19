"use client";

import { useState } from "react";
import { InputForm } from "@/app/components/InputForm";
import { ResultTabs } from "@/app/components/ResultTabs";
import { analyzeProduct, type ProdLensResult } from "@/lib/openai";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProdLensResult | null>(null);

  async function onAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const out = await analyzeProduct({ apiKey, productName });
      setResult(out);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
              PL
            </div>
            <div>
              <div className="text-sm font-semibold leading-4">ProdLens</div>
              <div className="text-xs text-zinc-500">AI product intelligence</div>
            </div>
          </div>
          <div className="text-xs text-zinc-500">Local-first · No backend</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analyze any product like a PM</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
              Enter your API key, type a product name, and get a structured brief: overview, features, competitors, SWOT, and
              strategy—plus &quot;what should I build&quot; recommendations.
            </p>
          </div>

          <InputForm
            apiKey={apiKey}
            productName={productName}
            loading={loading}
            onChangeApiKey={setApiKey}
            onChangeProductName={setProductName}
            onAnalyze={onAnalyze}
          />

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <div className="font-semibold">Couldn’t analyze</div>
              <div className="mt-1 text-red-800">{error}</div>
            </div>
          ) : null}

          {result ? <ResultTabs result={result} /> : null}

          {!result && !error ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
              <div className="font-semibold text-zinc-900">Tip</div>
              <div className="mt-1">
                Try products like <span className="font-medium">Instagram</span>, <span className="font-medium">Notion</span>,
                or <span className="font-medium">Figma</span>. If outputs feel generic, increase model quality in
                <span className="font-mono"> lib/openai.ts</span>.
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6 text-xs text-zinc-500">
          ProdLens runs entirely in your browser. Your API key is stored locally and used only for direct OpenAI requests.
        </div>
      </footer>
    </div>
  );
}
