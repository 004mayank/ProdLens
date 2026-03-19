"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { useProjects } from "@/components/ProjectsProvider";
import type { ProdLensWorkspace } from "@/lib/schema";
import { ensureWorkspaceIds } from "@/lib/normalize";
import { EditableText } from "@/components/editable/EditableText";
import { EditableStringList } from "@/components/editable/EditableStringList";
import { RoadmapEditor } from "@/components/workspace/RoadmapEditor";
import { ExperimentsEditor } from "@/components/workspace/ExperimentsEditor";

import type { AIMode, AIScope } from "@/lib/ai/prompts";

type TabKey =
  | "product"
  | "users"
  | "systems"
  | "features"
  | "metrics"
  | "flows"
  | "competition"
  | "strategy"
  | "experiments"
  | "roadmap";

const TABS: { key: TabKey; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "users", label: "Users" },
  { key: "systems", label: "Systems" },
  { key: "features", label: "Features" },
  { key: "metrics", label: "Metrics" },
  { key: "flows", label: "Flows" },
  { key: "competition", label: "Competition" },
  { key: "strategy", label: "Strategy" },
  { key: "experiments", label: "Experiments" },
  { key: "roadmap", label: "Roadmap" },
];

const APIKEY_LS = "prodlens.openaiKey";

