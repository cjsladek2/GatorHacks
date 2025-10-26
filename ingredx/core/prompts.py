from __future__ import annotations
from typing import Optional
from .models import IngredientRecord

# ---------------------------------------------------------------------
# CONSTANTS
# ---------------------------------------------------------------------

DISCLAIMER = (
    "This information is educational and not medical advice. "
    "For specific health concerns, consult a qualified professional."
)

SYSTEM_SUMMARY = (
    "You are a scientific ingredient analyst. "
    "Your goal is to produce accurate, layperson-friendly yet scientifically grounded explanations "
    "about cosmetic, food, and chemical ingredients. Avoid pseudoscience and always stay factual."
)

# ---------------------------------------------------------------------
# PROMPT BUILDER
# ---------------------------------------------------------------------

def build_prompt(
    rec: Optional[IngredientRecord],
    matched_name: Optional[str],
    language: str,
    mode: str = "overview",  # "blurb" | "overview" | "schema" | "chat"
) -> str:
    """
    Build a language-specific LLM prompt for one of four modes:
      - blurb: 2-sentence summary
      - overview: detailed, human-readable analysis
      - schema: structured JSON
      - chat: conversational Q&A mode
    """
    ingredient_name = rec.name if rec else matched_name or "unknown ingredient"

    if mode == "blurb":
        task = (
            "Write a short, friendly, and accurate 2-sentence summary of the ingredient below. "
            "Explain what it is and what it does, including general safety information in plain terms. "
            "Do NOT include numeric safety ratings or decimal scores. Avoid jargon. "
            "Keep the tone approachable and clear for everyday consumers."
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
            "Use full sentences and natural formatting — no bullet points, no JSON. "
            "Write clearly, using accessible language grounded in science."
        )

    elif mode == "schema":
        task = (
            "Return ONLY valid JSON (no markdown, no code blocks, no commentary). "
            "The JSON must include the following keys with scientifically accurate values:\n\n"
            "{\n"
            '  "common_synonyms": "comma-separated list of known synonyms",\n'
            '  "chemical_properties": "description of structure, function, and key characteristics",\n'
            '  "common_uses": "description of typical household, industrial, or biological uses",\n'
            '  "safety_and_controversy": "discussion of health risks, debates, or restrictions",\n'
            '  "environmental_and_regulation": "notes on biodegradability, eco-toxicity, and legal status",\n'
            '  "health_safety_rating": float between 0 and 1,\n'
            '  "edible": boolean (true/false)\n'
            "}\n\n"
            "Output ONLY the JSON object, nothing else. No markdown or commentary."
        )

    elif mode == "chat":
        task = (
            "You are a friendly, scientifically accurate health and nutrition assistant. "
            "Engage in a natural conversation with the user about ingredient safety, chemical properties, and usage. "
            "Always ground your responses in real chemistry, toxicology, or nutrition science. "
            "Focus on explaining clearly:\n"
            "1. Chemical Properties and Function\n"
            "2. Common Uses\n"
            "3. Safety and Controversy\n"
            "4. Environmental and Regulatory Considerations\n\n"
            "Answer conversationally, but stay factual and balanced. "
            "If unsure, say what is and isn’t known. Keep the tone approachable and warm."
        )

    else:
        raise ValueError(f"Unknown mode: {mode}")

    return (
        f"{SYSTEM_SUMMARY}\n\n"
        f"Language: {language}\n"
        f"Ingredient or topic: {ingredient_name}\n\n"
        f"Task: {task}"
    )