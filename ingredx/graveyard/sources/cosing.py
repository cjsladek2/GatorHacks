from __future__ import annotations
import pandas as pd
import requests
from typing import Dict, Any, Optional
from .common import cache_get, cache_set, normalize_name

# CosIng offers downloadable lists; HTML layout changes periodically.
COSING_URL = "https://ec.europa.eu/growth/tools-databases/cosing/"

def fetch_cosing(name: str, timeout: int = 12) -> Dict[str, Any]:
    """
    Very defensive HTML-table scrape for INCI + function.
    If EU changes layout, this might return empty facts (but still safe).
    """
    key = f"cosing::{normalize_name(name)}"
    cached = cache_get(key)
    if cached: return cached

    out: Dict[str, Any] = {"source": "EU CosIng", "query": name, "facts": {}, "citations": [COSING_URL]}
    try:
        html = requests.get(COSING_URL, timeout=timeout).text
        tables = pd.read_html(html)
        name_l = normalize_name(name)
        for df in tables:
            # look for INCI/function columns heuristically
            cols_l = [str(c).lower() for c in df.columns]
            if not any("inci" in x or "function" in x or "name" in x for x in cols_l):
                continue
            df = df.fillna("")
            # try exact/contains in any textual column
            mask = False
            for c in df.columns:
                ser = df[c].astype(str).str.lower().str.strip()
                mask = mask | ser.eq(name_l) | ser.str.contains(name_l, na=False)
            hits = df[mask]
            if not hits.empty:
                row = hits.iloc[0].to_dict()
                out["facts"] = {
                    "inci_name": row.get(next((c for c in df.columns if "inci" in str(c).lower()), "INCI Name"), None),
                    "function": row.get(next((c for c in df.columns if "function" in str(c).lower()), "Function"), None),
                }
                break
    except Exception:
        pass

    cache_set(key, out)
    return out
