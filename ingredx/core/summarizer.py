from __future__ import annotations
from typing import Protocol


class Summarizer(Protocol):
    def summarize(self, prompt: str) -> str: # returns text in the desired language
        ...


class StubSummarizer:
    """Deterministic fallback (for tests / no-network)."""
    def summarize(self, prompt: str) -> str:
        # Super simple heuristic: return last lines as a stub.
        return (
            "This is a placeholder explanation. The real system will use an LLM to "
            "generate a layperson-friendly summary based on the provided data."
        )