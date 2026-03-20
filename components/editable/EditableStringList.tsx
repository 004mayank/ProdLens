"use client";

import { useState } from "react";

export function EditableStringList({
  title,
  items,
  placeholder,
  disabled,
  onChange,
}: {
  title: string;
  items: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="pl-card rounded-2xl p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            onChange([]);
          }}
          disabled={disabled}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900"
        >
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? <div className="text-sm text-zinc-500">No items.</div> : null}
        {items.map((it, idx) => (
          <div key={idx} className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)" }}>
            <div className="text-sm text-zinc-800">{it}</div>
            <button
              type="button"
              onClick={() => {
                if (disabled) return;
                onChange(items.filter((_, i) => i !== idx));
              }}
              disabled={disabled}
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
          disabled={disabled}
          className="pl-input w-full flex-1 rounded-xl px-3 py-2 text-sm outline-none placeholder:opacity-70 focus:ring-2 focus:ring-blue-500/30"
        />
        <button
          type="button"
          onClick={() => {
            if (disabled) return;
            const v = draft.trim();
            if (!v) return;
            onChange([v, ...items]);
            setDraft("");
          }}
          disabled={disabled}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Add
        </button>
      </div>
    </div>
  );
}
