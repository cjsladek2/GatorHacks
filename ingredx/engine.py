from __future__ import annotations
from typing import Optional, Dict
from dotenv import load_dotenv
import os
import json

from .core.models import Explanation, IngredientAnalysis, DetailLevel
from .core.prompts import DISCLAIMER
from .adapters.openai_translator import OpenAITranslator
from .adapters.openai_summarizer import OpenAISummarizer


class IngredientEngine:
    """
    AI-only ingredient engine with persistent safety rating consistency.
    """

    def __init__(self, cache_file: str = "ingredx_cache.json"):
        load_dotenv()
        self.summarizer = OpenAISummarizer()
        self.translator = OpenAITranslator()
        self.cache_file = cache_file
        self._memory: Dict[str, Dict[str, float]] = self._load_cache()

    # ---------- Persistent cache helpers ----------
    def _load_cache(self) -> Dict[str, Dict[str, float]]:
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_cache(self) -> None:
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self._memory, f, indent=2)
        except Exception:
            pass

    # ---------- Main generation entry ----------
    def generate(self, ingredient_name: str, mode: str = "overview", output_language: str = "en"):
        """
        Generate either a short blurb, a detailed overview, or a structured JSON schema
        describing the ingredient.
        """
        # FIXED: pass the language into the prompt builder
        prompt = self._build_generation_prompt(ingredient_name, mode=mode, language=output_language)

        # Only force JSON output for schema mode
        force_json = (mode == "schema")

        text_output = self.summarizer.summarize(prompt, force_json=force_json)

        explanation = Explanation(
            detail_level=mode,
            language=output_language,
            text=text_output,
        )

        return IngredientAnalysis(
            ingredient_input=ingredient_name,
            translated_name=None,
            match=None,
            data=None,
            explanation=explanation,
            disclaimer="This information is educational, not medical advice.",
        )

    # ---------- Prompt builder ----------
    def _build_generation_prompt(
        self,
        ingredient_name: str,
        mode: str,
        language: str,
        known_rating: Optional[float] = None,
    ) -> str:
        """Construct the correct LLM prompt for each mode."""
        rating_hint = (
            f"The ingredient '{ingredient_name}' already has an established health safety rating of "
            f"{known_rating:.2f} on a scale of 0–1. Use this exact value for consistency.\n\n"
            if known_rating is not None else ""
        )

        if mode == "blurb":
            return (
                f"{rating_hint}"
                f"You are a chemistry explainer. Write a MAX 2-sentence, layperson-friendly summary "
                f"of '{ingredient_name}', focusing on the highlights of what it is, what it does, "
                f"and general safety notes. Avoid jargon.\n\nWrite in {language}."
            )

        elif mode == "overview":
            return (
                f"{rating_hint}"
                f"You are an expert chemist writing a scientifically grounded overview "
                f"for laypeople about '{ingredient_name}'. Include:\n"
                f"1) Common synonyms/other names\n"
                f"2) Chemical properties and function\n"
                f"3) Common uses\n"
                f"4) Safety and controversy information\n"
                f"5) Environmental and regulatory considerations\n"
                f"6) Overall decimal health-safety rating (0–1)\n"
                f"7) Binary yes/no edible status\n\n"
                f"Use the same rating if known.\nWrite clearly in {language}."
            )



        elif mode == "schema":
            return (
                f"{rating_hint}"
                f"You are an expert data annotator. Produce a JSON object (strict JSON format only) for '{ingredient_name}'. "
                f"The response must be a valid JSON object and nothing else.\n"
                "Generate the following fields exactly:\n"
                "{\n"
                '  "chemical_properties": "description of physical and chemical characteristics",\n'
                '  "common_uses": "typical applications and industries where it is used",\n'
                '  "safety_and_controversy": "known toxicology, debates, or usage restrictions",\n'
                '  "environmental_and_regulation": "ecological effects and global regulatory status",\n'
                '  "health_safety_rating": "decimal between 0 and 1",\n'
                '  "edible": "true or false"\n'
                "}\n\n"
                "If a health safety rating is already established, use the same number.\n"
                "Return ONLY valid JSON with no additional commentary, explanation, or markdown formatting."
            )

        else:
            raise ValueError(f"Unknown mode '{mode}'")


if __name__ == "__main__":
    print("✅ IngredientEngine (AI-only, consistent ratings) loaded successfully!")
    engine = IngredientEngine()
    print("✅ Engine initialized with OpenAI.\n")

    while True:
        q = input("👩‍🔬 Enter ingredient (or 'quit'): ").strip()
        if q.lower() in {"quit", "exit"}:
            break

        print("\n🌸 [Blurb Output]")
        blurb = engine.generate(q, mode="blurb")
        print(blurb.explanation.text, "\n")

        print("📘 [Overview Output]")
        overview = engine.generate(q, mode="overview")
        print(overview.explanation.text, "\n")

        print("🧩 [AI JSON Schema]")
        schema = engine.generate(q, mode="schema")
        print(schema.explanation.text, "\n")
