import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import crypto from "crypto";
import axios from "axios";
// @ts-ignore
import User from "../models/User.js";
// @ts-ignore
import AccessKey from "../models/AccessKey.js";
// @ts-ignore
import FailedSearch from "../models/FailedSearch.js";
// @ts-ignore
import CustomAnime from "../models/CustomAnime.js";
// @ts-ignore
import VideoLink from "../models/VideoLink.js";
// @ts-ignore
import Analytics from "../models/Analytics.js";
// @ts-ignore
import SupportTicket from "../models/SupportTicket.js";
// @ts-ignore
import BrokenLinkReport from "../models/BrokenLinkReport.js";
// @ts-ignore
import LegalContent from "../models/LegalContent.js";
import { LEGAL_SECTIONS_SEED } from "../utils/legalSeed.js";

const router = Router();

const MAINTENANCE_PATH = join(process.cwd(), "../anixo/public/maintenance-config.json");
const ADMIN_CFG_PATH   = join(process.cwd(), "../anixo/public/admin-config.json");
const PYTHON_API       = process.env.PYTHON_API_URL || "https://ritesh0997-index.hf.space";
const CONSUMET         = process.env.CONSUMET_API   || "https://api.consumet.org";

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJson(filePath: string) {
  try { return JSON.parse(readFileSync(filePath, "utf-8")); }
  catch { return {}; }
}

function writeJson(filePath: string, data: unknown) {
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim();
}

