"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";

type Settings = {
  apiKey: string;
  theme: ThemeMode;
};

type Ctx = {
  settings: Settings;
  setTheme: (t: ThemeMode) => void;
  setApiKey: (k: string) => void;
  clearApiKey: () => void;
};

const LS_KEY = "prodlens.settings";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  root.classList.toggle("dark", resolved === "dark");
}

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({ apiKey: "", theme: "system" });

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings({
        apiKey: typeof parsed?.apiKey === "string" ? parsed.apiKey : "",
        theme: parsed?.theme === "light" || parsed?.theme === "dark" || parsed?.theme === "system" ? parsed.theme : "system",
      });
    } catch {
      // ignore
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Theme apply
  useEffect(() => {
    applyTheme(settings.theme);

    // React to OS changes when in system mode.
    if (settings.theme !== "system") return;
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq?.addEventListener?.("change", handler);
    return () => mq?.removeEventListener?.("change", handler);
  }, [settings.theme]);

  const ctx = useMemo<Ctx>(
    () => ({
      settings,
      setTheme: (t) => setSettings((s) => ({ ...s, theme: t })),
      setApiKey: (k) => setSettings((s) => ({ ...s, apiKey: k })),
      clearApiKey: () => setSettings((s) => ({ ...s, apiKey: "" })),
    }),
    [settings]
  );

  return <SettingsContext.Provider value={ctx}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const v = useContext(SettingsContext);
  if (!v) throw new Error("useSettings must be used inside SettingsProvider");
  return v;
}
