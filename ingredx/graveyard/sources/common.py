from __future__ import annotations
import time, hashlib, json, os
from typing import Dict, Any, Optional

# super-simple on-disk cache (per key) to avoid hammering sites/APIs
_CACHE_DIR = os.path.join(os.path.dirname(__file__), "_cache")
os.makedirs(_CACHE_DIR, exist_ok=True)

def _keyify(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

def cache_get(key: str, max_age_sec: int = 7 * 24 * 3600) -> Optional[Dict[str, Any]]:
    path = os.path.join(_CACHE_DIR, _keyify(key) + ".json")
    if not os.path.exists(path):
        return None
    try:
        st = os.stat(path)
        if time.time() - st.st_mtime > max_age_sec:
            return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None

def cache_set(key: str, obj: Dict[str, Any]) -> None:
    path = os.path.join(_CACHE_DIR, _keyify(key) + ".json")
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(obj, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

def normalize_name(name: str) -> str:
    return " ".join(name.strip().lower().split())
