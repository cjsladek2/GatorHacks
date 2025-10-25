from __future__ import annotations
from typing import Dict, Any, List
from .pubchem import fetch_pubchem
# from .epa_scil import fetch_epa_scil  # DISABLED: unstable source
from .fda_food_additives import fetch_fda_food_additive
from .cosing import fetch_cosing
from .common import normalize_name


def aggregate_report(name: str) -> Dict[str, Any]:
    """
    Query multiple ingredient knowledge sources and return a merged, citation-rich report.
    """
    sources = [
        fetch_pubchem,
        # fetch_epa_scil,   # DISABLED: EPA site unstable
        fetch_fda_food_additive,
        fetch_cosing,
    ]

    by_source: List[Dict[str, Any]] = []
    for fn in sources:
        try:
            by_source.append(fn(name))
        except Exception as e:
            by_source.append({
                "source": fn.__name__,
                "query": name,
                "facts": {},
                "citations": [],
                "error": str(e)
            })

    # merge some key fields
    merged: Dict[str, Any] = {}
    def take(field: str):
        for b in by_source:
            if b.get("facts", {}).get(field):
                merged[field] = b["facts"][field]
                break

    for fld in ["cas_number", "function", "summary", "status_or_citation", "eco_impact"]:
        take(fld)

    citations = []
    for b in by_source:
        for c in b.get("citations", []):
            if c not in citations:
                citations.append(c)

    return {
        "query": name,
        "facts": merged,
        "by_source": by_source,
        "citations": citations,
    }
