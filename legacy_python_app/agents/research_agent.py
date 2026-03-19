"""Research Agent.

Collects raw product info.
- Uses mock data as fallback
- Optionally scrapes a small set of sources

The output is intentionally "raw notes" that downstream agents will structure.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from app.core.config import Settings
from app.tools.search import SearchTool
from app.tools.scraper import SimpleScraper


MOCK_KB = {
    "instagram": {
        "summary": [
            "Instagram is a social media platform focused on photo/video sharing.",
            "Core surfaces include Feed, Stories, Reels, Explore, and Direct Messages.",
            "Monetization is primarily advertising plus creator/business tools.",
        ],
        "features": [
            "Feed posts", "Stories", "Reels", "Explore", "DMs", "Live", "Shopping"
        ],
        "sources": [
            "https://about.instagram.com/",
            "https://en.wikipedia.org/wiki/Instagram",
        ],
    }
}


@dataclass
class ResearchAgent:
    settings: Settings

    def run(self, product_name: str) -> str:
        product_key = product_name.strip().lower()

        search = SearchTool()
        urls = search.find_sources(product_name)

        notes: List[str] = []
        sources: List[str] = []

        # Try scraping minimal sources (best-effort).
        scraper = SimpleScraper(user_agent=self.settings.user_agent)
        for url in urls:
            try:
                text = scraper.fetch_text(url)
                notes.append(f"SOURCE: {url}\n{text}\n")
                sources.append(url)
            except Exception:
                # Ignore scraping failures; we have mock fallback.
                continue

        if not notes:
            # Fallback mock knowledge.
            mock = MOCK_KB.get(product_key)
            if mock:
                notes.append("MOCK DATA (offline fallback)")
                notes.extend(mock["summary"])
                notes.append("Notable features: " + ", ".join(mock["features"]))
                sources.extend(mock.get("sources", []))
            else:
                notes.append(
                    "MOCK DATA (offline fallback): No specific KB entry found. "
                    "Proceeding with generic assumptions."
                )
                notes.append(
                    f"Product appears to be: {product_name}. "
                    "Assume it is a consumer SaaS product; validate with real sources."
                )

        out = []
        out.append(f"- Product: {product_name}")
        out.append("- Summary bullets")
        for ln in notes[:6]:
            out.append(f"  - {ln[:240]}")
        out.append("- Key facts")
        out.append("  - (See sources text below)")
        out.append("- Notable features mentioned")
        out.append("  - (Extracted by Analysis Agent)")
        out.append("- Sources")
        for s in sorted(set(sources)):
            out.append(f"  - {s}")
        out.append("\n---\n")
        out.append("\n\n".join(notes)[:24000])

        return "\n".join(out).strip()
