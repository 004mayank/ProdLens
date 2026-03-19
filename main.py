"""ProdLens CLI.

Usage:
  python main.py "Instagram"

Requirements:
- Ollama running locally
- Model pulled (default: llama3)
"""

from __future__ import annotations

import argparse

from app.core.config import settings
from app.core.orchestrator import Orchestrator
from app.llm.ollama_client import OllamaClient
from app.memory.vector_store import VectorStore


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="ProdLens — local-first AI Product Intelligence Agent")
    p.add_argument("product", help="Product name (e.g., Instagram)")
    p.add_argument("--model", default=settings.ollama_model, help="Ollama model (default: llama3)")
    p.add_argument("--ollama", default=settings.ollama_base_url, help="Ollama base URL")
    return p.parse_args()


def main() -> None:
    args = parse_args()

    llm = OllamaClient(base_url=args.ollama, model=args.model)
    memory = VectorStore(persist_dir=settings.chroma_dir, collection_name=settings.chroma_collection)

    orch = Orchestrator(llm=llm, memory=memory, settings=settings)
    report = orch.run(args.product)
    print(report)


if __name__ == "__main__":
    main()
