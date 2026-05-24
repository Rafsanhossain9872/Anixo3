import os
import time
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s ⚡ %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("backup_scraper")

# ─── App ──────────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ─── Simple in-memory cache (5 min TTL) ───────────────────────────────────────
_cache: dict = {}
CACHE_TTL = 300

def _cache_get(key: str):
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None

def _cache_set(key: str, data: dict):
    _cache[key] = {"data": data, "ts": time.time()}

# ─── Provider base URLs ───────────────────────────────────────────────────────
CONSUMET = os.environ.get("CONSUMET_API", "https://api.consumet.org")

# ─── Helpers ──────────────────────────────────────────────────────────────────

def _safe_get(url: str, timeout: int = 12, **kwargs) -> requests.Response | None:
    try:
        r = requests.get(url, timeout=timeout, **kwargs)
        if r.status_code == 200:
            return r
        log.warning("GET %s → %d", url, r.status_code)
    except Exception as e:
        log.warning("GET %s failed: %s", url, e)
    return None


def _consumet_episodes(anime_id: str, id_type: str) -> list:
    """
    Fetch episode list from Consumet meta/anilist.
    Works for both AniList IDs (type=ani) and MAL IDs (type=mal).
    """
    ep_url = f"{CONSUMET}/meta/anilist/episodes/{anime_id}"
    if id_type == "mal":
        ep_url += "?fetchFiller=false"
    r = _safe_get(ep_url)
    if r:
        try:
            data = r.json()
            if isinstance(data, list):
                return data
        except Exception:
            pass
    return []


def _consumet_watch(episode_id: str, dub: bool = False) -> list:
    """
    Fetch streaming sources for a Consumet episode ID.
    Returns list of { url, type, quality } dicts.
    """
    watch_url = f"{CONSUMET}/meta/anilist/watch/{episode_id}"
    if dub:
        watch_url += "?dub=true"
    r = _safe_get(watch_url, timeout=15)
    if not r:
        return []
    try:
        data = r.json()
        sources = []
        for src in data.get("sources", []):
            if src.get("url"):
                sources.append({
                    "url": src["url"],
                    "type": src.get("type", "m3u8"),
                    "quality": src.get("quality", "auto"),
                })
        return sources
    except Exception as e:
        log.warning("Consumet watch parse error: %s", e)
        return []


def _find_episode(episodes: list, ep_num: int) -> dict | None:
    """Find episode by number, fall back to index lookup."""
    for ep in episodes:
        if ep.get("number") == ep_num:
            return ep
    # fallback: use zero-based index
    if episodes:
        idx = max(0, min(ep_num - 1, len(episodes) - 1))
        return episodes[idx]
    return None


# ─── Primary provider: Consumet meta/anilist ─────────────────────────────────

def _try_consumet(anime_id: str, episode: str, lang: str, id_type: str) -> list:
    ep_num = int(episode) if episode.isdigit() else 1
    dub = lang.lower() == "dub"

    log.info("Consumet: fetching episodes for id=%s type=%s ep=%d dub=%s",
             anime_id, id_type, ep_num, dub)

    episodes = _consumet_episodes(anime_id, id_type)
    if not episodes:
        log.warning("Consumet: no episodes returned for %s", anime_id)
        return []

    target = _find_episode(episodes, ep_num)
    if not target:
        log.warning("Consumet: episode %d not found in list of %d", ep_num, len(episodes))
        return []

    ep_id = target.get("id", "")
    if not ep_id:
        log.warning("Consumet: episode has no id field: %s", target)
        return []

    log.info("Consumet: watching episode_id=%s", ep_id)
    sources = _consumet_watch(ep_id, dub=dub)
    if sources:
        log.info("Consumet: ✅ found %d source(s)", len(sources))
    return sources


# ─── Fallback provider: Consumet gogoanime (name-based) ──────────────────────

