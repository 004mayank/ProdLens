"use client";

import { useEffect, useRef, useState } from "react";

export function EditableText({
  label,
  value,
  placeholder,
  multiline,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const last = useRef(value);

  useEffect(() => {
    if (last.current !== value) {
      last.current = value;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(value);
    }
  }, [value]);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-xs font-semibold text-zinc-600">{label}</div>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft)}
          placeholder={placeholder}
          className="min-h-28 w-full resize-y rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
        />
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300"
        />
      )}
      <div className="mt-2 text-[11px] text-zinc-400">Click outside to save.</div>
    </div>
  );
}
