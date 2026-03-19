"use client";

import { useState } from "react";
import type { Experiment } from "@/lib/schema";
import { uid } from "@/lib/id";

export function ExperimentsEditor({
  experiments,
  onChange,
}: {
  experiments: Experiment[];
  onChange: (next: Experiment[]) => void;
}) {
  const [hyp, setHyp] = useState("");

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">Experiments</div>
        <div className="mt-3 flex gap-2">
          <input
            value={hyp}
            onChange={(e) => setHyp(e.target.value)}
            placeholder="Hypothesis…"
            className="w-full flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-300"
          />
          <button
            type="button"
            onClick={() => {
              const v = hyp.trim();
              if (!v) return;
              onChange([
                {
                  id: uid("exp"),
                  hypothesis: v,
                  target_users: [],
                  metrics: [],
                  status: "idea",
                },
                ...experiments,
              ]);
              setHyp("");
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Add
          </button>
        </div>
      </div>

      {experiments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
          No experiments yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {experiments.map((e) => (
            <div key={e.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-zinc-600">Hypothesis</div>
                  <textarea
                    value={e.hypothesis}
                    onChange={(ev) =>
                      onChange(experiments.map((x) => (x.id === e.id ? { ...x, hypothesis: ev.target.value } : x)))
                    }
                    className="mt-1 min-h-20 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-300"
                  />
                </div>

                <div className="shrink-0">
                  <div className="text-xs font-semibold text-zinc-600">Status</div>
                  <select
                    value={e.status}
                    onChange={(ev) =>
                      onChange(
                        experiments.map((x) =>
                          x.id === e.id
                            ? { ...x, status: ev.target.value as Experiment["status"] }
                            : x
                        )
                      )
                    }
                    className="mt-1 w-40 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-300"
                  >
                    {[
                      { v: "idea", l: "Idea" },
                      { v: "planned", l: "Planned" },
                      { v: "running", l: "Running" },
                      { v: "shipped", l: "Shipped" },
                      { v: "killed", l: "Killed" },
                    ].map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TagList
                  title="Target users"
                  items={e.target_users}
                  onChange={(items) =>
                    onChange(experiments.map((x) => (x.id === e.id ? { ...x, target_users: items } : x)))
                  }
                />
                <TagList
                  title="Metrics"
                  items={e.metrics}
                  onChange={(items) => onChange(experiments.map((x) => (x.id === e.id ? { ...x, metrics: items } : x)))}
                />
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => onChange(experiments.filter((x) => x.id !== e.id))}
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

function TagList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-zinc-600">{title}</div>

      <div className="mt-2 flex flex-wrap gap-2">
        {items.length === 0 ? <span className="text-sm text-zinc-500">None</span> : null}
        {items.map((t, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
            title="Click to remove"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add…"
          className="w-full flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-300"
        />
        <button
          type="button"
          onClick={() => {
            const v = draft.trim();
            if (!v) return;
            onChange([...items, v]);
            setDraft("");
          }}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}
