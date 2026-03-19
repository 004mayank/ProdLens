"use client";

import { useMemo, useState } from "react";
import type { ProdLensResult } from "@/lib/openai";

type TabKey = "overview" | "features" | "competitors" | "swot" | "strategy" | "ideas";

const TABS: { key: TabKey; label: string; badge?: string }[] = [
  { key: "overview", label: "📌 Overview" },
  { key: "features", label: "🧩 Features" },
  { key: "competitors", label: "⚔️ Competitors" },
  { key: "swot", label: "📉 SWOT" },
  { key: "strategy", label: "💡 Strategy", badge: "Most important" },
  { key: "ideas", label: "🚀 What to Build" },
];

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
        (active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
      }
    >
      {children}
    </button>
  );
}

function Card({ title, children, highlight }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div
      className={
        "rounded-2xl border bg-white p-5 shadow-sm " +
        (highlight ? "border-amber-200 ring-1 ring-amber-100" : "border-zinc-200")
      }
    >
      <div className="mb-3 text-sm font-semibold text-zinc-900">{title}</div>
      <div className="text-sm leading-6 text-zinc-700">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  if (!items?.length) return <div className="text-sm text-zinc-500">No data.</div>;
  return (
    <ul className="space-y-2">
      {items.map((it, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function ResultTabs({ result }: { result: ProdLensResult }) {
  const [tab, setTab] = useState<TabKey>("strategy");

  const swotRows = useMemo(
    () => [
      { title: "Strengths", items: result.swot?.strengths ?? [] },
      { title: "Weaknesses", items: result.swot?.weaknesses ?? [] },
      { title: "Opportunities", items: result.swot?.opportunities ?? [] },
      { title: "Threats", items: result.swot?.threats ?? [] },
    ],
    [result]
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <div key={t.key} className="flex items-center gap-2">
            <Pill active={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </Pill>
            {t.badge && tab === t.key ? (
              <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800 sm:inline">
                {t.badge}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4">
        {tab === "overview" && (
          <>
            <Card title="Product Overview">
              {result.overview || <span className="text-zinc-500">No overview.</span>}
            </Card>
            <Card title="Target Users">{result.users || <span className="text-zinc-500">No users.</span>}</Card>
          </>
        )}

        {tab === "features" && (
          <Card title="Core Features">
            <List items={result.features} />
          </Card>
        )}

        {tab === "competitors" && (
          <Card title="Competitor Analysis">
            <List items={result.competitors} />
          </Card>
        )}

        {tab === "swot" && (
          <div className="grid gap-4 sm:grid-cols-2">
            {swotRows.map((r) => (
              <Card key={r.title} title={r.title}>
                <List items={r.items} />
              </Card>
            ))}
          </div>
        )}

        {tab === "strategy" && (
          <Card title="Strategic Insights" highlight>
            {result.strategy || <span className="text-zinc-500">No strategy.</span>}
          </Card>
        )}

        {tab === "ideas" && (
          <Card title="What should I build?">
            <List items={result.ideas} />
          </Card>
        )}
      </div>
    </div>
  );
}
