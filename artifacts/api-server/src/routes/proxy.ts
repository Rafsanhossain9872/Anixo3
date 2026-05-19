import { Router } from "express";
import axios from "axios";

const router = Router();

// AniList GraphQL proxy
router.post("/anilist/proxy", async (req, res) => {
  try {
    const { data } = await axios.post(
      "https://graphql.anilist.co",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      },
    );
    res.json(data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({
      error: "AniList proxy failed",
      message: err.message,
    });
  }
});

// Jikan proxy (MyAnimeList) — accepts path like /anime or /v4/anime
router.get("/jikan/proxy", async (req, res) => {
  try {
    const { path, ...params } = req.query as Record<string, string>;
    if (!path) {
      return res.status(400).json({ error: "path query param required" });
    }
    // Strip leading /v4 if the frontend sends it (Jikan base already includes /v4)
    const cleanPath = path.replace(/^\/v4/, "");
    const { data } = await axios.get(`https://api.jikan.moe/v4${cleanPath}`, {
      params,
      timeout: 15000,
    });
    res.json(data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Jikan proxy failed", message: err.message });
  }
});

// Miruro stream proxy
router.get("/miruro/watch", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://miruro-hono-worker.miruro-api.workers.dev/watch",
      {
        params: req.query,
        timeout: 15000,
      },
    );
    res.json(data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: "Miruro proxy failed", message: err.message });
  }
});

// MalSync mapping proxy
router.get("/malsync/:malId", async (req, res) => {
  try {
    const { malId } = req.params;
    const { data } = await axios.get(
      `https://api.malsync.moe/mal/anime/${malId}`,
      { timeout: 10000 },
    );
    res.json(data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: "MalSync proxy failed", message: err.message });
  }
});

// Dub availability check via AniList extras or MalSync heuristic
router.get("/check-dub/:anilistId", async (req, res) => {
  try {
    const { anilistId } = req.params;
    // Query AniList for dub track info
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english }
          countryOfOrigin
          episodes
        }
      }
    `;
    const { data: alData } = await axios.post(
      "https://graphql.anilist.co",
      { query, variables: { id: parseInt(anilistId) } },
      { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 10000 },
    );
    const media = alData?.data?.Media;
    // Conservative heuristic: assume sub exists, dub unknown without a third-party source
    res.json({
      hasSub: true,
      hasDub: false,
      subCount: media?.episodes || 0,
      dubCount: 0,
      title: media?.title,
    });
  } catch (err: any) {
    res.json({ hasSub: true, hasDub: false, subCount: 0, dubCount: 0 });
  }
});

// Secondary episode metadata (Kitsu / AniDB fallback)
router.get("/meta/episodes", async (req, res) => {
  try {
    const { title, kitsu_id } = req.query as Record<string, string>;
    if (kitsu_id) {
      const { data } = await axios.get(
        `https://kitsu.app/api/edge/anime/${kitsu_id}/episodes`,
        { params: { "page[limit]": 20 }, timeout: 10000 },
      );
      return res.json(data);
    }
    if (title) {
      const { data } = await axios.get(
        `https://kitsu.app/api/edge/anime`,
        { params: { "filter[text]": title, "page[limit]": 1 }, timeout: 10000 },
      );
      const kitsuId = data?.data?.[0]?.id;
      if (kitsuId) {
        const { data: eps } = await axios.get(
          `https://kitsu.app/api/edge/anime/${kitsuId}/episodes`,
          { params: { "page[limit]": 20 }, timeout: 10000 },
        );
        return res.json(eps);
      }
    }
    res.json({});
  } catch (err: any) {
    res.json({});
  }
});

export default router;
