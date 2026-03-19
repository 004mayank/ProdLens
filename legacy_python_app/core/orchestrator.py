"""Orchestrator.

Controls the end-to-end multi-agent flow:
1) Research -> raw notes
2) Analysis -> structured insights
3) Competitor -> comparison
4) SWOT -> strengths/weaknesses/opportunities/threats
5) Strategy -> recommendations (MOST IMPORTANT)

Returns a single formatted report string for terminal output.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from app.agents.analysis_agent import AnalysisAgent
from app.agents.competitor_agent import CompetitorAgent
from app.agents.research_agent import ResearchAgent
from app.agents.strategy_agent import StrategyAgent
from app.core import prompts
from app.llm.ollama_client import OllamaClient
from app.memory.vector_store import VectorStore


@dataclass
class Orchestrator:
    llm: OllamaClient
    memory: VectorStore
    settings: Any

    def run(self, product_name: str) -> str:
        # Agents
        research_agent = ResearchAgent(settings=self.settings)
        analysis_agent = AnalysisAgent(llm=self.llm)
        competitor_agent = CompetitorAgent(llm=self.llm)
        strategy_agent = StrategyAgent(llm=self.llm)

        # 1) Research
        research_notes = research_agent.run(product_name)

        # 2) Analysis
        analysis = analysis_agent.run(product_name=product_name, research_notes=research_notes)

        # 3) Competitors
        competitors = competitor_agent.run(product_name=product_name, analysis_json=analysis)

        # 4) SWOT (small helper call)
        swot = self._swot(context={
            "product_name": product_name,
            "analysis": analysis,
            "competitors": competitors,
            "research_notes_excerpt": research_notes[:2200],
        })

        # 5) Strategy
        strategy = strategy_agent.run(context={
            "product_name": product_name,
            "analysis": analysis,
            "competitors": competitors,
            "swot": swot,
        })

        report = self._format_report(
            product_name=product_name,
            analysis=analysis,
            competitors=competitors,
            swot=swot,
            strategy=strategy,
        )

        # Persist to memory (best-effort)
        self.memory.upsert_report(product_name=product_name, report_text=report)

        return report

    def _swot(self, *, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = prompts.SWOT_PROMPT.format(context=json.dumps(context, ensure_ascii=False, indent=2))
        text = self.llm.generate(prompt=prompt, system=prompts.SYSTEM_BASE, temperature=0.25)

        # Safe JSON parse
        try:
            return json.loads(text)
        except Exception:
            import re

            m = re.search(r"\{[\s\S]*\}", (text or ""))
            if not m:
                return {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}
            try:
                return json.loads(m.group(0))
            except Exception:
                return {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []}

    def _format_report(
        self,
        *,
        product_name: str,
        analysis: Dict[str, Any],
        competitors: Dict[str, Any],
        swot: Dict[str, Any],
        strategy: Dict[str, Any],
    ) -> str:
        """Build a clean terminal-friendly report.

        We use Rich to render, but ultimately return a plain string for easy printing.
        """

        console = Console(record=True, width=100)

        console.print(Panel.fit(f"[bold]ProdLens Report[/bold]\n[dim]{product_name}[/dim]", border_style="cyan"))

        # 📌 Product Overview
        console.print("\n[bold]📌 Product Overview[/bold]")
        console.print(analysis.get("product_overview", ""))
        vp = analysis.get("value_proposition")
        if vp:
            console.print(f"\n[bold]Value prop:[/bold] {vp}")
        pos = analysis.get("positioning")
        if pos:
            console.print(f"[bold]Positioning:[/bold] {pos}")

        # 🧩 Features
        console.print("\n[bold]🧩 Features[/bold]")
        feats = analysis.get("core_features") or []
        if feats:
            t = Table(show_header=True, header_style="bold magenta")
            t.add_column("Feature")
            t.add_column("Description")
            t.add_column("User value")
            for f in feats[:12]:
                t.add_row(str(f.get("name", "")), str(f.get("description", "")), str(f.get("user_value", "")))
            console.print(t)
        else:
            console.print("[dim]No features extracted.[/dim]")

        # ⚔️ Competitors
        console.print("\n[bold]⚔️ Competitors[/bold]")
        comps = competitors.get("competitors") or []
        for c in comps[:8]:
            console.print(f"- [bold]{c.get('name','')}[/bold]: {c.get('why_competitor','')}")

        # 📉 SWOT
        console.print("\n[bold]📉 SWOT[/bold]")
        def bullets(title: str, items: Any):
            console.print(f"[bold]{title}[/bold]")
            for it in (items or [])[:8]:
                console.print(f"  - {it}")

        bullets("Strengths", swot.get("strengths"))
        bullets("Weaknesses", swot.get("weaknesses"))
        bullets("Opportunities", swot.get("opportunities"))
        bullets("Threats", swot.get("threats"))

        # 💡 Strategic Insights
        console.print("\n[bold]💡 Strategic Insights[/bold]")
        for ins in (strategy.get("strategic_insights") or [])[:8]:
            console.print(f"- [bold]{ins.get('title','')}[/bold]: {ins.get('why_it_matters','')}")

        # 🚀 Suggested Features
        console.print("\n[bold]🚀 Suggested Features[/bold]")
        bets = strategy.get("recommended_bets") or []
        if bets:
            t2 = Table(show_header=True, header_style="bold green")
            t2.add_column("Timing", style="dim", width=8)
            t2.add_column("Feature")
            t2.add_column("Why (user problem)")
            t2.add_column("Differentiation")
            t2.add_column("Success metrics")
            for b in bets[:10]:
                t2.add_row(
                    str(b.get("timing", "")),
                    str(b.get("feature", "")),
                    str(b.get("user_problem", "")),
                    str(b.get("differentiation", "")),
                    " • ".join(list(b.get("success_metrics", []) or [])[:3]),
                )
            console.print(t2)
        else:
            console.print("[dim]No recommendations generated.[/dim]")

        narrative = (strategy.get("narrative") or "").strip()
        if narrative:
            console.print("\n[bold]Narrative[/bold]")
            console.print(narrative)

        return console.export_text()
