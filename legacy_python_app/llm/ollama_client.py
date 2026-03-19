"""Ollama client wrapper.

Local-first: calls your locally running Ollama daemon (default: http://localhost:11434).
Docs: https://github.com/ollama/ollama/blob/main/docs/api.md

This module is intentionally small and swappable.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import requests


class OllamaError(RuntimeError):
    pass


@dataclass
class OllamaClient:
    base_url: str = "http://localhost:11434"
    model: str = "llama3"
    timeout_s: int = 120

    def generate(
        self,
        prompt: str,
        *,
        system: Optional[str] = None,
        temperature: float = 0.2,
        num_predict: int = 900,
    ) -> str:
        """Generate a completion.

        Uses /api/generate (non-chat) for broad compatibility.
        """

        url = f"{self.base_url.rstrip('/')}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": num_predict,
            },
        }
        if system:
            payload["system"] = system

        try:
            resp = requests.post(url, json=payload, timeout=self.timeout_s)
        except requests.RequestException as e:
            raise OllamaError(
                "Failed to reach Ollama. Is it running? Try: `ollama serve`"
            ) from e

        if resp.status_code != 200:
            raise OllamaError(
                f"Ollama generate failed ({resp.status_code}): {resp.text[:400]}"
            )

        data = resp.json()
        text = (data.get("response") or "").strip()
        if not text:
            raise OllamaError("Empty response from Ollama.")
        return text
