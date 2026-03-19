"use client";

import { useMemo, useState } from "react";
import { useSettings } from "@/components/settings/SettingsProvider";

export function ApiKeyCard() {
  const { settings, setApiKey, clearApiKey } = useSettings();

  const [draft, setDraft] = useState(settings.apiKey);
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testedKey, setTestedKey] = useState<string | null>(null);
  const [testOk, setTestOk] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canSave = useMemo(() => {
    const d = draft.trim();
    return Boolean(d) && testOk && testedKey === d;
  }, [draft, testOk, testedKey]);

  async function testKey() {
    const k = draft.trim();
    setMsg(null);
    setTesting(true);
    setTestedKey(null);
    setTestOk(false);

    try {
      if (!k) throw new Error("Enter an API key first.");

      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: k }),
      });

      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const err =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error?: unknown }).error)
            : "Key test failed.";
        throw new Error(err);
      }

      setTestedKey(k);
      setTestOk(true);
      setMsg("Key works. You can save it now.");
    } catch (e: unknown) {
      const m =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Key test failed.";
      setMsg(m);
      setTestedKey(k);
      setTestOk(false);
    } finally {
      setTesting(false);
    }
  }

  function save() {
    if (!canSave) return;
    setApiKey(draft.trim());
    setMsg("Saved. This key will be used across all projects.");
  }

  return (
    <div className="pl-card rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">OpenAI API key</div>
          <div className="pl-muted mt-1 text-xs">
            Stored locally in your browser. Used across all ProdLens projects.
          </div>
        </div>
        {settings.apiKey ? (
          <button
            type="button"
            onClick={() => {
              if (confirm("Clear saved API key?")) {
                clearApiKey();
                setDraft("");
                setMsg("Cleared.");
              }
            }}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-zinc-600">Key</div>
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setMsg(null);
            setTestOk(false);
            setTestedKey(null);
          }}
          type={show ? "text" : "password"}
          placeholder="sk-..."
          autoComplete="off"
          spellCheck={false}
          className="pl-input mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-70 focus:ring-2 focus:ring-blue-500/30"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={testKey}
            disabled={testing}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300 disabled:opacity-70"
          >
            {testing ? "Testing…" : "Test key"}
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save key
          </button>

          {testOk ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              Valid
            </span>
          ) : null}
        </div>

        {msg ? <div className={`mt-2 text-xs ${testOk ? "text-emerald-700" : "text-zinc-600"}`}>{msg}</div> : null}
      </div>
    </div>
  );
}
