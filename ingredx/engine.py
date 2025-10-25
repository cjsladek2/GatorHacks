from __future__ import annotations
from typing import Optional, Dict, List
from dotenv import load_dotenv
import os
import json

from .core.models import Explanation, IngredientAnalysis
from .core.prompts import DISCLAIMER
from .adapters.openai_translator import OpenAITranslator
from .adapters.openai_summarizer import OpenAISummarizer


class IngredientEngine:
    """
    AI-only ingredient engine with strict, persistent safety rating consistency,
    plus a memory-aware conversational chatbot mode with suggested questions.
    """

    def __init__(self, cache_file: str = "ingredx_cache.json"):
        load_dotenv()
        self.summarizer = OpenAISummarizer()
        self.translator = OpenAITranslator()
        self.cache_file = cache_file
        self._memory: Dict[str, Dict[str, float]] = self._load_cache()
        self.chat_history: List[Dict[str, str]] = []  # 🧠 conversation memory

    # ---------- Persistent cache helpers ----------
    def _load_cache(self) -> Dict[str, Dict[str, float]]:
        """Load the safety rating cache from disk."""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}

    def _save_cache(self) -> None:
        """Save the safety rating cache to disk."""
        try:
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump(self._memory, f, indent=2)
        except Exception:
            pass

    # ---------- Main generation entry ----------
    def generate(self, ingredient_name: str, mode: str = "overview", output_language: str = "en"):
        """
        Generate a short blurb, detailed overview, structured JSON schema, or chatbot reply.
        """
        name_key = ingredient_name.lower().strip()

        # reload cache each time
        self._memory = self._load_cache()

        known_rating = None
        if name_key in self._memory:
            known_rating = self._memory[name_key].get("health_safety_rating")

        prompt = self._build_generation_prompt(
            ingredient_name,
            mode=mode,
            language=output_language,
            known_rating=known_rating,
        )

        # schema mode = force JSON
        force_json = (mode == "schema")
        text_output = self.summarizer.summarize(prompt, force_json=force_json)

        # save rating if schema mode
        if mode == "schema":
            try:
                parsed = json.loads(text_output)
                rating = float(parsed.get("health_safety_rating"))
                if 0 <= rating <= 1:
                    self._memory[name_key] = parsed
                    self._save_cache()
                    known_rating = rating
            except Exception:
                pass

        # include rating only in overview text
        if known_rating is not None and mode == "overview":
            text_output = f"{text_output.strip()}\n\n[Health Rating: {known_rating:.2f}]"

        # ---------- Chat mode special handling ----------
        if mode == "chat":
            # store conversation context
            self.chat_history.append({"role": "user", "content": ingredient_name})

            chat_prompt = self._build_chat_prompt(language=output_language)
            text_output = self.summarizer.summarize(chat_prompt, force_json=False)

            # append response to history for memory continuity
            self.chat_history.append({"role": "assistant", "content": text_output})

            # now generate suggested follow-up questions
            suggestion_prompt = (
                "Based on this conversation, suggest 3-5 natural, concise follow-up questions "
                "the user might ask next about ingredients, safety, or nutrition. "
                "Return ONLY a numbered list and no other comments."
            )
            suggestions = self.summarizer.summarize(suggestion_prompt, force_json=False)
            text_output = f"{text_output.strip()}\n\n💡 Suggested follow-ups:\n{suggestions.strip()}"

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
            disclaimer=DISCLAIMER,
        )

    # ---------- Prompt builders ----------
    def _build_generation_prompt(
        self,
        ingredient_name: str,
        mode: str,
        language: str,
        known_rating: Optional[float] = None,
    ) -> str:
        """Build LLM prompts for non-chat modes."""
        rating_hint = (
            f"The ingredient '{ingredient_name}' already has an established health safety rating of "
            f"{known_rating:.2f} on a scale of 0–1. You must use this exact value consistently.\n\n"
            if known_rating is not None else ""
        )

        if mode == "blurb":
            return (
                f"You are a chemistry explainer. Write a MAX 2-sentence, layperson-friendly summary "
                f"of '{ingredient_name}', focusing only on what it is, what it does, and any general safety "
                f"considerations. Do NOT mention or reference any numeric ratings, decimals, or scores. "
                f"Avoid jargon and keep it friendly.\n\nWrite in {language}."
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
                "Return ONLY valid JSON with no commentary, explanation, or markdown."
            )

        elif mode == "chat":
            return self._build_chat_prompt(language)

        else:
            raise ValueError(f"Unknown mode '{mode}'")

    # ---------- Chat prompt builder ----------
    def _build_chat_prompt(self, language: str) -> str:
        """Constructs a context-rich chat prompt including memory."""
        context_snippets = "\n".join(
            f"{msg['role'].capitalize()}: {msg['content']}" for msg in self.chat_history[-8:]
        )
        return (
            f"You are a friendly, scientifically accurate nutrition and chemistry assistant specializing "
            f"in ingredients, their chemical properties, uses, safety, and environmental effects.\n\n"
            f"Conversation so far:\n{context_snippets}\n\n"
            f"Continue the conversation naturally, focusing on things like:\n"
            f"chemical Properties and Function\n"
            f"common Uses\n"
            f"safety and Controversy\n"
            f"environmental and Regulatory Considerations\n\n"
            f"or other fun facts!\n\n"
            f"UNLESS the user has asked about a different food/health-related topic where such\n\n"
            f"fields are not the topic of conversation\n\n"
            f"Be conversational but precise. Write in {language}."
        )


# ---------- Interactive CLI ----------
if __name__ == "__main__":
    print("✅ IngredientEngine (AI-only, memory-aware chat) loaded successfully!")
    engine = IngredientEngine()
    print("✅ Engine initialized with OpenAI.\n")

    while True:
        print("\n🧩 Choose mode: [blurb / overview / schema / chat / quit]")
        mode = input("> ").strip().lower()
        if mode in {"quit", "exit"}:
            break

        q = input("👩‍🔬 Enter ingredient or question: ").strip()
        result = engine.generate(q, mode=mode)

        print(f"\n[{mode.upper()} Output]")
        print(result.explanation.text, "\n")