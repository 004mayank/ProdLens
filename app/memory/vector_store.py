"""Local memory via ChromaDB.

Stores past ProdLens reports so future runs can reuse context.

Note: Chroma uses embeddings. We default to a SentenceTransformer embedding
function, which may download a small model the first time you run it.
If that fails (offline / no torch), we degrade gracefully to a no-op store.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class MemoryResult:
    documents: List[str]
    metadatas: List[Dict[str, Any]]


class VectorStore:
    def __init__(self, persist_dir: str, collection_name: str):
        self.persist_dir = persist_dir
        self.collection_name = collection_name

        self._enabled = False
        self._col = None

        try:
            import chromadb
            from chromadb.config import Settings
            from chromadb.utils.embedding_functions import (
                SentenceTransformerEmbeddingFunction,
            )

            client = chromadb.PersistentClient(
                path=persist_dir,
                settings=Settings(anonymized_telemetry=False),
            )

            embed = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
            self._col = client.get_or_create_collection(
                name=collection_name,
                embedding_function=embed,
            )
            self._enabled = True
        except Exception:
            # Memory is a bonus. Don't block the app if embeddings aren't available.
            self._enabled = False
            self._col = None

    @property
    def enabled(self) -> bool:
        return self._enabled

    def upsert_report(self, *, product_name: str, report_text: str) -> None:
        if not self._enabled or not self._col:
            return

        doc_id = f"report:{product_name.strip().lower()}"
        self._col.upsert(
            ids=[doc_id],
            documents=[report_text],
            metadatas=[{"product": product_name}],
        )

    def query(self, *, product_name: str, query: str, k: int = 3) -> Optional[MemoryResult]:
        if not self._enabled or not self._col:
            return None

        res = self._col.query(
            query_texts=[query],
            n_results=k,
            where={"product": product_name},
        )

        docs = (res.get("documents") or [[]])[0]
        metas = (res.get("metadatas") or [[]])[0]
        return MemoryResult(documents=docs, metadatas=metas)