def _anilist_title(anime_id: str) -> str | None:
    """Resolve AniList ID to a title string for name-based search."""
    try:
        resp = requests.post(
            "https://graphql.anilist.co",
            json={
                "query": "query($id:Int){Media(id:$id,type:ANIME){title{english romaji}}}",
                "variables": {"id": int(anime_id)},
            },
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            timeout=8,
        )
        if resp.status_code == 200:
            media = resp.json().get("data", {}).get("Media", {})
            return (
                media.get("title", {}).get("english")
                or media.get("title", {}).get("romaji")
            )
    except Exception:
        pass
    return None


def _try_gogoanime(anime_id: str, episode: str, lang: str) -> list:
    ep_num = int(episode) if episode.isdigit() else 1
    dub = lang.lower() == "dub"

    title = _anilist_title(anime_id)
    if not title:
        log.warning("Gogoanime fallback: could not resolve title for id=%s", anime_id)
        return []

    search_term = title + (" (Dub)" if dub else "")
    log.info("Gogoanime fallback: searching '%s'", search_term)

    search_url = f"{CONSUMET}/anime/gogoanime/{requests.utils.quote(search_term)}"
    r = _safe_get(search_url)
    if not r:
        return []

    try:
        results = r.json().get("results", [])
        if not results:
            return []
        anime = results[0]
        anime_slug = anime.get("id", "")
        if not anime_slug:
            return []

        ep_id = f"{anime_slug}-episode-{ep_num}"
        watch_url = f"{CONSUMET}/anime/gogoanime/watch/{ep_id}"
        w = _safe_get(watch_url, timeout=15)
        if not w:
            return []

        sources = []
        for src in w.json().get("sources", []):
            if src.get("url"):
                sources.append({
                    "url": src["url"],
                    "type": src.get("type", "m3u8"),
                    "quality": src.get("quality", "auto"),
                })
        if sources:
            log.info("Gogoanime fallback: ✅ found %d source(s)", len(sources))
        return sources
    except Exception as e:
        log.warning("Gogoanime fallback parse error: %s", e)
        return []


# ─── Route ────────────────────────────────────────────────────────────────────

@app.route("/api/stream", methods=["GET"])
def api_stream():
    """
    GET /api/stream?id=<anilistOrMalId>&episode=<ep>&lang=sub|dub&type=ani|mal

    Called by the Express API server (stream.ts) as a fallback when MegaPlay is unavailable.
    Returns: { success: true, sources: [{ url, type, quality }] }
    """
    anime_id = request.args.get("id", "").strip()
    episode  = request.args.get("episode", "1").strip()
    lang     = request.args.get("lang", "sub").strip().lower()
    id_type  = request.args.get("type", "ani").strip().lower()

    if not anime_id:
        return jsonify({"success": False, "error": "Missing id parameter"}), 400

    cache_key = f"stream:{anime_id}:{episode}:{lang}:{id_type}"
    cached = _cache_get(cache_key)
    if cached:
        log.info("Cache hit: %s", cache_key)
        return jsonify(cached)

    # 1. Primary: Consumet meta/anilist
    sources = _try_consumet(anime_id, episode, lang, id_type)

    # 2. Fallback: Consumet gogoanime (name-based search)
    if not sources:
        log.info("Primary failed, trying gogoanime fallback…")
        sources = _try_gogoanime(anime_id, episode, lang)

    if not sources:
        log.error("All providers failed for id=%s ep=%s", anime_id, episode)
        return jsonify({"success": False, "error": "No streaming sources found"}), 502

    result = {"success": True, "sources": sources}
    _cache_set(cache_key, result)
    return jsonify(result)


@app.route("/", methods=["GET"])
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "service": "AniXo Python Fallback Scraper", "status": "online"})


# ─── Startup ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("SCRAPER_PORT", 5000))
    log.info("AniXo backup_scraper starting on port %d", port)
    app.run(host="0.0.0.0", port=port, debug=False)
