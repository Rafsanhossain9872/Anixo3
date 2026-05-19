import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Eye, TrendingUp, RefreshCw, Activity, Radio, Zap } from "lucide-react";

function StatCard({ icon: Icon, label, value, color = "text-white" }) {
  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-white/30" />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
      </div>
      <p className={`font-black text-3xl ${color}`}>{value ?? "—"}</p>
    </div>
  );
}

function timeAgo(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function AnalyticsPanel() {
  const [stats, setStats]         = useState(null);
  const [active, setActive]       = useState(null);
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [kicking, setKicking]     = useState("");
  const [lastSync, setLastSync]   = useState(null);

  const load = useCallback(async () => {
    try {
      const [{ data: s }, { data: a }, { data: sess }] = await Promise.all([
        axios.get("/api/admin/analytics",        { withCredentials: true }),
        axios.get("/api/admin/analytics/active", { withCredentials: true }),
        axios.get("/api/admin/sessions",         { withCredentials: true }),
      ]);
      setStats(s);
      setActive(a.activeUsers ?? 0);
      setSessions(sess);
      setLastSync(new Date());
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 10_000);
    return () => clearInterval(iv);
  }, [load]);

  const kickSession = async (id) => {
    setKicking(id);
    try {
      await axios.delete(`/api/admin/sessions/${id}`, { withCredentials: true });
      setSessions((s) => s.filter((x) => x.id !== id));
      setActive((n) => Math.max(0, (n ?? 1) - 1));
    } catch { /* noop */ } finally { setKicking(""); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Real-Time Analytics</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Live platform metrics — auto-refreshed every 10 seconds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              Synced {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />Refresh
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Activity}   label="Active Users (3 min)" value={active}                  color="text-emerald-400" />
        <StatCard icon={Eye}        label="Total Page Views"       value={stats?.totalViews ?? 0} color="text-white" />
        <StatCard icon={TrendingUp} label="Anime Tracked"          value={stats?.totalAnime ?? 0} color="text-red-400" />
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/10"
        style={{ backgroundColor: "rgba(16,185,129,0.04)" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-[11px] text-emerald-400 font-medium">
          {active !== null ? `${active} user${active !== 1 ? "s" : ""} actively browsing right now` : "Loading active sessions…"}
        </span>
      </div>

      {/* ── Live Radar ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <Radio size={14} className="text-red-500" />
          <span className="text-white font-bold text-sm">Live Radar</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
            <Zap size={10} />Auto-refresh 10s
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-white/20 text-[13px]">No active sessions right now.</div>
        ) : (
          <>
            <div className="grid grid-cols-4 px-5 py-3 border-b border-white/5">
              {["Session ID", "Current Page", "Last Active", "Action"].map((h) => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[320px] overflow-y-auto">
              {sessions.map((s) => (
                <div key={s.id} className="grid grid-cols-4 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="font-mono text-[11px] text-white/50 truncate">{s.id.slice(0, 12)}…</span>
                  <span className="text-[12px] text-white/70 truncate">{s.page || "/"}</span>
                  <span className="text-[11px] text-white/30">{timeAgo(s.sinceMs)}</span>
                  <button
                    onClick={() => kickSession(s.id)}
                    disabled={kicking === s.id}
                    className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all w-fit disabled:opacity-40">
                    {kicking === s.id ? "Kicking…" : "Kick"}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Top Watched Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <Users size={14} className="text-red-500" />
          <span className="text-white font-bold text-sm">Top Watched Anime</span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-white/20 text-[13px]">Loading analytics…</div>
        ) : !stats?.topAnime?.length ? (
          <div className="text-center py-10 text-white/20 text-[13px]">
            No view data yet. Views are tracked as users watch episodes.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 px-5 py-3 border-b border-white/5">
              {["#", "Anime", "Views", "Last Viewed"].map((h) => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[420px] overflow-y-auto">
              {stats.topAnime.map((a, i) => (
                <div key={a.animeId} className="grid grid-cols-4 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className={`text-[13px] font-black ${i < 3 ? "text-red-500" : "text-white/30"}`}>#{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-white/90 truncate">{a.animeTitle || `ID: ${a.animeId}`}</p>
                    <p className="text-[10px] font-mono text-white/30">id: {a.animeId}</p>
                  </div>
                  <span className="text-white font-bold text-[14px]">{a.views.toLocaleString()}</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {a.lastViewed ? new Date(a.lastViewed).toLocaleDateString() : "—"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
