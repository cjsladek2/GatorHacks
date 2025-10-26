# tests/test_engine.py
from ingredx.models import KnowledgeBaseConfig
from ingredx.knowledge_base import KnowledgeBase
from ingredx.matcher import Matcher
from ingredx.engine import IngredientEngine
from ingredx.core.summarizer import StubSummarizer
from ingredx.core.translator import IdentityTranslator

def test_basic_analysis(tmp_path):
    # tiny KB
    kb_json = tmp_path / "kb.json"
    kb_json.write_text(
        """[
          {"id":"ing_1","name":"sodium chloride","synonyms":["salt"],"common_uses":["flavor"],"warnings":[]}
        ]""",
        encoding="utf-8",
    )
    kb = KnowledgeBase(KnowledgeBaseConfig(json_path=str(kb_json)))
    engine = IngredientEngine(kb, Matcher(kb), StubSummarizer(), IdentityTranslator())

    result = engine.analyze_ingredient("Salt", detail="short", output_language="en")
    assert result.match.matched_id == "ing_1"
    assert result.explanation.text.startswith("This is a placeholder")
    assert result.disclaimer
