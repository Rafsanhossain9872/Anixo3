import { useState, useEffect } from "react";
import axios from "axios";
import { Download, RefreshCw, Search, TrendingUp } from "lucide-react";

export default function LogsPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/logs", { withCredentials: true });
      setLogs(Array.isArray(data) ? data : []);
    } catch { setLogs([]); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const total = logs.reduce((sum, l) => sum + (l.count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">System Logs & Backup</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Monitor failed searches and export data backups.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => load(true)} disabled={refreshing}
            className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />Refresh
          </button>
        </div>
      </div>

      {/* Backup buttons */}
      <div className="grid grid-cols-2 gap-4">
        <a href="/api/admin/export/keys"
          className="flex items-center justify-center gap-3 rounded-2xl p-5 transition-all hover:border-red-600/30 group"
          style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Download size={20} className="text-red-500 group-hover:text-red-400" />
          <div>
            <p className="text-white font-bold text-sm">Download Access Keys</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Export all keys as CSV</p>
          </div>
        </a>
        <a href="/api/admin/export/users"
          className="flex items-center justify-center gap-3 rounded-2xl p-5 transition-all hover:border-red-600/30 group"
          style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Download size={20} className="text-red-500 group-hover:text-red-400" />
          <div>
            <p className="text-white font-bold text-sm">Download User List</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>Export all users as CSV</p>
          </div>
        </a>
      </div>

      {/* Failed searches */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-red-500" />
            <span className="text-white font-bold text-sm">Failed Search Queries</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{total} total failed attempts</span>
            <TrendingUp size={13} className="text-red-500" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/20 text-[13px]">Loading logs…</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-white/20 text-[13px]">No failed searches tracked yet.</p>
            <p className="text-white/10 text-[11px]">POST to /api/admin/track-failed-search to log a query.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 px-5 py-3 border-b border-white/5">
              {["Search Query", "Fail Count", "Last Attempted"].map((h) => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
              ))}
            </div>
            <div className="divide-y divide-white/[0.03] max-h-[400px] overflow-y-auto">
              {logs.map((l, i) => (
                <div key={i} className="grid grid-cols-3 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-[13px] font-medium text-white/80">"{l.query}"</span>
                  <span className="text-red-500 font-black text-[15px]">{l.count}</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {l.lastSearched ? new Date(l.lastSearched).toLocaleString() : "—"}
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
