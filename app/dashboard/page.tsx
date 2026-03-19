"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProjects } from "@/components/ProjectsProvider";

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
    <div className="min-h-dvh bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-sm font-semibold text-zinc-900">ProdLens</div>
            <div className="text-xs text-zinc-500">Projects dashboard</div>
          </div>
          <Link href="/analyze" className="text-xs font-medium text-zinc-600 hover:text-zinc-900">
            Single analysis →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold text-zinc-900">Create a project</div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Instagram"
                className="w-full flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-300"
              />
              <button
                type="button"
                onClick={onCreate}
                className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Create
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-500">Projects are stored locally in your browser.</div>
          </div>

          <div>
            <div className="mb-3 text-sm font-semibold text-zinc-900">Your projects</div>

            {!hydrated ? (
              <div className="text-sm text-zinc-500">Loading…</div>
            ) : sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600">
                No projects yet. Create one above.
              </div>
            ) : (
              <div className="grid gap-3">
                {sorted.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{p.workspace.product.name}</div>
                      <div className="text-xs text-zinc-500">
                        Updated {new Date(p.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/project/${p.id}`}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this project? This cannot be undone.")) remove(p.id);
                        }}
                        className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
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
