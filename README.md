# ProdLens

**AI Product Intelligence Agent**
Turn any product into insights, strategy, and execution plans.

---

## Overview

ProdLens is an agentic AI system that analyzes products and generates:

* PRDs (Product Requirement Docs)
* Feature breakdowns
* Competitor analysis
* Market insights
* Strategic recommendations

Built for **Product Managers, Founders, and Builders**.

---

## ⚡ How It Works

Input a product name:

```bash
Instagram
```

ProdLens will:

1. Research the product
2. Analyze features & positioning
3. Identify competitors
4. Generate strategic insights
5. Output structured PRD

---

## Core Idea

This is not just an AI summarizer.

ProdLens answers:

> “Given this product, what should I build?”

---

## Architecture

```text
User Input
   ↓
Orchestrator (LangGraph)
   ↓
--------------------------------
| Research Agent               |
| Analysis Agent               |
| Competitor Agent             |
| Strategy Agent               |
--------------------------------
   ↓
Structured Output (Insights + PRD)
```

---

## Tech Stack

* LLM: OpenAI GPT / Claude
* Agents: LangGraph / CrewAI
* Backend: FastAPI (Python)
* Vector DB: ChromaDB
* Search: Tavily / SerpAPI
* Frontend: Next.js / Streamlit

---

## Example Output

For input: **Instagram**

* Product Overview
* Core Features (Feed, Stories, Reels)
* Competitor Comparison (TikTok, Snapchat)
* SWOT Analysis
* Strategic Opportunities
* Suggested Features

---

## Roadmap

* [ ] MVP: Product summary + competitors
* [ ] PRD generation
* [ ] Multi-agent system
* [ ] Strategy engine (core differentiator)
* [ ] UI dashboard
* [ ] Memory + saved insights

---

## Vision

To become the **default AI tool for product thinking**.

---

## Contributing

Open to contributions, ideas, and feedback.

---

## Support

If you find this useful, consider starring the repo ⭐
