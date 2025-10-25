from __future__ import annotations
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class Reference(BaseModel):
    title: str
    url: Optional[str] = None


class IngredientRecord(BaseModel):
    id: str
    name: str
    synonyms: List[str] = []
    category: Optional[str] = None
    common_uses: List[str] = []
    warnings: List[str] = []
    allergens: List[str] = []
    safety_score: Optional[int] = Field(default=None, ge=0, le=100)
    evidence_level: Optional[str] = None
    eco_impact: Optional[str] = None
    regulatory_status: Optional[str] = None
    references: List[Reference] = []


class MatchResult(BaseModel):
    input_text: str
    normalized: str
    matched_id: Optional[str]
    matched_name: Optional[str]
    match_confidence: float = 0.0
    was_translated: bool = False
    detected_language: Optional[str] = None


# ✅ Updated to support new modes (added "chat")
DetailLevel = Literal["blurb", "overview", "schema", "chat"]


class Explanation(BaseModel):
    detail_level: DetailLevel
    language: str
    text: str


class IngredientAnalysis(BaseModel):
    ingredient_input: str
    translated_name: Optional[str] = None
    match: Optional[MatchResult] = None
    data: Optional[IngredientRecord] = None
    explanation: Explanation
    disclaimer: str


class ChatAnswer(BaseModel):
    """
    Used for interactive Q&A mode.
    Includes both the assistant's response and suggested next questions.
    """
    schema_version: str = "1.0.0"
    question: str
    language: str = "en"
    explanation: Explanation
    referenced_ingredients: List[str] = []
    suggested_questions: Optional[List[str]] = None
    disclaimer: str


class KnowledgeBaseConfig(BaseModel):
    json_path: str
