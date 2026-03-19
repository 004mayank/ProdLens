"""Central configuration for ProdLens.

Keep config small and explicit. Prefer env vars for overrides.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    # Ollama
    ollama_base_url: str = os.getenv("PRODLENS_OLLAMA_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("PRODLENS_OLLAMA_MODEL", "llama3")

    # ChromaDB
    chroma_dir: str = os.getenv("PRODLENS_CHROMA_DIR", ".prodlens_chroma")
    chroma_collection: str = os.getenv("PRODLENS_CHROMA_COLLECTION", "prodlens_reports")

    # Runtime
    user_agent: str = os.getenv(
        "PRODLENS_USER_AGENT",
        "ProdLens/1.0 (local-first; +https://github.com/004mayank/ProdLens)",
    )


settings = Settings()
