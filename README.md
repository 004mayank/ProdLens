# ProdLens (Web)

ProdLens is an **AI-powered product intelligence tool** that runs **entirely in the browser**.

Users:
1) paste their **OpenAI API key** (stored locally in `localStorage`)
2) enter a **product name** (e.g., Instagram)
3) click **Analyze**
4) get a structured PM-style report:

- 📌 Overview
- 🧩 Features
- ⚔️ Competitors
- 📉 SWOT
- 💡 Strategy *(most important)*
- 🚀 What to Build

> No backend. No server actions. No hardcoded keys.

---

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- OpenAI via `fetch` (Responses API)

---

## Local setup

### 1) Install deps

```bash
npm install
```

### 2) Run dev server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Where the logic lives

- UI:
  - `app/page.tsx`
  - `app/components/InputForm.tsx`
  - `app/components/ResultTabs.tsx`
- OpenAI call + JSON parsing:
  - `lib/openai.ts`

---

## Notes

- Your API key is stored in the browser under: `prodlens.openaiKey`
- If output JSON occasionally fails, the app attempts to extract the first JSON object from the model response.
- Model can be changed in `lib/openai.ts`.

---

## Legacy

The previous local-Ollama Python prototype was moved to:
- `legacy_python_app/`
- `legacy_main.py`
- `legacy_requirements.txt`
