# ProdLens

**ProdLens** is a **production-minded, local-first AI Product Intelligence Agent**.

- Input: product name (e.g., `Instagram`)
- Output (terminal report):
  - 📌 Product overview
  - 🧩 Features
  - ⚔️ Competitors
  - 📉 SWOT
  - 💡 Strategic insights *(most important)*
  - 🚀 Suggested features *(what to build next)*

This is designed to feel like a **real PM tool**, not a chatbot.

---

## Why local-first?

- Runs fully locally using **Ollama**
- Uses a small **Python** backend
- No OpenAI dependency

---

## Architecture (multi-agent)

`main.py` → `Orchestrator` → agents:

1. **Research Agent**: gathers raw notes (mock data + optional light scraping)
2. **Analysis Agent**: extracts structured understanding (features, users, positioning)
3. **Competitor Agent**: identifies competitors + comparisons
4. **Strategy Agent (MOST IMPORTANT)**: opportunities + what-to-build-next

Bonus:
- **Memory**: local ChromaDB store of past reports

---

## Project structure

```
prodlens/
│
├── app/
│   ├── agents/
│   │   ├── research_agent.py
│   │   ├── analysis_agent.py
│   │   ├── competitor_agent.py
│   │   └── strategy_agent.py
│   │
│   ├── core/
│   │   ├── orchestrator.py
│   │   ├── config.py
│   │   └── prompts.py
│   │
│   ├── llm/
│   │   └── ollama_client.py
│   │
│   ├── memory/
│   │   └── vector_store.py
│   │
│   ├── tools/
│   │   ├── search.py
│   │   └── scraper.py
│
├── main.py
├── requirements.txt
└── README.md
```

---

## Setup

### 1) Install Ollama

- macOS: `brew install ollama`
- Or download: https://ollama.com

Start it:

```bash
ollama serve
```

### 2) Pull a local model

Recommended default:

```bash
ollama pull llama3
```

Alternative:

```bash
ollama pull mistral
```

### 3) Create a virtualenv + install deps

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

> Note on memory: ChromaDB uses embeddings via `sentence-transformers`, which may download a small embedding model on first run.

---

## Run

```bash
python main.py "Instagram"
```

Choose model:

```bash
python main.py "Instagram" --model mistral
```

---

## Example output (short)

```
ProdLens Report
Instagram

📌 Product Overview
...

🧩 Features
...

⚔️ Competitors
...

📉 SWOT
...

💡 Strategic Insights
...

🚀 Suggested Features
...
```

---

## Notes / Next improvements

- Replace `SearchTool` with a real local knowledge base or self-hosted search (SearxNG)
- Add better source citation handling
- Add caching + structured persistence (SQLite)
- Add an interactive TUI
