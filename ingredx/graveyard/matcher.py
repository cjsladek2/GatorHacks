# ingredx/core/matcher.py
from __future__ import annotations
import re
import unicodedata

try:
    from rapidfuzz import process, fuzz
    _HAS_RF = True
except Exception:
    _HAS_RF = False

from ingredx.graveyard.knowledge_base import KnowledgeBase
from ingredx.core.models import MatchResult

# Split on commas, semicolons, pipes, slashes, or newlines
_WORD_SPLIT = re.compile(r"[;,/|]+|\n+")


class Matcher:
    def __init__(self, kb: KnowledgeBase):
        self.kb = kb

    @staticmethod
    def normalize(text: str) -> str:
        """Lowercase, remove diacritics, and strip special characters."""
        t = text.strip().lower()
        t = unicodedata.normalize("NFKD", t)
        t = "".join(ch for ch in t if not unicodedata.combining(ch))
        t = re.sub(r"[^a-z0-9\s\-]", "", t)
        t = re.sub(r"\s+", " ", t).strip()
        return t

    def fuzzy_lookup(self, token: str) -> MatchResult:
        """Return the best match from the KB for a given token."""
        norm = self.normalize(token)

        # Exact hit
        rec_id = self.kb.name_to_id.get(norm)
        if rec_id:
            rec = self.kb.get(rec_id)
            return MatchResult(
                input_text=token,
                normalized=norm,
                matched_id=rec_id,
                matched_name=rec.name if rec else norm,
                match_confidence=1.0,
            )

        # Fuzzy fallback
        if _HAS_RF and self.kb.names_index:
            best = process.extractOne(norm, self.kb.names_index, scorer=fuzz.WRatio)
            if best:
                best_name, score, _ = best
                rec_id = self.kb.name_to_id.get(best_name)
                rec = self.kb.get(rec_id) if rec_id else None
                return MatchResult(
                    input_text=token,
                    normalized=norm,
                    matched_id=rec_id,
                    matched_name=rec.name if rec else best_name,
                    match_confidence=float(score) / 100.0,
                )

        # No match found
        return MatchResult(
            input_text=token,
            normalized=norm,
            matched_id=None,
            matched_name=None,
            match_confidence=0.0,
        )

    def split_ingredient_list(self, s: str) -> list[str]:
        """Split a combined ingredient list string into tokens."""
        if not s:
            return []
        parts = _WORD_SPLIT.split(s)
        return [p.strip() for p in parts if p.strip()]
