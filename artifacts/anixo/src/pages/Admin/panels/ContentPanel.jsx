import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Plus, Trash2, Edit3, Link, X, Save, Download, Loader, AlertCircle, CheckCircle } from "lucide-react";

const inp = "w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20";

// ── Toast utility ─────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium text-white animate-in slide-in-from-right duration-300 ${
            t.type === "error" ? "bg-red-900/90 border border-red-500/30" : "bg-emerald-900/90 border border-emerald-500/30"
          }`}>
          {t.type === "error"
            ? <AlertCircle size={15} className="text-red-400 shrink-0" />
            : <CheckCircle size={15} className="text-emerald-400 shrink-0" />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, toast: push };
}

// ── Add Anime Modal ───────────────────────────────────────────────────────────
function AddAnimeModal({ onClose, onSaved, toast }) {
  const [form, setForm] = useState({
    title: "", bannerImage: "", coverImage: "", genres: "",
    description: "", episodes: "", ep1Url: "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) { toast("Title is required.", "error"); return; }
    setSaving(true);
    try {
      await axios.post("/api/admin/content/anime", {
        ...form,
        genres:   form.genres.split(",").map((g) => g.trim()).filter(Boolean),
        episodes: parseInt(form.episodes) || 0,
      }, { withCredentials: true });
      toast("Anime added successfully.");
      onSaved();
      onClose();
    } catch (err) {
      toast(err?.response?.data?.error || "Failed to save anime.", "error");
    } finally { setSaving(false); }
  };

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg rounded-2xl p-7 space-y-4 overflow-y-auto max-h-[90vh]"
        style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg">Add New Anime</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input className={inp} placeholder="Title *" value={form.title}       onChange={f("title")} />
          <input className={inp} placeholder="Cover Image URL"  value={form.coverImage}  onChange={f("coverImage")} />
          <input className={inp} placeholder="Banner Image URL" value={form.bannerImage} onChange={f("bannerImage")} />
          <input className={inp} placeholder="Genres (comma-separated, e.g. Action, Romance)" value={form.genres} onChange={f("genres")} />
          <input className={inp} type="number" placeholder="Total Episodes" value={form.episodes} onChange={f("episodes")} />
          <input className={inp} placeholder="Episode 1 URL (M3U8 or MP4) — optional" value={form.ep1Url} onChange={f("ep1Url")} />
          <textarea rows={3} className={inp + " resize-none"} placeholder="Description" value={form.description} onChange={f("description")} />
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all">
            <Save size={13} />{saving ? "Saving…" : "Add Anime"}
          </button>
          <button onClick={onClose} className="text-white/40 hover:text-white text-[11px] font-medium transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Video Links Modal ────────────────────────────────────────────────────
function EditLinksModal({ anime, onClose, toast }) {
  const [links, setLinks]   = useState([]);
  const [newLink, setNewLink] = useState({ episode: "", url: "", quality: "1080p", type: "M3U8" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const animeId = anime._id || anime.id;

  useEffect(() => {
    axios.get(`/api/admin/content/links?animeId=${animeId}`, { withCredentials: true })
      .then(({ data }) => setLinks(Array.isArray(data) ? data : []))
      .catch(() => { toast("Failed to load links.", "error"); setLinks([]); })
      .finally(() => setLoading(false));
  }, [animeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addLink = async () => {
    if (!newLink.episode) { toast("Episode number required.", "error"); return; }
    if (!newLink.url.trim()) { toast("Stream URL required.", "error"); return; }
    setSaving(true);
    try {
      const { data } = await axios.post("/api/admin/content/links", {
        animeId, animeTitle: anime.title, ...newLink, episode: parseInt(newLink.episode),
      }, { withCredentials: true });
      setLinks((l) => [...l.filter((x) => !(x.animeId === data.animeId && x.episode === data.episode)), data]
        .sort((a, b) => a.episode - b.episode));
      setNewLink({ episode: "", url: "", quality: "1080p", type: "M3U8" });
      toast("Link saved.");
    } catch (err) {
      toast(err?.response?.data?.error || "Failed to save link.", "error");
    } finally { setSaving(false); }
  };

  const removeLink = async (id) => {
    try {
      await axios.delete(`/api/admin/content/links/${id}`, { withCredentials: true });
      setLinks((l) => l.filter((x) => x._id !== id));
      toast("Link deleted.");
    } catch { toast("Failed to delete.", "error"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-2xl rounded-2xl p-7 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-lg">Edit Video Links</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              {anime.title} — custom stream URL overrides per episode
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        {/* Add new link */}
        <div className="bg-[#0c0d10] rounded-xl p-4 border border-white/5 mb-5 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Add / Update Episode Link</p>
          <div className="grid grid-cols-4 gap-2">
            <input className={inp} type="number" placeholder="Episode #" value={newLink.episode}
              onChange={(e) => setNewLink((l) => ({ ...l, episode: e.target.value }))} />
            <input className={inp + " col-span-2"} placeholder="Stream URL (M3U8 or MP4)" value={newLink.url}
              onChange={(e) => setNewLink((l) => ({ ...l, url: e.target.value }))} />
            <select value={newLink.type} onChange={(e) => setNewLink((l) => ({ ...l, type: e.target.value }))}
              className={inp}>
              <option value="M3U8">M3U8</option>
              <option value="MP4">MP4</option>
            </select>
          </div>
          <button onClick={addLink} disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all">
            <Plus size={12} />{saving ? "Saving…" : "Add Link"}
          </button>
        </div>

        {loading ? (
          <p className="text-white/20 text-[13px] text-center py-6">Loading…</p>
        ) : links.length === 0 ? (
          <p className="text-white/20 text-[13px] text-center py-6">No custom links saved for this anime yet.</p>
        ) : (
          <div className="space-y-2">
            {links.map((l) => (
              <div key={l._id} className="flex items-center gap-3 bg-[#0c0d10] rounded-xl px-4 py-3 border border-white/5">
                <span className="text-[11px] font-bold text-red-400 w-16 shrink-0">EP {l.episode}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 w-10 shrink-0">{l.type}</span>
                <span className="flex-1 text-[12px] text-white/60 font-mono truncate">{l.url}</span>
                <button onClick={() => removeLink(l._id)} className="text-white/20 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bulk Import Modal ─────────────────────────────────────────────────────────
function BulkImportModal({ anime, onClose, toast }) {
  const [form, setForm]         = useState({ episodeFrom: "1", episodeTo: "12", audioType: "sub" });
  const [importing, setImporting] = useState(false);
  const [result, setResult]     = useState(null);

  const animeId = anime._id || anime.id;

  const runImport = async () => {
    const from = parseInt(form.episodeFrom);
    const to   = parseInt(form.episodeTo);
    if (isNaN(from) || isNaN(to) || from > to) {
      toast("Invalid episode range.", "error"); return;
    }
    if (to - from > 500) {
      toast("Maximum 500 episodes per batch.", "error"); return;
    }
    setImporting(true);
    setResult(null);
    try {
      const { data } = await axios.post("/api/admin/anime/bulk-import", {
        animeId, animeTitle: anime.title,
        episodeFrom: from, episodeTo: to, audioType: form.audioType,
      }, { withCredentials: true, timeout: 300_000 });
      setResult(data);
      toast(`Imported ${data.imported} episode link${data.imported !== 1 ? "s" : ""}.`);
    } catch (err) {
      const msg = err?.response?.data?.error || "Import failed.";
      toast(msg, "error");
      setResult({ success: false, error: msg });
    } finally { setImporting(false); }
  };

  const f = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md rounded-2xl p-7 space-y-5"
        style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Auto-Import Episodes</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{anime.title}</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl px-4 py-3 text-[11px] text-amber-300/80 leading-relaxed">
          Fetches stream URLs from Consumet API for the given episode range and saves them to the database. Large ranges may take a few minutes.
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>From Episode</label>
              <input className={inp} type="number" min="1" value={form.episodeFrom} onChange={f("episodeFrom")} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>To Episode</label>
              <input className={inp} type="number" min="1" value={form.episodeTo} onChange={f("episodeTo")} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Audio Type</label>
            <select className={inp} value={form.audioType} onChange={f("audioType")}>
              <option value="sub">Sub</option>
              <option value="dub">Dub</option>
            </select>
          </div>
        </div>

        {importing && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader size={22} className="text-red-500 animate-spin" />
            <p className="text-[12px] text-white/50">
              Importing episodes {form.episodeFrom}–{form.episodeTo}… This may take a while.
            </p>
            <p className="text-[10px] text-white/30">Do not close this window.</p>
          </div>
        )}

        {result && !importing && (
          <div className={`rounded-xl px-4 py-3 text-[12px] border ${
            result.success
              ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-300"
              : "bg-red-600/10 border-red-500/20 text-red-300"
          }`}>
            {result.success
              ? `✓ Done: ${result.imported} imported, ${result.results?.failed || 0} failed`
              : `✗ ${result.error}`}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button onClick={runImport} disabled={importing}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all">
            <Download size={13} />{importing ? "Importing…" : "Start Import"}
          </button>
          <button onClick={onClose} disabled={importing}
            className="text-white/40 hover:text-white text-[11px] font-medium transition-colors disabled:opacity-30">
            {importing ? "Please wait…" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function ContentPanel() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [editLinks, setEditLinks] = useState(null);
  const [bulkTarget, setBulkTarget] = useState(null);
  const { toasts, toast }         = useToast();

  const load = () => {
    setLoading(true);
    axios.get("/api/admin/content/anime", { withCredentials: true })
      .then(({ data }) => setAnimeList(Array.isArray(data) ? data : []))
      .catch(() => { toast("Failed to load anime list.", "error"); setAnimeList([]); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This also removes all video links.`)) return;
    try {
      await axios.delete(`/api/admin/content/anime/${id}`, { withCredentials: true });
      setAnimeList((l) => l.filter((a) => a._id !== id));
      toast("Anime deleted.");
    } catch { toast("Failed to delete.", "error"); }
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} />

      {showAdd   && <AddAnimeModal   onClose={() => setShowAdd(false)}    onSaved={load} toast={toast} />}
      {editLinks && <EditLinksModal  anime={editLinks} onClose={() => setEditLinks(null)}   toast={toast} />}
      {bulkTarget && <BulkImportModal anime={bulkTarget} onClose={() => setBulkTarget(null)} toast={toast} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Content Manager</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Add custom anime entries, manage episode stream links, and bulk-import episodes.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
          <Plus size={13} />Add Anime
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/20 text-[13px]">Loading…</div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-16 space-y-3 rounded-2xl border border-white/5"
          style={{ backgroundColor: "#14161d" }}>
          <p className="text-white/20 text-[14px]">No custom anime entries yet.</p>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 mx-auto bg-red-600/10 border border-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl">
            <Plus size={12} />Add Your First Anime
          </button>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5">
            {["Anime", "Genres", "Episodes", "Added", "Actions"].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-white/[0.03] max-h-[520px] overflow-y-auto">
            {animeList.map((a) => (
              <div key={a._id} className="grid grid-cols-5 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {a.coverImage
                    ? <img src={a.coverImage} className="w-8 h-10 rounded object-cover border border-white/10 shrink-0" alt="" />
                    : <div className="w-8 h-10 rounded bg-red-600/10 shrink-0 flex items-center justify-center">
                        <Edit3 size={10} className="text-red-500" />
                      </div>
                  }
                  <span className="text-[12px] font-medium text-white/90 line-clamp-2">{a.title}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(a.genres || []).slice(0, 2).map((g) => (
                    <span key={g} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40">{g}</span>
                  ))}
                </div>
                <span className="text-[12px] text-white/50">{a.episodes || "—"}</span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setEditLinks(a)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors">
                    <Link size={11} />Links
                  </button>
                  <button onClick={() => setBulkTarget(a)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500/60 hover:text-amber-400 transition-colors">
                    <Download size={11} />Import
                  </button>
                  <button onClick={() => remove(a._id, a.title)}
                    className="text-white/20 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
