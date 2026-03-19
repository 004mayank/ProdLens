"use client";

import { useState } from "react";

export function EditableStringList({
  title,
  items,
  placeholder,
  onChange,
}: {
  title: string;
  items: string[];
  placeholder?: string;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? <div className="text-sm text-zinc-500">No items.</div> : null}
        {items.map((it, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 px-3 py-2">
            <div className="text-sm text-zinc-800">{it}</div>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder || "Add an item…"}
          className="w-full flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300"
        />
        <button
          type="button"
          onClick={() => {
            const v = draft.trim();
            if (!v) return;
            onChange([v, ...items]);
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
