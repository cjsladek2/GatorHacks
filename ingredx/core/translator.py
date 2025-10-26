# ingredx/core/translator.py
from __future__ import annotations
from typing import Protocol


class Translator(Protocol):
    """Abstract interface for translation and language detection."""

    def translate(self, text: str, target_language: str) -> str:
        ...

    def detect_language(self, text: str) -> str:
        ...


class IdentityTranslator:
    """No-op translator for tests or English-only pipelines."""

    def translate(self, text: str, target_language: str) -> str:
        # Just return text unchanged
        return text

    def detect_language(self, text: str) -> str:
        # Always assume English
        return "en"
