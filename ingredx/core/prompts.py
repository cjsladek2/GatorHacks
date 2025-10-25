from __future__ import annotations
from typing import Optional
from .models import IngredientRecord

DISCLAIMER = (
    "This information is educational and not medical advice. "
    "For specific health concerns, consult a qualified professional."
)

SYSTEM_SUMMARY = (
    "You are a scientific ingredient analyst. "
    "Your goal is to produce accurate, layperson-friendly yet scientifically grounded explanations "
    "about cosmetic, food, and chemical ingredients. Avoid pseudoscience and always stay factual."
)


def build_prompt(
    rec: Optional[IngredientRecord],
    matched_name: Optional[str],
    language: str,
    mode: str = "overview",  # "blurb" | "overview" | "schema"
) -> str:
    """
    Build a language-specific LLM prompt for one of three modes:
      - blurb: 2-sentence summary
      - overview: full detailed human-readable overview
      - schema: JSON structured scientific report
    """
    ingredient_name = rec.name if rec else matched_name or "unknown ingredient"

    if mode == "blurb":
        task = (
            "Write a 2-sentence layperson summary of the ingredient below, "
            "highlighting its function and overall safety, but do **NOT** include a decimal safety rating."
            "Avoid jargon and long explanations."
        )

    elif mode == "overview":
        task = (
            "Provide a detailed but readable scientific overview of this ingredient. "
            "Organize your response into the following sections:\n"
            "1. Common Synonyms / Other Names\n"
            "2. Chemical Properties and Function\n"
            "3. Common Uses\n"
            "4. Safety and Controversy Information\n"
            "5. Environmental and Regulatory Considerations\n"
            "6. Overall Health Safety Rating (decimal 0–1)\n"
            "7. Edibility (yes/no, is it safe for human consumption)\n\n"
            "Use clear formatting with section headers and paragraph text. "
            "Do NOT output JSON or bullet lists—just text paragraphs. "
            "Focus on factual accuracy and consumer relevance."
        )

    elif mode == "schema":
        task = (
            "Return ONLY valid JSON (no markdown, code fencing, or commentary). "
            "The JSON must include the following keys and scientifically grounded values:\n\n"
            "{\n"
            '  "common_synonyms": "comma-separated list",\n'
            '  "chemical_properties": "short scientific description of structure and function",\n'
            '  "common_uses": "typical commercial, industrial, or household uses",\n'
            '  "safety_and_controversy": "balanced discussion of health impacts",\n'
            '  "environmental_and_regulation": "biodegradability, eco-toxicity, regulation",\n'
            '  "health_safety_rating": float between 0 and 1,\n'
            '  "edible": boolean (true/false)\n'
            "}\n\n"
            "Return ONLY the JSON object, without commentary."
        )

    else:
        raise ValueError(f"Unknown mode: {mode}")

    return (
        f"{SYSTEM_SUMMARY}\n\n"
        f"Language: {language}\n"
        f"Ingredient: {ingredient_name}\n\n"
        f"Task: {task}"
    )