from __future__ import annotations
import pandas as pd
import requests
from typing import Dict, Any
from .common import cache_get, cache_set, normalize_name

URL = "https://www.fda.gov/food/food-additives-petitions/food-additive-status-list"

def fetch_fda_food_additive(name: str, timeout: int = 12) -> Dict[str, Any]:
    """
    FDA Food Additive Status List is presented as HTML tables.
    We parse tables with pandas. Structure can change; be defensive.
    """
    key = f"fda_food::{normalize_name(name)}"
    cached = cache_get(key)
    if cached: return cached

    out: Dict[str, Any] = {"source": "FDA Food Additive Status List", "query": name, "facts": {}, "citations": [URL]}
    try:
        html = requests.get(URL, timeout=timeout).text
        tables = pd.read_html(html)  # returns list of DataFrames
        name_l = normalize_name(name)
        for df in tables:
            # try to find likely name column
            candidates = [c for c in df.columns if "name" in str(c).lower() or "additive" in str(c).lower()]
            for c in candidates or df.columns[:1]:
                ser = df[c].astype(str).str.lower().str.strip()
                hits = df[ser.str.contains(name_l, na=False)]
                if not hits.empty:
                    row = hits.iloc[0].to_dict()
                    out["facts"] = {
                        "listed_name": row.get(c),
                        "category": next((row.get(k) for k in df.columns if "category" in str(k).lower()), None),
                        "status_or_citation": next((row.get(k) for k in df.columns if "21 cfr" in str(k).lower() or "citation" in str(k).lower()), None),
                    }
                    cache_set(key, out)
                    return out
    except Exception:
        pass

    cache_set(key, out)
    return out