function pill(active: boolean) {
  return (
    "rounded-full border px-3 py-1.5 text-xs font-semibold " +
    (active
      ? "border-zinc-900 bg-zinc-900 text-white"
      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300")
  );
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { hydrated, projects, getProject, save } = useProjects();

  const project = id ? getProject(id) : undefined;
  const [tab, setTab] = useState<TabKey>("strategy");

  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState<AIMode>("generate");
  const [scope, setScope] = useState<AIScope>("full");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load stored key once (best-effort)
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(APIKEY_LS);
      if (savedKey) setApiKey(savedKey);
    } catch {
      // ignore
    }
  }, []);

  const sidebarProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [projects]);

  if (!hydrated) {
    return <div className="p-8 text-sm text-zinc-500">Loading…</div>;
  }

  if (!project) {
    return (
      <div className="p-8">
        <div className="text-sm font-semibold text-zinc-900">Project not found</div>
        <div className="mt-2 text-sm text-zinc-600">It may have been deleted.</div>
        <div className="mt-4">
          <Link href="/dashboard" className="text-sm font-semibold text-zinc-700 hover:text-zinc-900">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const proj = project;
  const ws = proj.workspace;

  function patchWorkspace(patch: Partial<ProdLensWorkspace>) {
    const next = { ...proj.workspace, ...patch } as ProdLensWorkspace;
    save({ ...proj, workspace: ensureWorkspaceIds(next) });
  }

  async function runAI() {
    setErr(null);
    setLoading(true);

    try {
      if (!apiKey.trim()) throw new Error("Add your OpenAI API key first.");

      // persist key locally
      try {
        localStorage.setItem(APIKEY_LS, apiKey.trim());
      } catch {
        // ignore
      }

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          productName: ws.product.name,
          mode,
          scope,
          current: ws,
        }),
      });

      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error?: unknown }).error)
            : "AI request failed.";
        throw new Error(msg);
      }

      const data =
        typeof json === "object" && json !== null && "data" in json
          ? (json as { data?: unknown }).data
          : null;
      if (!data) throw new Error("Empty AI response.");

      if (scope === "full") {
        patchWorkspace(data as Partial<ProdLensWorkspace>);
      } else if (scope === "strategy") {
        const nextStrategy =
          typeof data === "object" && data !== null && "strategy" in data
            ? (data as { strategy?: unknown }).strategy
            : data;
        patchWorkspace({ strategy: nextStrategy as ProdLensWorkspace["strategy"] });
        setTab("strategy");
      } else if (scope === "roadmap") {
        const nextRoadmap =
          typeof data === "object" && data !== null && "roadmap" in data
            ? (data as { roadmap?: unknown }).roadmap
            : data;
        patchWorkspace({ roadmap: nextRoadmap as ProdLensWorkspace["roadmap"] });
        setTab("roadmap");
      }
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e !== null && "message" in e
          ? String((e as { message: unknown }).message)
          : "Something went wrong.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 h-dvh w-72 shrink-0 border-r border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-5">
            <div className="text-sm font-semibold text-zinc-900">ProdLens</div>
            <div className="text-xs text-zinc-500">PM workspace</div>
            <div className="mt-3">
              <Link href="/dashboard" className="text-xs font-semibold text-zinc-600 hover:text-zinc-900">
                ← Dashboard
              </Link>
            </div>
          </div>

          <div className="px-3 py-3">
            <div className="px-2 text-xs font-semibold text-zinc-500">Projects</div>
            <div className="mt-2 grid gap-1">
              {sidebarProjects.map((p) => {
                const active = p.id === project.id;
                return (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className={
                      "rounded-xl px-3 py-2 text-sm font-medium " +
                      (active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-50")
                    }
                  >
                    {p.workspace.product.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="border-t border-zinc-200 px-5 py-4">
            <div className="text-xs font-semibold text-zinc-600">AI</div>

            <div className="mt-2">
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                placeholder="OpenAI API key"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-zinc-300"
              />
              <div className="mt-1 text-[11px] text-zinc-400">Stored locally. Used only for your requests.</div>
            </div>

            <div className="mt-3 grid gap-2">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as AIMode)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-300"
              >
                <option value="generate">Generate</option>
                <option value="critique">Critique</option>
                <option value="improve_strategy">Improve Strategy</option>
                <option value="suggest_roadmap">Suggest Roadmap</option>
              </select>

              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as AIScope)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-300"
              >
                <option value="full">Generate Product Analysis</option>
                <option value="strategy">Regenerate only Strategy</option>
                <option value="roadmap">Regenerate only Roadmap</option>
              </select>

              <button
                type="button"
                onClick={runAI}
                disabled={loading}
                className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-70"
              >
                {loading ? "Working…" : "Run AI"}
              </button>

              {err ? <div className="text-xs text-red-700">{err}</div> : null}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-8 py-8">
          <div className="mb-5">
            <div className="text-xs font-semibold text-zinc-500">Project</div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-900">{ws.product.name}</div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className={pill(tab === t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          {tab === "product" && (
            <div className="grid gap-4">
              <EditableText
                label="Product name"
                value={ws.product.name}
                onChange={(v) => patchWorkspace({ product: { ...ws.product, name: v } })}
              />
              <EditableText
                label="Overview"
                multiline
                value={ws.product.overview || ""}
                placeholder="What is this product?"
                onChange={(v) => patchWorkspace({ product: { ...ws.product, overview: v } })}
              />
              <EditableText
                label="Category"
                value={ws.product.category || ""}
                placeholder="Social network, DevTools, Payments…"
                onChange={(v) => patchWorkspace({ product: { ...ws.product, category: v } })}
              />
              <EditableText
                label="Business model"
                value={ws.product.business_model || ""}
                placeholder="Ads, Subscription, Usage-based…"
                onChange={(v) => patchWorkspace({ product: { ...ws.product, business_model: v } })}
              />
            </div>
          )}

          {tab === "users" && (
            <EditableStringList
              title="Target users"
              items={ws.users}
              placeholder="Creators, Small businesses, Students…"
              onChange={(users) => patchWorkspace({ users })}
            />
          )}

          {tab === "systems" && (
            <EditableStringList
              title="Key systems"
              items={ws.systems}
              placeholder="Feed ranking, Payments, Notifications…"
              onChange={(systems) => patchWorkspace({ systems })}
            />
          )}

          {tab === "features" && (
            <div className="grid gap-4">
              <EditableStringList
                title="Feature ideas (quick list)"
                items={(ws.features || []).map((f) => f.name)}
                placeholder="Reels, Stories, DMs…"
                onChange={(names) =>
                  patchWorkspace({
                    features: names.map((n, i) => ({
                      id: ws.features?.[i]?.id || `feat_${i}`,
                      name: n,
                      description: ws.features?.[i]?.description || "",
                      user_value: ws.features?.[i]?.user_value || "",
                    })),
                  })
                }
              />
              <div className="text-xs text-zinc-500">
                (Next step: richer feature cards. This keeps things editable + structured today.)
              </div>
            </div>
          )}

          {tab === "metrics" && (
            <div className="grid gap-4">
              <EditableStringList
                title="North star metric (names)"
                items={ws.metrics.north_star.map((m) => m.name)}
                placeholder="Weekly active creators…"
                onChange={(names) =>
                  patchWorkspace({
                    metrics: {
                      ...ws.metrics,
                      north_star: names.map((n, i) => ({
                        id: ws.metrics.north_star?.[i]?.id || `m_ns_${i}`,
                        name: n,
                        description: ws.metrics.north_star?.[i]?.description || "",
                        type: "north_star",
                      })),
                    },
                  })
                }
              />

              <EditableStringList
                title="Input metrics"
                items={ws.metrics.input.map((m) => m.name)}
                placeholder="Posts per creator per week…"
                onChange={(names) =>
                  patchWorkspace({
                    metrics: {
                      ...ws.metrics,
                      input: names.map((n, i) => ({
                        id: ws.metrics.input?.[i]?.id || `m_in_${i}`,
                        name: n,
                        description: ws.metrics.input?.[i]?.description || "",
                        type: "input",
                      })),
                    },
                  })
                }
              />

              <EditableStringList
                title="Business metrics"
                items={ws.metrics.business.map((m) => m.name)}
                placeholder="ARPU, CAC, Revenue…"
                onChange={(names) =>
                  patchWorkspace({
                    metrics: {
                      ...ws.metrics,
                      business: names.map((n, i) => ({
                        id: ws.metrics.business?.[i]?.id || `m_biz_${i}`,
                        name: n,
                        description: ws.metrics.business?.[i]?.description || "",
                        type: "business",
                      })),
                    },
                  })
                }
              />
            </div>
          )}

          {tab === "flows" && (
            <div className="grid gap-4">
              <EditableStringList
                title="Key user flows"
                items={ws.flows}
                placeholder="Onboarding → Follow → First post…"
                onChange={(flows) => patchWorkspace({ flows })}
              />
              <EditableStringList
                title="Loops"
                items={ws.loops}
                placeholder="Creator posts → viewer engagement → creator reward…"
                onChange={(loops) => patchWorkspace({ loops })}
              />
            </div>
          )}

          {tab === "competition" && (
            <EditableStringList
              title="Competitors (names)"
              items={(ws.competitors || []).map((c) => c.name)}
              placeholder="TikTok, Snapchat…"
              onChange={(names) =>
                patchWorkspace({
                  competitors: names.map((n, i) => ({
                    id: ws.competitors?.[i]?.id || `comp_${i}`,
                    name: n,
                    notes: ws.competitors?.[i]?.notes || "",
                    strengths: ws.competitors?.[i]?.strengths || [],
                    weaknesses: ws.competitors?.[i]?.weaknesses || [],
                  })),
                })
              }
            />
          )}

          {tab === "strategy" && (
            <div className="grid gap-4">
              <EditableText
                label="Positioning"
                multiline
                value={ws.strategy.positioning || ""}
                placeholder="How do we win?"
                onChange={(v) => patchWorkspace({ strategy: { ...ws.strategy, positioning: v } })}
              />
              <EditableStringList
                title="Strategic insights"
                items={ws.strategy.strategic_insights}
                placeholder="The biggest leverage is…"
                onChange={(strategic_insights) => patchWorkspace({ strategy: { ...ws.strategy, strategic_insights } })}
              />
              <EditableStringList
                title="What to build"
                items={ws.strategy.what_to_build}
                placeholder="Build X because…"
                onChange={(what_to_build) => patchWorkspace({ strategy: { ...ws.strategy, what_to_build } })}
              />
              <EditableStringList
                title="Key risks"
                items={ws.strategy.key_risks}
                placeholder="Risk: creator supply stalls…"
                onChange={(key_risks) => patchWorkspace({ strategy: { ...ws.strategy, key_risks } })}
              />
            </div>
          )}

          {tab === "experiments" && (
            <ExperimentsEditor experiments={ws.experiments} onChange={(experiments) => patchWorkspace({ experiments })} />
          )}

          {tab === "roadmap" && <RoadmapEditor items={ws.roadmap} onChange={(roadmap) => patchWorkspace({ roadmap })} />}
        </main>
      </div>
    </div>
  );
}