function requireAdmin(req: any, res: any, next: any) {
  const bypassKey = process.env.ADMIN_BYPASS_KEY;
  const cookie    = req.cookies?.admin_bypass;
  if (!bypassKey || cookie !== bypassKey) {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

// ── IP Brute-Force Shield ─────────────────────────────────────────────────────

const loginAttempts = new Map<string, { count: number; until?: number }>();

function getClientIp(req: any): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function isIpBlocked(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  if (!entry?.until) return false;
  if (Date.now() > entry.until) { loginAttempts.delete(ip); return false; }
  return true;
}

function recordFailedAttempt(ip: string) {
  const entry = loginAttempts.get(ip) || { count: 0 };
  entry.count += 1;
  if (entry.count >= 5) {
    entry.until = Date.now() + 24 * 60 * 60 * 1000; // 24 h ban
    loginAttempts.set(ip, entry);
    return;
  }
  loginAttempts.set(ip, entry);
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// ── SSE SYSTEM_LOCKDOWN ───────────────────────────────────────────────────────

const sseClients = new Set<any>();

function broadcastLockdown(type: string, config: Record<string, unknown> = {}) {
  const payload = `event: SYSTEM_LOCKDOWN\ndata: ${JSON.stringify({ type, ...config })}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch { sseClients.delete(client); }
  }
}

// Public SSE endpoint — all public users connect here for instant lockdown
router.get("/sse", (_req: any, res: any) => {
  res.setHeader("Content-Type",      "text/event-stream");
  res.setHeader("Cache-Control",     "no-cache");
  res.setHeader("Connection",        "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  res.write(": connected\n\n");
  sseClients.add(res);
  _req.on("close", () => sseClients.delete(res));
});

// ── Active Session Tracking ───────────────────────────────────────────────────

const activeSessions = new Map<string, { lastPing: number; page?: string }>();

function cleanSessions() {
  const cutoff = Date.now() - 3 * 60 * 1000;
  for (const [k, v] of activeSessions) {
    if (v.lastPing < cutoff) activeSessions.delete(k);
  }
}

// Public ping — called every 30 s by each active browser tab
router.post("/ping", (req: any, res: any) => {
  const { sessionId, page } = req.body;
  if (sessionId && typeof sessionId === "string" && sessionId.length < 128) {
    activeSessions.set(sessionId, { lastPing: Date.now(), page: page || "/" });
    cleanSessions();
  }
  res.json({ ok: true, active: activeSessions.size });
});

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────────

// GET /api/admin/runtime-config — public, no auth, no-cache (legacy alias kept)
router.get("/runtime-config", (_req: any, res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma",        "no-cache");
  res.setHeader("Expires",       "0");
  res.json({
    maintenance: readJson(MAINTENANCE_PATH),
    adminCfg:    readJson(ADMIN_CFG_PATH),
  });
});

// GET /api/admin/site-config — public, no auth
// Reads both JSON files via readFileSync on every request (no module cache).
// Returns a flat shape consumed by GlobalGatekeeper.
router.get("/site-config", (_req: any, res: any) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma",        "no-cache");
  res.setHeader("Expires",       "0");
  const maintenance = readJson(MAINTENANCE_PATH);
  const adminCfg    = readJson(ADMIN_CFG_PATH);
  res.json({
    maintenanceMode:  !!maintenance.isMaintenanceActive,
    maintenanceData:  maintenance,
    privateMode:      !!adminCfg.privateMode,
    privateMessage:   adminCfg.privateMessage || "",
  });
});

// POST /api/admin/login
router.post("/login", (req: any, res: any) => {
  const ip = getClientIp(req);
  if (isIpBlocked(ip)) {
    return res.status(429).json({ error: "Too many failed attempts. Your IP has been blocked for 24 hours." });
  }

  const { password } = req.body;
  const bypassKey = process.env.ADMIN_BYPASS_KEY;
  if (!bypassKey || password !== bypassKey) {
    recordFailedAttempt(ip);
    return res.status(403).json({ error: "Invalid admin password." });
  }

  clearAttempts(ip);
  const opts = { secure: true, sameSite: "none" as const, maxAge: 7_200_000 };
  res.cookie("admin_bypass", bypassKey, { ...opts, httpOnly: true });
  res.cookie("bypass_ui",    "true",    { ...opts, httpOnly: false });
  res.json({ success: true });
});

// GET /api/admin/alert — polled by every active tab
router.get("/alert", (_req: any, res: any) => {
  const cfg = readJson(ADMIN_CFG_PATH);
  res.json(cfg.liveAlert || { active: false, message: "" });
});

// GET /api/admin/social-config — public social links
router.get("/social-config", (_req: any, res: any) => {
  const cfg = readJson(ADMIN_CFG_PATH);
  res.json(cfg.socialLinks || {});
});

// POST /api/admin/contact — public contact form → SupportTicket
router.post("/contact", async (req: any, res: any) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(String(email))) {
      return res.status(400).json({ error: "Invalid email." });
    }
    await SupportTicket.create({
      name:    String(name).slice(0, 100),
      email:   String(email).slice(0, 200),
      subject: String(subject).slice(0, 200),
      message: String(message).slice(0, 5000),
    });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// GET /api/admin/legal/sections — public, returns all 14 sections sorted by order
router.get("/legal/sections", async (_req: any, res: any) => {
  try {
    const sections = await LegalContent.find().sort({ order: 1 }).lean();
    res.json(sections);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/report-broken — public broken link report
router.post("/report-broken", async (req: any, res: any) => {
  try {
    const { animeId, animeTitle, episode, server } = req.body;
    if (!animeId || episode == null) {
      return res.status(400).json({ error: "animeId and episode required." });
    }
    await BrokenLinkReport.create({
      animeId:    String(animeId),
      animeTitle: String(animeTitle || "").slice(0, 200),
      episode:    Number(episode),
      server:     String(server || "unknown").slice(0, 50),
    });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/track-failed-search
router.post("/track-failed-search", async (req: any, res: any) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "query required" });
    await FailedSearch.findOneAndUpdate(
      { query: query.trim().toLowerCase() },
      { $inc: { count: 1 }, $set: { lastSearched: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/track-view
router.post("/track-view", async (req: any, res: any) => {
  try {
    const { animeId, animeTitle } = req.body;
    if (!animeId) return res.status(400).json({ error: "animeId required" });
    await Analytics.findOneAndUpdate(
      { animeId: String(animeId) },
      { $inc: { views: 1 }, $set: { lastViewed: new Date(), animeTitle: animeTitle || "" } },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// POST /api/admin/private/validate-key
router.post("/private/validate-key", async (req: any, res: any) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: "Key required." });
    const record = await AccessKey.findOne({
      key: key.trim().toUpperCase(),
      isUsed: false,
      isRevoked: { $ne: true },
    });
    if (!record) return res.status(403).json({ error: "Invalid or already-used key." });
    // Check expiry
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      return res.status(403).json({ error: "This key has expired." });
    }
    record.isUsed = true;
    await record.save();
    res.cookie("private_access_granted", "true", {
      httpOnly: false, secure: true, sameSite: "none", maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── PROTECTED ADMIN ROUTES ────────────────────────────────────────────────────

router.get("/me", requireAdmin, (_req: any, res: any) => res.json({ admin: true }));

// Config
router.get("/config", requireAdmin, (_req: any, res: any) => {
  res.json({ maintenance: readJson(MAINTENANCE_PATH), adminCfg: readJson(ADMIN_CFG_PATH) });
});

router.post("/maintenance", requireAdmin, (req: any, res: any) => {
  try {
    const updated = { ...readJson(MAINTENANCE_PATH), ...req.body };
    writeJson(MAINTENANCE_PATH, updated);
    broadcastLockdown("maintenance", {
      isMaintenanceActive: !!updated.isMaintenanceActive,
      title:   updated.title   || "",
      message: updated.message || "",
    });
    res.json({ success: true, data: updated });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/config", requireAdmin, (req: any, res: any) => {
  try {
    const updated = { ...readJson(ADMIN_CFG_PATH), ...req.body };
    writeJson(ADMIN_CFG_PATH, updated);
    if ("privateMode" in req.body || "adSlots" in req.body) {
      broadcastLockdown("config", {
        privateMode:    !!updated.privateMode,
        privateMessage: updated.privateMessage || "",
      });
    }
    res.json({ success: true, data: updated });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Live Radar ────────────────────────────────────────────────────────────────

router.get("/sessions", requireAdmin, (_req: any, res: any) => {
  cleanSessions();
  const list = Array.from(activeSessions.entries()).map(([id, v]) => ({
    id,
    page:      v.page || "/",
    lastPing:  v.lastPing,
    sinceMs:   Date.now() - v.lastPing,
  }));
  res.json(list);
});

router.delete("/sessions/:id", requireAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const existed = activeSessions.has(id);
  activeSessions.delete(id);
  res.json({ success: true, existed });
});

// ── Access Keys ───────────────────────────────────────────────────────────────

router.get("/keys", requireAdmin, async (_req: any, res: any) => {
  try { res.json(await AccessKey.find().sort({ createdAt: -1 }).limit(500)); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/keys/generate", requireAdmin, async (req: any, res: any) => {
  try {
    const qty      = Math.min(Math.max(parseInt(req.body.quantity) || 1, 1), 100);
    const expiresIn: string = req.body.expiresIn || "lifetime";

    let expiresAt: Date | null = null;
    if (expiresIn === "24h")  expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (expiresIn === "7d")   expiresAt = new Date(Date.now() + 7  * 24 * 60 * 60 * 1000);
    if (expiresIn === "30d")  expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const keys = Array.from({ length: qty }, () => {
      const p1 = crypto.randomBytes(2).toString("hex").toUpperCase();
      const p2 = crypto.randomBytes(2).toString("hex").toUpperCase();
      return { key: `ANIXO-${p1}-${p2}`, isUsed: false, isRevoked: false, expiresAt, createdAt: new Date() };
    });
    const created = await AccessKey.insertMany(keys, { ordered: false });
    res.json({ success: true, keys: created });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/keys/:key/revoke", requireAdmin, async (req: any, res: any) => {
  try {
    const record = await AccessKey.findOne({ key: req.params.key });
    if (!record) return res.status(404).json({ error: "Key not found." });
    record.isRevoked = !record.isRevoked;
    await record.save();
    res.json({ success: true, isRevoked: record.isRevoked });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/keys/:key", requireAdmin, async (req: any, res: any) => {
  try {
    await AccessKey.deleteOne({ key: req.params.key });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Legal Content ─────────────────────────────────────────────────────────────

// POST /api/admin/legal/seed — admin, idempotently seed all 14 default clauses
router.post("/legal/seed", requireAdmin, async (_req: any, res: any) => {
  try {
    let seeded = 0;
    for (const section of LEGAL_SECTIONS_SEED) {
      const exists = await LegalContent.findOne({ sectionId: section.sectionId });
      if (!exists) {
        await LegalContent.create({ ...section, updatedAt: new Date() });
        seeded++;
      }
    }
    res.json({ success: true, seeded, total: LEGAL_SECTIONS_SEED.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// PUT /api/admin/legal/sections/:sectionId — admin, update a single clause
router.put("/legal/sections/:sectionId", requireAdmin, async (req: any, res: any) => {
  try {
    const { sectionId } = req.params;
    const { content, title } = req.body;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (content !== undefined) update.content = String(content).slice(0, 50_000);
    if (title   !== undefined) update.title   = String(title).slice(0, 200);
    const section = await LegalContent.findOneAndUpdate(
      { sectionId },
      update,
      { upsert: true, new: true },
    );
    res.json(section);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Support Tickets ───────────────────────────────────────────────────────────

router.get("/tickets", requireAdmin, async (_req: any, res: any) => {
  try {
    res.json(await SupportTicket.find().sort({ createdAt: -1 }).limit(500));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/tickets/:id", requireAdmin, async (req: any, res: any) => {
  try {
    await SupportTicket.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/tickets/:id", requireAdmin, async (req: any, res: any) => {
  try {
    await SupportTicket.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Broken Link Reports ───────────────────────────────────────────────────────

router.get("/broken-links", requireAdmin, async (_req: any, res: any) => {
  try {
    res.json(await BrokenLinkReport.find().sort({ reportedAt: -1 }).limit(500));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/broken-links/:id", requireAdmin, async (req: any, res: any) => {
  try {
    await BrokenLinkReport.findByIdAndUpdate(req.params.id, { isResolved: true });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/broken-links/:id", requireAdmin, async (req: any, res: any) => {
  try {
    await BrokenLinkReport.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Users ─────────────────────────────────────────────────────────────────────

router.get("/users", requireAdmin, async (_req: any, res: any) => {
  try {
    res.json(await User.find()
      .select("username email displayName avatar isVIP isBanned lastActive createdAt")
      .sort({ createdAt: -1 }).limit(500));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

async function toggleUserField(req: any, res: any, field: "isVIP" | "isBanned") {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ error: "User not found" });
    u[field] = !u[field];
    await u.save();
    res.json({ success: true, isVIP: u.isVIP, isBanned: u.isBanned });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
}

router.post("/users/:id/vip",  requireAdmin, (req, res) => toggleUserField(req, res, "isVIP"));
router.patch("/users/:id/vip", requireAdmin, (req, res) => toggleUserField(req, res, "isVIP"));
router.post("/users/:id/ban",  requireAdmin, (req, res) => toggleUserField(req, res, "isBanned"));
router.patch("/users/:id/ban", requireAdmin, (req, res) => toggleUserField(req, res, "isBanned"));

// ── Comments ──────────────────────────────────────────────────────────────────

router.get("/comments", requireAdmin, async (req: any, res: any) => {
  try {
    const { animeId, episode } = req.query;
    const params: Record<string, string> = {};
    if (animeId) params.animeId = String(animeId);
    if (episode)  params.episode = String(episode);
    const resp = await axios.get(`${PYTHON_API}/api/comments`, { params, timeout: 12_000 });
    res.json(resp.data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch comments", details: err.message });
  }
});

router.delete("/comments/:id", requireAdmin, async (req: any, res: any) => {
  try {
    const resp = await axios.post(`${PYTHON_API}/api/comments/delete`,
      { commentId: req.params.id, adminOverride: true }, { timeout: 12_000 });
    res.json(resp.data);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete comment", details: err.message });
  }
});

// ── Logs ──────────────────────────────────────────────────────────────────────

router.get("/logs", requireAdmin, async (_req: any, res: any) => {
  try { res.json(await FailedSearch.find().sort({ count: -1 }).limit(200)); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Analytics ─────────────────────────────────────────────────────────────────

router.get("/analytics/active", requireAdmin, (_req: any, res: any) => {
  cleanSessions();
  res.json({ activeUsers: activeSessions.size });
});

router.get("/analytics", requireAdmin, async (_req: any, res: any) => {
  try {
    const topAnime   = await Analytics.find().sort({ views: -1 }).limit(20);
    const totalViews = topAnime.reduce((s: number, a: any) => s + (a.views || 0), 0);
    res.json({ topAnime, totalViews, totalAnime: topAnime.length });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Content Manager ───────────────────────────────────────────────────────────

router.get("/content/anime", requireAdmin, async (_req: any, res: any) => {
  try { res.json(await CustomAnime.find().sort({ createdAt: -1 }).limit(300)); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/content/anime", requireAdmin, async (req: any, res: any) => {
  try {
    const { title, ep1Url } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: "Title is required." });
    const slug = toSlug(title);
    const anime = await CustomAnime.create({ ...req.body, title: title.trim(), slug });
    if (ep1Url?.trim()) {
      await VideoLink.findOneAndUpdate(
        { animeId: String(anime._id), episode: 1 },
        { animeId: String(anime._id), animeTitle: title.trim(), episode: 1,
          url: ep1Url.trim(), quality: "auto",
          type: ep1Url.includes(".m3u8") ? "M3U8" : "MP4", updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    res.json(anime);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/content/anime/:id", requireAdmin, async (req: any, res: any) => {
  try {
    await CustomAnime.findByIdAndDelete(req.params.id);
    await VideoLink.deleteMany({ animeId: req.params.id });
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/content/links", requireAdmin, async (req: any, res: any) => {
  try {
    const { animeId } = req.query;
    const query = animeId ? { animeId: String(animeId) } : {};
    res.json(await VideoLink.find(query).sort({ episode: 1 }));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/content/links", requireAdmin, async (req: any, res: any) => {
  try {
    if (!req.body.animeId || !req.body.episode || !req.body.url) {
      return res.status(400).json({ error: "animeId, episode, and url are required." });
    }
    const link = await VideoLink.findOneAndUpdate(
      { animeId: req.body.animeId, episode: req.body.episode },
      { ...req.body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json(link);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/content/links/:id", requireAdmin, async (req: any, res: any) => {
  try {
    await VideoLink.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// ── Bulk Episode Importer ─────────────────────────────────────────────────────

async function fireDiscordWebhook(animeTitle: string, results: { success: number; failed: number; total: number }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await axios.post(webhookUrl, {
      embeds: [{
        title:       "✅ Bulk Import Complete",
        description: `**${animeTitle}** episodes have been imported.`,
        color:       0xe53e3e,
        fields: [
          { name: "✅ Imported",  value: String(results.success), inline: true },
          { name: "❌ Failed",    value: String(results.failed),  inline: true },
          { name: "📦 Total",    value: String(results.total),   inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer:    { text: "AniXo Admin · Bulk Importer" },
      }],
    }, { timeout: 5_000 });
  } catch { /* webhook failures are non-critical */ }
}

router.post("/anime/bulk-import", requireAdmin, async (req: any, res: any) => {
  try {
    const { animeId, animeTitle, episodeFrom, episodeTo, audioType } = req.body;

    if (!animeId || episodeFrom == null || episodeTo == null) {
      return res.status(400).json({ error: "animeId, episodeFrom, and episodeTo are required." });
    }

    const from = parseInt(episodeFrom);
    const to   = parseInt(episodeTo);

    if (isNaN(from) || isNaN(to) || from > to) {
      return res.status(400).json({ error: "Invalid episode range." });
    }

    if (to - from > 2000) {
      return res.status(400).json({ error: "Maximum 2000 episodes per import batch." });
    }

    const isDub = audioType === "dub";
    const results = { success: 0, failed: 0, total: to - from + 1 };
    const docs: any[] = [];

    let episodeList: any[] = [];
    try {
      const epResp = await axios.get(`${CONSUMET}/meta/anilist/episodes/${animeId}`, {
        timeout: 20_000, params: { dub: isDub },
      });
      episodeList = Array.isArray(epResp.data) ? epResp.data : [];
    } catch {
      episodeList = [];
    }

    const targetEpisodes = episodeList.length > 0
      ? episodeList.filter((e: any) => e.number >= from && e.number <= to)
      : Array.from({ length: to - from + 1 }, (_, i) => ({ number: from + i, id: null }));

    for (const ep of targetEpisodes) {
      try {
        let url = "";
        let quality = "auto";

        if (ep.id) {
          const streamResp = await axios.get(`${CONSUMET}/meta/anilist/watch/${ep.id}`, {
            timeout: 10_000, params: { dub: isDub },
          });
          const sources: any[] = streamResp.data?.sources || [];
          const best = sources.find((s) => s.quality === "1080p")
            || sources.find((s) => s.quality === "720p")
            || sources.find((s) => s.quality === "default")
            || sources[0];
          if (best?.url) { url = best.url; quality = best.quality || "auto"; }
        }

        if (url) {
          docs.push({
            animeId:    String(animeId),
            animeTitle: animeTitle || String(animeId),
            episode:    ep.number,
            url, quality,
            type:       url.includes(".m3u8") ? "M3U8" : "MP4",
            updatedAt:  new Date(),
          });
          results.success++;
        } else {
          results.failed++;
        }
      } catch {
        results.failed++;
      }
      await new Promise((r) => setTimeout(r, 150));
    }

    if (docs.length > 0) {
      const ops = docs.map((doc) => ({
        updateOne: {
          filter: { animeId: doc.animeId, episode: doc.episode },
          update: { $set: doc },
          upsert: true,
        },
      }));
      await VideoLink.bulkWrite(ops);
    }

    // Fire Discord notification (non-blocking)
    fireDiscordWebhook(animeTitle || String(animeId), results);

    res.json({ success: true, results, imported: docs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Exports ───────────────────────────────────────────────────────────────────

router.get("/export/keys", requireAdmin, async (_req: any, res: any) => {
  try {
    const keys = await AccessKey.find().sort({ createdAt: -1 });
    const csv = ["key,isUsed,isRevoked,expiresAt,createdAt",
      ...keys.map((k: any) =>
        `${k.key},${k.isUsed},${!!k.isRevoked},${k.expiresAt?.toISOString() || "lifetime"},${k.createdAt?.toISOString()}`),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="anixo-keys.csv"');
    res.send(csv);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/export/users", requireAdmin, async (_req: any, res: any) => {
  try {
    const users = await User.find()
      .select("username email displayName isVIP isBanned createdAt lastActive");
    const csv = ["username,email,displayName,isVIP,isBanned,createdAt,lastActive",
      ...users.map((u: any) =>
        `"${u.username}","${u.email}","${u.displayName || ""}",${!!u.isVIP},${!!u.isBanned},${u.createdAt?.toISOString()},${u.lastActive?.toISOString()}`),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="anixo-users.csv"');
    res.send(csv);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
