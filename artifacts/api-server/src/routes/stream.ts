import { Router } from "express";
import axios from "axios";

const router = Router();

const MEGAPLAY_BASE = process.env.VITE_MEGAPLAY_URL || "https://megaplay.buzz";
const PYTHON_SCRAPER = "http://127.0.0.1:5000";

async function pythonFallback(params: {
  id: string;
  episode: string;
  lang: string;
  type: "ani" | "mal";
}): Promise<{ success: true; sources: { url: string; type: string }[] }> {
  const { data } = await axios.get(`${PYTHON_SCRAPER}/api/stream`, {
    params,
    timeout: 20000,
  });
  const sources: { url: string; type: string }[] = Array.isArray(data?.sources)
    ? data.sources
    : [{ url: data?.url || "", type: "iframe" }].filter((s) => s.url);
  return { success: true, sources };
}

// SERVER 1 — MegaPlay via AniList ID
// GET /api/stream/s1?id=<anilistId>&episode=<ep>&lang=sub|dub
router.get("/stream/s1", async (req, res) => {
  const { id, episode = "1", lang = "sub" } = req.query as Record<string, string>;

  if (!id) return res.status(400).json({ success: false, error: "Missing id" });

  const megaUrl = `${MEGAPLAY_BASE}/stream/ani/${id}/${episode}/${lang}`;

  try {
    await axios.head(megaUrl, { timeout: 6000 });
    return res.json({
      success: true,
      sources: [{ url: megaUrl, type: "iframe" }],
      server: "S1-MegaPlay-AniList",
    });
  } catch (err) {
    console.log("Primary failed, executing Python fallback");
    try {
      const fallback = await pythonFallback({ id, episode, lang, type: "ani" });
      return res.json({ ...fallback, server: "S1-Python-Fallback" });
    } catch (pyErr: any) {
      return res.status(502).json({
        success: false,
        error: "S1 primary and Python fallback both failed",
        detail: pyErr?.message,
      });
    }
  }
});

// SERVER 2 — MegaPlay via MAL ID
// GET /api/stream/s2?malId=<malId>&episode=<ep>&lang=sub|dub
router.get("/stream/s2", async (req, res) => {
  const { malId, episode = "1", lang = "sub" } = req.query as Record<string, string>;

  if (!malId) return res.status(400).json({ success: false, error: "Missing malId" });

  const megaUrl = `${MEGAPLAY_BASE}/stream/mal/${malId}/${episode}/${lang}`;

  try {
    await axios.head(megaUrl, { timeout: 6000 });
    return res.json({
      success: true,
      sources: [{ url: megaUrl, type: "iframe" }],
      server: "S2-MegaPlay-MAL",
    });
  } catch (err) {
    console.log("Primary failed, executing Python fallback");
    try {
      const fallback = await pythonFallback({ id: malId, episode, lang, type: "mal" });
      return res.json({ ...fallback, server: "S2-Python-Fallback" });
    } catch (pyErr: any) {
      return res.status(502).json({
        success: false,
        error: "S2 primary and Python fallback both failed",
        detail: pyErr?.message,
      });
    }
  }
});

export default router;
