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
    <div className="pl-toggle inline-flex items-center gap-1 rounded-xl p-1">
      {opts.map((o) => {
        const active = settings.theme === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => setTheme(o.v)}
            className={
              "pl-toggle-btn rounded-lg px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 " +
              (active ? "is-active" : "")
            }
          >
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
