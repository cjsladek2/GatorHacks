from __future__ import annotations
import io, re, unicodedata, requests, pandas as pd
from typing import Dict, Any
from .common import cache_get, cache_set, normalize_name

SCIL_PAGE = "https://www.epa.gov/saferchoice/safer-ingredients"
XLS_FALLBACK = "https://www.epa.gov/sites/default/files/2015-09/safer_chemical_ingredients_list.xls"


def _discover_xls_url(timeout: int = 12) -> str | None:
    """Try to find the current XLS/CSV link on the SCIL landing page."""
    try:
        html = requests.get(SCIL_PAGE, timeout=timeout).text
        m = re.search(r"https://[^\"']+\.(?:xls|xlsx|csv)", html, re.IGNORECASE)
        return m.group(0) if m else None
    except Exception:
        return None


def _clean(s: str) -> str:
    s = str(s).lower().strip()
    s = unicodedata.normalize("NFKD", s)
    return re.sub(r"[^a-z0-9]+", "", s)


def _load_table(url: str, timeout: int = 20) -> pd.DataFrame:
    """Read Excel/CSV and auto-detect the header row."""
    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()
    if url.lower().endswith(".csv"):
        return pd.read_csv(io.StringIO(resp.text))

    # read all sheets
    xls = pd.ExcelFile(io.BytesIO(resp.content))
    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet, header=None)
        for i in range(min(15, len(df))):
            joined = " ".join(df.iloc[i].astype(str).tolist()).lower()
            if "list name" in joined or "chemical name" in joined:
                df.columns = df.iloc[i]
                df = df.drop(index=list(range(i + 1))).reset_index(drop=True)
                return df
    return pd.read_excel(io.BytesIO(resp.content))


def fetch_epa_scil(name: str, timeout: int = 15) -> Dict[str, Any]:
    """Query the EPA SCIL list and extract details for the given ingredient."""
    norm = normalize_name(name)
    key = f"epa_scil::{norm}"
    if (cached := cache_get(key)):
        return cached

    out: Dict[str, Any] = {
        "source": "EPA SCIL",
        "query": name,
        "facts": {},
        "citations": [SCIL_PAGE],
    }

    urls = []
    discovered = _discover_xls_url(timeout)
    if discovered:
        urls.append(discovered)
    urls.append(XLS_FALLBACK)

    df, err = None, None
    for url in urls:
        try:
            df = _load_table(url, timeout)
            out["citations"].append(url)
            break
        except Exception as e:
            err = str(e)

    if df is None:
        out["error"] = f"Failed to load SCIL: {err or 'unknown error'}"
        cache_set(key, out)
        return out

    # Normalize headers and find the right column
    cols = { _clean(str(c)): c for c in df.columns if str(c).strip() != "" }
    name_col = None
    for k in cols:
        if "listname" in k or "chemicalname" in k:
            name_col = cols[k]
            break
    if not name_col:
        name_col = next(iter(df.columns))

    # Normalize for matching
    ser = df[name_col].astype(str).map(_clean)
    target = _clean(name)

    hits = df[ser == target]
    if hits.empty:
        hits = df[ser.str.contains(target, na=False)]
    if hits.empty:
        try:
            from rapidfuzz import fuzz
            df["score"] = ser.map(lambda x: fuzz.partial_ratio(x, target))
            hits = df[df["score"] > 85]
        except Exception:
            pass

    if hits.empty:
        out["error"] = "Ingredient not found in SCIL."
        cache_set(key, out)
        return out

    row = hits.iloc[0].to_dict()
    out["facts"] = {
        "epa_name": row.get(name_col),
        "cas_number": row.get("CAS") or row.get("CAS Number"),
        "tsca_name": row.get("TSCA Chemical Name"),
        "list_call": row.get("List Call"),
        "caveat": row.get("Caveat - Chemical Use"),
        "edit_description": row.get("Edit Description"),
    }
    cache_set(key, out)
    return out


if __name__ == "__main__":
    print(fetch_epa_scil("Sodium lauryl sulfoacetate"))
