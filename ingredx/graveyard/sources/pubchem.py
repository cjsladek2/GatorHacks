from __future__ import annotations
import requests
from typing import Dict, Any, List, Optional
from .common import cache_get, cache_set, normalize_name

BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"

def fetch_pubchem(name: str, timeout: int = 8) -> Dict[str, Any]:
    """
    Pull a concise set of details from PubChem via official PUG REST API.
    Returns dict with fields + citations. Safe to call often; cached.
    """
    key = f"pubchem::{normalize_name(name)}"
    cached = cache_get(key)
    if cached: return cached

    data: Dict[str, Any] = {"source": "PubChem", "query": name, "facts": {}, "citations": []}
    try:
        # Get CID by name
        r = requests.get(f"{BASE}/compound/name/{requests.utils.quote(name)}/cids/JSON", timeout=timeout)
        r.raise_for_status()
        cids = r.json().get("IdentifierList", {}).get("CID", [])
        if not cids:
            cache_set(key, data); return data
        cid = cids[0]

        # Basic description
        d = requests.get(f"{BASE}/compound/cid/{cid}/description/JSON", timeout=timeout)
        if d.ok:
            info = d.json().get("InformationList", {}).get("Information", [])
            if info and "Description" in info[0]:
                data["facts"]["summary"] = info[0]["Description"][:800]

        # Synonyms, CAS if present
        s = requests.get(f"{BASE}/compound/cid/{cid}/synonyms/JSON", timeout=timeout)
        if s.ok:
            syns = s.json().get("InformationList", {}).get("Information", [])
            if syns and "Synonym" in syns[0]:
                syn_list: List[str] = syns[0]["Synonym"][:100]
                data["facts"]["synonyms"] = syn_list
                cas = next((x for x in syn_list if x.count("-")==2 and x.replace("-", "").isdigit()), None)
                if cas:
                    data["facts"]["cas_number"] = cas

        data["citations"].append(f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}")
    except Exception:
        pass

    cache_set(key, data)
    return data