# ingredx/adapters/openai_translator.py
from __future__ import annotations
import os
from openai import OpenAI
from ..core.translator import Translator

class OpenAITranslator(Translator):
    """
    Translator using OpenAI models for language detection and translation.
    """

    def __init__(self, model: str = "gpt-4o-mini", api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.model = model

    def detect_language(self, text: str) -> str:
        """Return ISO language code for the input (e.g. 'en', 'es', 'fr')."""
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a language detection assistant. "
                        "Respond ONLY with the ISO 639-1 two-letter code for the language of the user's text."
                    ),
                },
                {"role": "user", "content": text},
            ],
            temperature=0.0,
        )
        code = resp.choices[0].message.content.strip().lower()
        if len(code) > 2:
            code = code[:2]
        return code

    def translate(self, text: str, target_language: str) -> str:
        """Translate text into the given target language."""
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a precise translator. Translate everything into {target_language}. "
                        f"Do NOT add commentary or explanations — return only the translated text."
                    ),
                },
                {"role": "user", "content": text},
            ],
            temperature=0.0,
        )
        return resp.choices[0].message.content.strip()
