"""Search tool.

Local-first note: We avoid hard dependency on external search APIs.
For production you can swap this for:
- local enterprise knowledge base
- a paid search API
- self-hosted SearxNG

For now we use a tiny heuristic "source set" builder.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from .scraper import wikipedia_url


@dataclass
class SearchTool:
    """Returns a small list of candidate URLs.

    This is intentionally conservative to keep scraping light.
    """

    def find_sources(self, product_name: str) -> List[str]:
        urls: List[str] = []

        w = wikipedia_url(product_name)
        if w:
            urls.append(w)

        # Add a few "likely" official pages (best-effort, may 404).
        # You can improve this with a real search integration later.
        if product_name.lower() in {"instagram", "threads", "whatsapp", "facebook"}:
            urls.append("https://about.instagram.com/")

        return urls
