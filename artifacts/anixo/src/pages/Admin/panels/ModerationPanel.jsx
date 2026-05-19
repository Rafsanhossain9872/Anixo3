import { useState } from "react";
import axios from "axios";
import { Search, Trash2, MessageSquare } from "lucide-react";
import { PYTHON_API } from "../../../services/api";

export default function ModerationPanel() {
  const [animeId, setAnimeId] = useState("");
  const [episode, setEpisode] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState({});
  const [fetched, setFetched] = useState(false);

  const fetchComments = async () => {
    if (!animeId) return;
    setLoading(true);
    setFetched(false);
    try {
      const params = new URLSearchParams({ animeId });
      if (episode) params.set("episode", episode);
      const { data } = await axios.get(`${PYTHON_API}/api/comments?${params}`, { withCredentials: false });
      setComments(Array.isArray(data) ? data : (data.comments || []));
      setFetched(true);
    } catch {
      setComments([]);
      setFetched(true);
    } finally { setLoading(false); }
  };

  const deleteComment = async (id, userId) => {
    setDeleting((d) => ({ ...d, [id]: true }));
    try {
      await axios.post(`${PYTHON_API}/api/comments/delete`, { commentId: id, userId }, { withCredentials: false });
      setComments((c) => c.filter((x) => (x.id || x._id) !== id));
    } catch { /* noop */ }
    finally { setDeleting((d) => ({ ...d, [id]: false })); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl">Comment Moderation</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Fetch and moderate comments by anime ID. Delete toxic content instantly.</p>
      </div>

      {/* Search bar */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex gap-3">
          <input type="text" value={animeId} onChange={(e) => setAnimeId(e.target.value)}
            placeholder="Anime ID (e.g. 21)"
            className="flex-1 bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20" />
          <input type="text" value={episode} onChange={(e) => setEpisode(e.target.value)}
            placeholder="Episode (optional)"
            className="w-36 bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20" />
          <button onClick={fetchComments} disabled={!animeId || loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
            <Search size={13} />{loading ? "Fetching…" : "Fetch"}
          </button>
        </div>
      </div>

      {/* Results */}
      {fetched && (
        comments.length === 0 ? (
          <div className="text-center py-12 text-white/20 text-[13px]">No comments found for this anime/episode.</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
              <MessageSquare size={14} className="text-red-500" />
              <span className="text-white font-bold text-sm">{comments.length} Comment{comments.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[520px] overflow-y-auto">
              {comments.map((c) => {
                const cid = c.id || c._id;
                return (
                  <div key={cid} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-red-600/15 flex items-center justify-center">
                      {c.avatar
                        ? <img src={c.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        : <span className="text-red-400 font-black text-[11px]">{c.user?.[0]?.toUpperCase() || "?"}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-bold text-white/80">{c.user || "Anonymous"}</span>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {c.time ? new Date(c.time).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{c.content}</p>
                    </div>
                    <button
                      onClick={() => deleteComment(cid, c.userId)}
                      disabled={deleting[cid]}
                      className="shrink-0 flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all disabled:opacity-40">
                      <Trash2 size={11} />{deleting[cid] ? "…" : "Delete"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}
