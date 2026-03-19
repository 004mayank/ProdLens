import type { ProdLensWorkspace } from "@/lib/schema";

function newId(prefix: string) {
  // Works in both Node and Edge runtime.
  const id = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : String(Date.now());
  return `${prefix}_${id}`;
}

export function ensureWorkspaceIds(ws: ProdLensWorkspace): ProdLensWorkspace {
  return {
    ...ws,
    features: (ws.features || []).map((f) => ({
      ...f,
      id: f.id?.trim() ? f.id : newId("feat"),
    })),
    competitors: (ws.competitors || []).map((c) => ({
      ...c,
      id: c.id?.trim() ? c.id : newId("comp"),
    })),
    experiments: (ws.experiments || []).map((e) => ({
      ...e,
      id: e.id?.trim() ? e.id : newId("exp"),
    })),
    roadmap: (ws.roadmap || []).map((r) => ({
      ...r,
      id: r.id?.trim() ? r.id : newId("roadmap"),
    })),
    metrics: {
      north_star: (ws.metrics.north_star || []).map((m) => ({
        ...m,
        id: m.id?.trim() ? m.id : newId("m_ns"),
      })),
      input: (ws.metrics.input || []).map((m) => ({
        ...m,
        id: m.id?.trim() ? m.id : newId("m_in"),
      })),
      business: (ws.metrics.business || []).map((m) => ({
        ...m,
        id: m.id?.trim() ? m.id : newId("m_biz"),
      })),
    },
  };
}
