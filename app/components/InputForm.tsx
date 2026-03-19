"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  apiKey: string;
  productName: string;
  loading: boolean;
  onChangeApiKey: (v: string) => void;
  onChangeProductName: (v: string) => void;
  onAnalyze: () => void;
};

const LS_KEY = "prodlens.openaiKey";

export function InputForm(props: Props) {
  const [showKey, setShowKey] = useState(false);

  // Load stored key on first mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved && !props.apiKey) props.onChangeApiKey(saved);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist key when it changes.
  useEffect(() => {
    try {
      if (props.apiKey) localStorage.setItem(LS_KEY, props.apiKey);
      else localStorage.removeItem(LS_KEY);
    } catch {
      // ignore
    }
  }, [props.apiKey]);

  const keyStatus = useMemo(() => {
    if (!props.apiKey.trim()) return { label: "Not added", tone: "text-zinc-500" };
    if (props.apiKey.trim().startsWith("sk-")) return { label: "Key added", tone: "text-emerald-600" };
    return { label: "Key added", tone: "text-emerald-600" };
  }, [props.apiKey]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-900">OpenAI API Key</div>
          <div className={`text-xs ${keyStatus.tone}`}>{keyStatus.label} · stored locally</div>
        </div>
        <button
          type="button"
          onClick={() => setShowKey((s) => !s)}
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
        >
          {showKey ? "Hide" : "Show"}
        </button>
      </div>

      <div className="mt-3">
        <input
          value={props.apiKey}
          onChange={(e) => props.onChangeApiKey(e.target.value)}
          type={showKey ? "text" : "password"}
          placeholder="sk-..."
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300"
        />
      </div>

      <div className="mt-5">
        <div className="text-sm font-medium text-zinc-900">Product</div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={props.productName}
            onChange={(e) => props.onChangeProductName(e.target.value)}
            type="text"
            placeholder="Instagram"
            className="w-full flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
          />
          <button
            type="button"
            onClick={props.onAnalyze}
            disabled={props.loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {props.loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          No backend. Your key is stored in <span className="font-mono">localStorage</span> and only used for direct API calls.
        </div>
      </div>
    </div>
  );
}
