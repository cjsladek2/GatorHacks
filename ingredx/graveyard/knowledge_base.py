# ingredx/core/knowledge_base.py
from __future__ import annotations
import json
from typing import Dict, List
from ingredx.core.models import IngredientRecord, KnowledgeBaseConfig


class KnowledgeBase:
    """Loads and indexes ingredient records from a JSON knowledge base."""

    def __init__(self, cfg: KnowledgeBaseConfig):
        self.cfg = cfg
        self._by_id: Dict[str, IngredientRecord] = {}
        self._names: List[str] = []
        self._name_to_id: Dict[str, str] = {}
        self._load()

    def _load(self) -> None:
        """Load ingredient data from JSON and index by id/name/synonyms."""
        with open(self.cfg.json_path, "r", encoding="utf-8") as f:
            raw = json.load(f)
            for item in raw:
                rec = IngredientRecord(**item)
                self._by_id[rec.id] = rec

                # index canonical name and synonyms (lowercased)
                for nm in [rec.name] + rec.synonyms:
                    key = nm.strip().lower()
                    if key:
                        self._name_to_id[key] = rec.id
                        self._names.append(key)

    def get(self, rec_id: str) -> IngredientRecord | None:
        """Retrieve a record by its internal id."""
        return self._by_id.get(rec_id)

    @property
    def names_index(self) -> List[str]:
        """Return list of all normalized names for fuzzy search."""
        return self._names

    @property
    def name_to_id(self) -> Dict[str, str]:
        """Return mapping from normalized name to internal id."""
        return self._name_to_id