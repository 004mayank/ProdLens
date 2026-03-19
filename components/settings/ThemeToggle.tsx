"use client";

import { useSettings, type ThemeMode } from "@/components/settings/SettingsProvider";

export function ThemeToggle() {
  const { settings, setTheme } = useSettings();

  const opts: { v: ThemeMode; l: string }[] = [
    { v: "system", l: "System" },
    { v: "light", l: "Light" },
    { v: "dark", l: "Dark" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
      {opts.map((o) => {
        const active = settings.theme === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => setTheme(o.v)}
            className={
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition " +
              (active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50")
            }
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
