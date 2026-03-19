"use client";

import { useMemo, useState } from "react";
import type { RoadmapItem } from "@/lib/schema";
import { uid } from "@/lib/id";

function riceScore(i: RoadmapItem) {
  const r = i.rice.reach ?? 0;
  const impact = i.rice.impact ?? 0;
  const c = i.rice.confidence ?? 0;
  const e = i.rice.effort ?? 1;
  return e <= 0 ? 0 : (r * impact * c) / e;
}

export function RoadmapEditor({
  items,
  onChange,
}: {
  items: RoadmapItem[];
  onChange: (next: RoadmapItem[]) => void;
}) {
  const [title, setTitle] = useState("");

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => riceScore(b) - riceScore(a));
  }, [items]);

  function update(id: string, patch: Partial<RoadmapItem>) {
    onChange(items.map((it) => (it.id === id ? ({ ...it, ...patch } as RoadmapItem) : it)));
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">Roadmap (RICE prioritized)</div>
        <div className="mt-3 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add roadmap item…"
            className="w-full flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-300"
          />
          <button
            type="button"
            onClick={() => {
              const v = title.trim();
              if (!v) return;
              onChange([
                {
                  id: uid("roadmap"),
                  title: v,
                  description: "",
                  group: "next",
                  rice: { reach: 5, impact: 2, confidence: 0.6, effort: 2 },
                },
                ...items,
              ]);
              setTitle("");
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Add
          </button>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Score = (Reach × Impact × Confidence) / Effort
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
          No roadmap items yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {sorted.map((it) => (
            <div key={it.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <input
                    value={it.title}
                    onChange={(e) => update(it.id, { title: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-300"
                  />
                  <textarea
                    value={it.description || ""}
                    onChange={(e) => update(it.id, { description: e.target.value })}
                    placeholder="Why this? What’s the user value?"
                    className="mt-2 min-h-20 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
                  />
                </div>

                <div className="shrink-0">
                  <div className="text-xs font-semibold text-zinc-500">Priority</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-900">
                    {riceScore(it).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Field
                  label="Group"
                  value={it.group}
                  onChange={(v) => update(it.id, { group: v as RoadmapItem["group"] })}
                  kind="select"
                  options={["now", "next", "later"]}
                />
                <Field
                  label="Reach"
                  value={it.rice.reach}
                  onChange={(v) => update(it.id, { rice: { ...it.rice, reach: Number(v) } })}
                />
                <Field
                  label="Impact"
                  value={it.rice.impact}
                  onChange={(v) => update(it.id, { rice: { ...it.rice, impact: Number(v) } })}
                />
                <Field
                  label="Confidence"
                  value={it.rice.confidence}
                  onChange={(v) => update(it.id, { rice: { ...it.rice, confidence: Number(v) } })}
                />
                <Field
                  label="Effort"
                  value={it.rice.effort}
                  onChange={(v) => update(it.id, { rice: { ...it.rice, effort: Number(v) } })}
                />
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => onChange(items.filter((x) => x.id !== it.id))}
                  className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  kind,
  options,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  kind?: "number" | "select";
  options?: string[];
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold text-zinc-600">{label}</div>
      {kind === "select" ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-300"
        >
          {(options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="number"
          step={label === "Confidence" ? 0.1 : 1}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-300"
        />
      )}
    </div>
  );
}
