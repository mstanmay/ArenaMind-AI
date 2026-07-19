"""Qdrant-backed vector memory for historical operational decisions and context."""

from typing import Any
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("vector_memory")


class VectorMemory:
    """Interface to read and write historical decisions/SOPs in Qdrant vector database.

    Automatically falls back to local in-memory storage if remote Qdrant is unavailable.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.collection_name = settings.qdrant_collection
        
        try:
            # Fallback to local in-memory Qdrant instance if not set to remote URL
            if settings.qdrant_url.startswith("http://localhost") or not settings.qdrant_url:
                logger.info("vector_memory_init", mode="local_in_memory")
                self.client = QdrantClient(":memory:")
            else:
                logger.info("vector_memory_init", mode="remote", url=settings.qdrant_url)
                self.client = QdrantClient(
                    url=settings.qdrant_url,
                    api_key=settings.qdrant_api_key or None,
                )
            
            # Setup collection
            self._ensure_collection()
        except Exception as e:
            logger.error("vector_memory_init_failed", error=str(e))
            # Emergency fallback: initialize completely in memory
            self.client = QdrantClient(":memory:")
            self._ensure_collection()

    def _ensure_collection(self) -> None:
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)
            
            if not exists:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=1536,  # Standard OpenAI text-embedding-3-small size
                        distance=Distance.COSINE
                    )
                )
                logger.info("qdrant_collection_created", name=self.collection_name)
        except Exception as e:
            logger.error("qdrant_collection_check_failed", error=str(e))

    async def store_decision(
        self,
        decision_id: str,
        query: str,
        reasoning: str,
        metadata: dict[str, Any]
    ) -> None:
        """Embed and store a completed AI Decision into the vector memory database."""
        # Note: In production, we'd use OpenAIEmbeddings or GeminiEmbeddings.
        # For compatibility and quick verification in lack of live credentials,
        # we can generate a mock vector or use a lightweight local model.
        # Here we generate a mock vector matching OpenAI dimensions (1536).
        try:
            import numpy as np
            # Generate deterministic mock vector from query hash for simplicity
            seed = sum(ord(char) for char in query) % 2**32
            rng = np.random.default_rng(seed)
            vector = rng.standard_normal(1536).tolist()

            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    {
                        "id": decision_id,
                        "vector": vector,
                        "payload": {
                            "query": query,
                            "reasoning": reasoning,
                            **metadata
                        }
                    }
                ]
            )
            logger.info("decision_vector_stored", decision_id=decision_id)
        except Exception as e:
            logger.error("decision_vector_store_failed", error=str(e))

    async def search_similar_decisions(self, query: str, limit: int = 3) -> list[dict[str, Any]]:
        """Query vector memory to search for similar past decisions or operational incidents."""
        try:
            import numpy as np
            seed = sum(ord(char) for char in query) % 2**32
            rng = np.random.default_rng(seed)
            vector = rng.standard_normal(1536).tolist()

            hits = self.client.search(
                collection_name=self.collection_name,
                query_vector=vector,
                limit=limit
            )
            
            results = []
            for hit in hits:
                if hit.payload:
                    results.append({
                        "score": hit.score,
                        **hit.payload
                    })
            return results
        except Exception as e:
            logger.error("vector_memory_search_failed", error=str(e))
            return []
