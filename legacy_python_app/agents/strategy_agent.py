"""Strategy Agent (MOST IMPORTANT).

Generates opportunity analysis and what-to-build-next recommendations.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict

from app.core import prompts
from app.llm.ollama_client import OllamaClient


@dataclass
class StrategyAgent:
    llm: OllamaClient

    def run(self, *, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = prompts.STRATEGY_PROMPT.format(
            context=json.dumps(context, ensure_ascii=False, indent=2)
        )
        text = self.llm.generate(prompt=prompt, system=prompts.SYSTEM_BASE, temperature=0.35)
        return _safe_json(text, fallback={"strategic_insights": [], "recommended_bets": [], "narrative": ""})


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
