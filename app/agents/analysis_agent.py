"""Analysis Agent.

Turns raw research notes into structured product understanding.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict

from app.core import prompts
from app.llm.ollama_client import OllamaClient


@dataclass
class AnalysisAgent:
    llm: OllamaClient

    def run(self, *, product_name: str, research_notes: str) -> Dict[str, Any]:
        prompt = prompts.ANALYSIS_PROMPT.format(research_notes=research_notes)
        text = self.llm.generate(prompt=prompt, system=prompts.SYSTEM_BASE, temperature=0.2)
        return _safe_json(text, fallback={
            "product_overview": f"{product_name} (overview unavailable; model returned non-JSON).",
            "target_users": [],
            "value_proposition": "",
            "positioning": "",
            "core_features": [],
            "business_model_hypothesis": "",
        })


def _safe_json(text: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    raw = (text or "").strip()
    if not raw:
        return fallback

    try:
        return json.loads(raw)
    except Exception:
        # Try to extract a JSON object from the output.
        import re

        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            return fallback
        try:
            return json.loads(m.group(0))
        except Exception:
            return fallback
