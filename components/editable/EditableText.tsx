"use client";

import { useEffect, useRef, useState } from "react";

export function EditableText({
  label,
  value,
  placeholder,
  multiline,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  disabled?: boolean;
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
    <div className="pl-card rounded-2xl p-4 shadow-sm">
      <div className="mb-2 text-xs font-semibold text-zinc-600">{label}</div>
      {multiline ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-input min-h-28 w-full resize-y rounded-xl px-3 py-2 text-sm outline-none placeholder:opacity-70 focus:ring-2 focus:ring-blue-500/30"
        />
      ) : (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => onChange(draft)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-input w-full rounded-xl px-3 py-2 text-sm outline-none placeholder:opacity-70 focus:ring-2 focus:ring-blue-500/30"
        />
      )}
      <div className="mt-2 text-[11px] text-zinc-400">Click outside to save.</div>
    </div>
  );
}
