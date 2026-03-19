import { z } from "zod";

/**
 * ProdLens structured workspace schema.
 * Keep it flexible, but NOT raw blobs.
 */

export const MetricSchema = z.object({
  id: z.string().optional().default(""),
  name: z.string(),
  description: z.string().optional().default(""),
  type: z.enum(["north_star", "input", "business"]).default("input"),
});

export const FeatureSchema = z.object({
  id: z.string().optional().default(""),
  name: z.string(),
  description: z.string().optional().default(""),
  user_value: z.string().optional().default(""),
});

export const CompetitorSchema = z.object({
  id: z.string().optional().default(""),
  name: z.string(),
  notes: z.string().optional().default(""),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
});

export const ExperimentSchema = z.object({
  id: z.string().optional().default(""),
  hypothesis: z.string(),
  target_users: z.array(z.string()).default([]),
  metrics: z.array(z.string()).default([]),
  status: z.enum(["idea", "planned", "running", "shipped", "killed"]).default("idea"),
});

export const RoadmapItemSchema = z.object({
  id: z.string().optional().default(""),
  title: z.string(),
  description: z.string().optional().default(""),
  group: z.enum(["now", "next", "later"]).default("next"),
  rice: z
    .object({
      reach: z.number().default(1),
      impact: z.number().default(1),
      confidence: z.number().default(0.5),
      effort: z.number().default(1),
    })
    .default({ reach: 1, impact: 1, confidence: 0.5, effort: 1 }),
});

export const StrategySchema = z.object({
  positioning: z.string().optional().default(""),
  strengths_to_double_down: z.array(z.string()).default([]),
  key_risks: z.array(z.string()).default([]),
  strategic_insights: z.array(z.string()).default([]),
  what_to_build: z.array(z.string()).default([]),
});

export const ProdLensWorkspaceSchema = z.object({
  product: z.object({
    name: z.string(),
    overview: z.string().optional().default(""),
    category: z.string().optional().default(""),
    business_model: z.string().optional().default(""),
  }),

  problem_space: z.object({
    problems: z.array(z.string()).default([]),
    jobs_to_be_done: z.array(z.string()).default([]),
  }),

  users: z.array(z.string()).default([]),
  systems: z.array(z.string()).default([]),
  features: z.array(FeatureSchema).default([]),

  metrics: z.object({
    north_star: z.array(MetricSchema).default([]),
    input: z.array(MetricSchema).default([]),
    business: z.array(MetricSchema).default([]),
  }),

  flows: z.array(z.string()).default([]),
  loops: z.array(z.string()).default([]),

  competitors: z.array(CompetitorSchema).default([]),

  strategy: StrategySchema,

  experiments: z.array(ExperimentSchema).default([]),
  roadmap: z.array(RoadmapItemSchema).default([]),
});

export type ProdLensWorkspace = z.infer<typeof ProdLensWorkspaceSchema>;
export type Feature = z.infer<typeof FeatureSchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type Competitor = z.infer<typeof CompetitorSchema>;
export type Experiment = z.infer<typeof ExperimentSchema>;
export type RoadmapItem = z.infer<typeof RoadmapItemSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  workspace: ProdLensWorkspaceSchema,
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectsDBSchema = z.object({
  version: z.number().default(1),
  projects: z.array(ProjectSchema).default([]),
});

export type ProjectsDB = z.infer<typeof ProjectsDBSchema>;

export function emptyWorkspace(productName: string): ProdLensWorkspace {
  return ProdLensWorkspaceSchema.parse({
    product: { name: productName },
    problem_space: { problems: [], jobs_to_be_done: [] },
    users: [],
    systems: [],
    features: [],
    metrics: { north_star: [], input: [], business: [] },
    flows: [],
    loops: [],
    competitors: [],
    strategy: {
      positioning: "",
      strengths_to_double_down: [],
      key_risks: [],
      strategic_insights: [],
      what_to_build: [],
    },
    experiments: [],
    roadmap: [],
  });
}
