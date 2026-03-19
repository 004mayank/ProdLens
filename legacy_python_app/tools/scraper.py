"""Very small web scraper.

ProdLens can run fully local with mock data, but can also enrich results
using lightweight scraping when internet is available.

We intentionally keep this minimal (no headless browser).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import requests
from bs4 import BeautifulSoup


@dataclass
class SimpleScraper:
    user_agent: str
    timeout_s: int = 15

    def fetch_text(self, url: str, *, max_chars: int = 12000) -> str:
        headers = {"User-Agent": self.user_agent}
        resp = requests.get(url, headers=headers, timeout=self.timeout_s)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove scripts/styles
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        text = soup.get_text("\n")
        # Normalize whitespace
        lines = [ln.strip() for ln in text.splitlines()]
        cleaned = "\n".join([ln for ln in lines if ln])
        return cleaned[:max_chars]


def wikipedia_url(product_name: str) -> Optional[str]:
    slug = product_name.strip().replace(" ", "_")
    if not slug:
        return None
    return f"https://en.wikipedia.org/wiki/{slug}"
