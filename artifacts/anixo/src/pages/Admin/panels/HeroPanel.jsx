import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Star, X } from "lucide-react";

export default function HeroPanel() {
  const [heroAnimeId, setHeroAnimeId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/config", { withCredentials: true }).then(({ data }) => {
      setHeroAnimeId(data.adminCfg.heroAnimeId ? String(data.adminCfg.heroAnimeId) : "");
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { heroAnimeId: heroAnimeId.trim() ? parseInt(heroAnimeId.trim()) || heroAnimeId.trim() : null };
      await axios.post("/api/admin/config", payload, { withCredentials: true });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { /* noop */ } finally { setSaving(false); }
  };

  const clear = async () => {
    setHeroAnimeId("");
    setSaving(true);
    try {
      await axios.post("/api/admin/config", { heroAnimeId: null }, { withCredentials: true });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { /* noop */ } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Hero Section Controller</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Pin a specific anime to the top of the homepage hero banner.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
          <Save size={13} />{saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>

      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            Featured Anime ID (AniList)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={heroAnimeId}
              onChange={(e) => setHeroAnimeId(e.target.value)}
              placeholder="e.g. 21 for One Piece, 16498 for Attack on Titan"
              className="flex-1 bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20"
            />
            {heroAnimeId && (
              <button onClick={clear} className="flex items-center gap-1.5 text-white/30 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-colors">
                <X size={13} />Clear
              </button>
            )}
          </div>
          <p className="text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
            Enter the numeric AniList ID. Find it at anilist.co — it's in the URL (e.g. anilist.co/anime/<strong className="text-white/40">21</strong>).
          </p>
        </div>

        <div className="h-px bg-white/5" />

        <div className="bg-[#0c0d10] rounded-xl px-4 py-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Star size={12} className="text-yellow-400" fill="currentColor" />
            <p className="text-[11px] font-bold text-white">How it works</p>
          </div>
          <ul className="text-[11px] space-y-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            <li>• The home page checks <code className="text-red-400">admin-config.json</code> for a featured anime ID</li>
            <li>• If set, that anime is fetched from AniList and pinned as the first hero slide</li>
            <li>• Trending anime continues to fill the remaining 5 hero slots</li>
            <li>• Clearing the ID returns the hero to pure trending order</li>
          </ul>
        </div>

        {heroAnimeId && (
          <div className="bg-[#0c0d10] rounded-xl px-4 py-3 border border-emerald-500/20 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[12px] text-emerald-400 font-medium">
              Anime ID <strong>{heroAnimeId}</strong> is set as the featured hero.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
