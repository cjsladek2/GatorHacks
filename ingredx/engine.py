from __future__ import annotations
from typing import Optional, Dict, List
from dotenv import load_dotenv
import os
import json
import re

from .core.models import Explanation, IngredientAnalysis
from .core.prompts import DISCLAIMER
from .adapters.openai_translator import OpenAITranslator
from .adapters.openai_summarizer import OpenAISummarizer


class IngredientEngine:
    """
    AI-only ingredient engine with strict, persistent safety rating consistency,
    a memory-aware conversational chatbot mode with suggested questions,
    🆕 and an en-masse ingredients list analyzer for OCR label parsing.
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
            self.chat_history.append({"role": "user", "content": ingredient_name})
            chat_prompt = self._build_chat_prompt(language=output_language)
            text_output = self.summarizer.summarize(chat_prompt, force_json=False)
            self.chat_history.append({"role": "assistant", "content": text_output})

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
            f"Chemical Properties and Function\n"
            f"Common Uses\n"
            f"Safety and Controversy\n"
            f"Environmental and Regulatory Considerations\n\n"
            f"or other fun facts!\n\n"
            f"Be conversational but precise. Write in {language}."
        )

    # ----------------------------------------------------------------------
    # 🆕 INGREDIENT LIST EXTRACTION + BATCH ANALYSIS
    # ----------------------------------------------------------------------

    import re
    from typing import List

    import re
    from typing import List

    def extract_ingredients_from_text(self, raw_text: str) -> List[str]:
        """
        🧠 Final robust ingredient extractor.
        Handles typos, missing spaces, periods as separators,
        and fully infers ingredient lists even without headers.
        """

        if not raw_text or not raw_text.strip():
            return []

        text = raw_text.strip()

        # Normalize OCR noise
        text = re.sub(r"[\n\r\t|*_•·]+", " ", text)
        text = re.sub(r"\s{2,}", " ", text).strip()

        # ---------- 1️⃣ Fuzzy match for 'ingredients' section ----------
        match = re.search(
            r"ingr[eai]{0,2}d[iy]?e?n?t?s?\s*[:\-–_—]*\s*(.*)",
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            section = match.group(1)
            section = re.split(
                r"(contains|manufactured|nutrition|distributed|may contain|allergen|storage|warning)",
                section,
                flags=re.IGNORECASE,
            )[0]
        else:
            section = None

        # ---------- 2️⃣ If no header, infer likely ingredient text ----------
        if not section:
            delimiters = len(re.findall(r"[;,/\.]", text))
            word_count = len(text.split())

            if delimiters >= 2 and word_count < 80:
                section = text
            else:
                probable = re.search(
                    r"([A-Z][a-z]+\s*(?:[,;/\.]\s*[A-Za-z() ]+){2,})",
                    text,
                    re.DOTALL,
                )
                if probable:
                    section = probable.group(1)

        if not section:
            return []

        # ---------- 3️⃣ Normalize delimiters (handle missing spaces) ----------
        section = re.sub(r"([;,/\.])(?=[A-Za-z])", r"\1 ", section)
        section = section.replace(";", ",").replace("/", ",").replace(".", ",")
        section = re.sub(r"[^a-zA-Z0-9(),.\s-]", " ", section)
        section = re.sub(r"\s{2,}", " ", section).strip()

        # ---------- 4️⃣ Split and clean ----------
        parts = re.split(r",(?![^()]*\))", section)
        cleaned = []

        for p in parts:
            p = p.strip(" .;:-").title()
            if (
                    len(p) > 1
                    and not p.isdigit()
                    and not re.match(r"contains|manufactured|warning", p, re.I)
            ):
                # Break apart cases like "Etda Tomatoes" if joined by a period or missing comma
                subparts = re.split(r"\s{2,}|(?<!\b[A-Z])[.]", p)
                for s in subparts:
                    s = s.strip(" .;:-").title()
                    if len(s) > 1 and s.lower() not in ["and", "or"]:
                        cleaned.append(s)

        # ---------- 5️⃣ Deduplicate, preserve order ----------
        seen = set()
        final = []
        for item in cleaned:
            if item.lower() not in seen:
                seen.add(item.lower())
                final.append(item)

        return final

    def analyze_ingredient_list(self, raw_text: str, language: str = "en") -> Dict[str, Dict]:
        """
        🧩 Extracts all ingredients from messy label text and analyzes them in bulk.
        Returns:
        {
          "ingredients": [...],
          "blurbs": {...},
          "schemas": {...}
        }
        """
        ingredients = self.extract_ingredients_from_text(raw_text)
        if not ingredients:
            return {"error": "No ingredient list found."}

        blurbs = {}
        schemas = {}

        for ing in ingredients:
            try:
                blurb = self.generate(ing, mode="blurb", output_language=language)
                schema = self.generate(ing, mode="schema", output_language=language)
                blurbs[ing] = blurb.explanation.text
                schemas[ing] = json.loads(schema.explanation.text)
            except Exception as e:
                blurbs[ing] = f"[Error: {e}]"
                schemas[ing] = {}

        return {
            "ingredients": ingredients,
            "blurbs": blurbs,
            "schemas": schemas,
        }


# ---------- Interactive CLI ----------
if __name__ == "__main__":
    print("✅ IngredientEngine (AI-only, memory-aware chat + list analyzer) loaded successfully!")
    engine = IngredientEngine()
    print("✅ Engine initialized with OpenAI.\n")

    while True:
        print("\n🧩 Choose mode: [blurb / overview / schema / chat / list / quit]")
        mode = input("> ").strip().lower()
        if mode in {"quit", "exit"}:
            break

        if mode == "list":
            raw_text = input("📜 Paste full label text: ").strip()
            results = engine.analyze_ingredient_list(raw_text)
            print(json.dumps(results, indent=2, ensure_ascii=False))
            continue

        q = input("👩‍🔬 Enter ingredient or question: ").strip()
        result = engine.generate(q, mode=mode)
        print(f"\n[{mode.upper()} Output]")
        print(result.explanation.text, "\n")