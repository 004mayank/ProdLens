import type { ProdLensWorkspace } from "@/lib/schema";

export type AIMode = "generate" | "critique" | "improve_strategy" | "suggest_roadmap";
export type AIScope = "full" | "strategy" | "roadmap";

export function masterPrompt(opts: {
  productName: string;
  mode: AIMode;
  scope: AIScope;
  current?: ProdLensWorkspace | null;
}) {
  const { productName, mode, scope, current } = opts;

  const modeGuide: Record<AIMode, string> = {
    generate: "Generate high-signal structured content.",
    critique: "Critique the current state: call out gaps, weak assumptions, missing metrics, and unclear strategy.",
    improve_strategy: "Improve strategy: refine positioning, opportunities, risks, and what-to-build recommendations.",
    suggest_roadmap: "Suggest a pragmatic roadmap with RICE fields and Now/Next/Later grouping.",
  };

  const scopeGuide: Record<AIScope, string> = {
    full: "Return a FULL workspace JSON object.",
    strategy: "Return ONLY: { strategy: {...} }.",
    roadmap: "Return ONLY: { roadmap: [...] }.",
  };

  return `You are a senior product manager and strategist.

Product: ${productName}
Mode: ${mode}

${modeGuide[mode]}

${scopeGuide[scope]}

Hard rules:
- Return STRICT JSON only. No markdown. No backticks. No commentary.
- Use concise bullet-like strings.
- Keep recommendations specific and actionable.
- For roadmap items include: group (now|next|later) and rice {reach, impact, confidence, effort}.

If current workspace is provided, treat it as source-of-truth and improve it rather than replacing everything.

Current workspace (may be empty):
${current ? JSON.stringify(current) : "null"}

Schema expectations (high level):
{
  product: { name, overview, category, business_model },
  problem_space: { problems: [], jobs_to_be_done: [] },
  users: [],
  systems: [],
  features: [{id,name,description,user_value}],
  metrics: { north_star: [{id,name,description,type}], input: [...], business: [...] },
  flows: [],
  loops: [],
  competitors: [{id,name,notes,strengths,weaknesses}],
  strategy: { positioning, strengths_to_double_down, key_risks, strategic_insights, what_to_build },
  experiments: [{id,hypothesis,target_users,metrics,status}],
  roadmap: [{id,title,description,group,rice:{reach,impact,confidence,effort}}]
}
`;
}
