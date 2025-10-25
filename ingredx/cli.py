from __future__ import annotations
import json
from pathlib import Path
import typer
from rich import print

from .core.models import KnowledgeBaseConfig
from .knowledge_base import KnowledgeBase
from .matcher import Matcher
from ingredx.engine import IngredientEngine

# Adapters
from ingredx.core.summarizer import StubSummarizer
from ingredx.core.translator import IdentityTranslator

# Typer app
app = typer.Typer(add_completion=False, help="ingredx: AI ingredient explanations (blurb | overview | schema)")


def _load_engine(kb_path: Path, use_openai: bool = False) -> IngredientEngine:
    """Initialize IngredientEngine with either stub or OpenAI adapters."""
    kb = KnowledgeBase(KnowledgeBaseConfig(json_path=str(kb_path)))
    matcher = Matcher(kb)

    if use_openai:
        from ingredx.adapters.openai_summarizer import OpenAISummarizer
        from ingredx.adapters.openai_translator import OpenAITranslator
        summarizer = OpenAISummarizer()
        translator = OpenAITranslator()
    else:
        summarizer = StubSummarizer()
        translator = IdentityTranslator()

    return IngredientEngine(kb=kb, matcher=matcher, summarizer=summarizer, translator=translator)


def _print_json(obj) -> None:
    """Pretty-print any BaseModel or dict as JSON."""
    try:
        payload = obj.model_dump()  # Pydantic v2
    except Exception:
        payload = obj.dict() if hasattr(obj, "dict") else obj
    print(json.dumps(payload, ensure_ascii=False, indent=2))


@app.command()
def explain(
    ingredient: str = typer.Argument(..., help="Ingredient name (any language)."),
    mode: str = typer.Option("overview", help="Mode: blurb | overview | schema"),
    kb: Path = typer.Option("sample_data/ingredients.json", help="Path to KB JSON."),
    lang: str = typer.Option("en", help="Output language code (ISO 639-1)."),
    openai: bool = typer.Option(False, help="Use OpenAI for summarization/translation."),
):
    """
    Explain a single ingredient using AI.
    Modes:
      - blurb: short 2-sentence summary
      - overview: detailed human-readable overview
      - schema: JSON-formatted structured scientific summary
    """
    engine = _load_engine(kb, use_openai=openai)
    result = engine.generate(ingredient, mode=mode, output_language=lang)

    print(f"\n🌿 [Mode: {mode.upper()}] 🌿\n")
    if mode == "schema":
        # schema is already JSON string, so print nicely
        try:
            parsed = json.loads(result.explanation.text)
            print(json.dumps(parsed, ensure_ascii=False, indent=2))
        except json.JSONDecodeError:
            print(result.explanation.text)
    else:
        print(result.explanation.text)
    print()


@app.command()
def compare(
    ingredient1: str = typer.Argument(..., help="First ingredient name."),
    ingredient2: str = typer.Argument(..., help="Second ingredient name."),
    kb: Path = typer.Option("sample_data/ingredients.json", help="Path to KB JSON."),
    lang: str = typer.Option("en", help="Output language code (ISO 639-1)."),
    openai: bool = typer.Option(False, help="Use OpenAI for summarization/translation."),
):
    """
    Compare two ingredients quickly — outputs both blurbs and key schema values.
    """
    engine = _load_engine(kb, use_openai=openai)

    print("\n🔬 Comparing ingredients...\n")

    for ing in [ingredient1, ingredient2]:
        blurb = engine.generate(ing, mode="blurb", output_language=lang)
        schema = engine.generate(ing, mode="schema", output_language=lang)

        print(f"✨ {ing.title()} ✨")
        print(blurb.explanation.text)
        try:
            parsed = json.loads(schema.explanation.text)
            rating = parsed.get("health_safety_rating", "N/A")
            edible = parsed.get("edible", "N/A")
            print(f"→ Health Safety Rating: {rating}")
            print(f"→ Edible: {edible}")
        except Exception:
            print("(Could not parse JSON schema.)")
        print()


if __name__ == "__main__":
    app()
