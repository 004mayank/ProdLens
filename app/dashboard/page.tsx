"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProjects } from "@/components/ProjectsProvider";
import { ApiKeyCard } from "@/components/settings/ApiKeyCard";
import { ThemeToggle } from "@/components/settings/ThemeToggle";

export default function DashboardPage() {
  const { hydrated, projects, create, remove } = useProjects();
  const [name, setName] = useState("");

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)),
    [projects]
  );

  function onCreate() {
    const n = name.trim();
    if (!n) return;
    const p = create(n);
    setName("");
    // navigate via link click fallback
    window.location.href = `/project/${p.id}`;
  }

  return (
    <div className="min-h-dvh">
      <header className="pl-card sticky top-0 z-10 border-b backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="text-sm font-semibold">ProdLens</div>
            <div className="pl-muted text-xs">Projects dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/analyze" className="pl-muted text-xs font-medium hover:opacity-90">
              Single analysis →
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6">
          <ApiKeyCard />

          <div className="pl-card rounded-2xl p-5 shadow-sm">
            <div className="text-sm font-semibold">Create a project</div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Instagram"
                className="pl-input w-full flex-1 rounded-xl px-4 py-3 text-sm outline-none placeholder:opacity-70 focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={onCreate}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Create
              </button>
            </div>
            <div className="pl-muted mt-2 text-xs">Projects are stored locally in your browser.</div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold">Your projects</div>

            {!hydrated ? (
              <div className="pl-muted text-sm">Loading…</div>
            ) : sorted.length === 0 ? (
              <div className="pl-card rounded-2xl border-dashed p-8 text-sm pl-muted">
                No projects yet. Create one above.
              </div>
            ) : (
              <div className="grid gap-3">
                {sorted.map((p) => (
                  <div
                    key={p.id}
                    className="pl-card flex items-center justify-between gap-4 rounded-2xl p-4 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-semibold">{p.workspace.product.name}</div>
                      <div className="pl-muted text-xs">
                        Updated {new Date(p.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/project/${p.id}`}
                        className="pl-card rounded-xl px-4 py-2 text-xs font-semibold hover:opacity-90"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this project? This cannot be undone.")) remove(p.id);
                        }}
                        className="pl-card rounded-xl px-4 py-2 text-xs font-semibold hover:opacity-90"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
