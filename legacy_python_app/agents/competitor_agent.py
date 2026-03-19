"""Competitor Agent.

Identifies competitors and compares along meaningful axes.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict

from app.core import prompts
from app.llm.ollama_client import OllamaClient


@dataclass
class CompetitorAgent:
    llm: OllamaClient

    def run(self, *, product_name: str, analysis_json: Dict[str, Any]) -> Dict[str, Any]:
        prompt = prompts.COMPETITOR_PROMPT.format(
            product_name=product_name,
            analysis_json=json.dumps(analysis_json, ensure_ascii=False, indent=2),
        )
        text = self.llm.generate(prompt=prompt, system=prompts.SYSTEM_BASE, temperature=0.3)
        return _safe_json(text, fallback={"competitors": [], "comparison_axes": [], "comparison_table": []})


def _safe_json(text: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    raw = (text or "").strip()
    if not raw:
        return fallback

    try:
        return json.loads(raw)
    except Exception:
        import re

        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            return fallback
        try:
            return json.loads(m.group(0))
        except Exception:
            return fallback
