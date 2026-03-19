# ProdLens — Product Management Suite (local-first)

ProdLens is a **stateful, production-minded PM workspace**.

Instead of dumping static AI text, it maintains a structured project state you can **edit and evolve**:

- Product
- Users
- Systems
- Features
- Metrics
- Flows
- Competition
- Strategy *(most important)*
- Experiments
- Roadmap (with **RICE** prioritization)

It’s designed to feel like a real PM tool (Notion/Linear vibe), but stays simple and local-first.

---

## What’s inside

### 1) Projects dashboard
- Create multiple projects
- Open a project workspace
- Delete projects

### 2) Structured state (critical)
All UI reads/writes from a typed workspace schema:

```ts
// lib/schema.ts
{
  product: {},
  problem_space: {},
  users: [],
  systems: [],
  features: [],
  metrics: {},
  flows: [],
  loops: [],
  competitors: [],
  strategy: {},
  experiments: [],
  roadmap: []
}
```

Persistence is **localStorage** (v1) via `lib/storage.ts`.

### 3) AI generation layer (server route)
- Master prompt produces structured JSON
- Supports modes:
  - Generate
  - Critique
  - Improve Strategy
  - Suggest Roadmap
- Supports partial regeneration:
  - Full workspace
  - Strategy only
  - Roadmap only

Route:
- `POST /api/ai/generate` (expects `{ apiKey, productName, mode, scope, current }`)

> Important: API key is **user-provided** and is **not** stored on the server. It’s sent per-request.

### 4) Editable UI
- Inline edits (blur-to-save)
- Add/remove list items
- Experiments CRUD
- Roadmap CRUD + RICE scoring (auto priority)

---

## Tech

- Next.js (App Router)
- React + TypeScript
- TailwindCSS
- Zod (schema validation)
- OpenAI Responses API

---

## Routes

- `/dashboard` — Projects list + create
- `/project/[id]` — Stateful PM workspace
- `/analyze` — One-off analysis (legacy-style)

---

## Local setup

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000/dashboard

---

## Key files

- Schema:
  - `lib/schema.ts`
- Persistence:
  - `lib/storage.ts`
  - `components/ProjectsProvider.tsx`
- AI:
  - `lib/ai/prompts.ts`
  - `app/api/ai/generate/route.ts`
- UI:
  - `app/dashboard/page.tsx`
  - `app/project/[id]/page.tsx`
  - `components/editable/*`
  - `components/workspace/*`

---

## Legacy

Older prototypes are preserved:
- Ollama/Python prototype: `legacy_python_app/`, `legacy_main.py`
- Single-page analysis: `/analyze`
