import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Mail, Link2, RefreshCw, Trash2, CheckCheck, Eye, AlertCircle } from "lucide-react";

function fmt(d) {
  return d ? new Date(d).toLocaleString() : "—";
}

function Badge({ green, children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${green ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
      {children}
    </span>
  );
}

export default function TicketsPanel() {
  const [tab, setTab]           = useState("tickets");
  const [tickets, setTickets]   = useState([]);
  const [reports, setReports]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/tickets", { withCredentials: true });
      setTickets(data);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/broken-links", { withCredentials: true });
      setReports(data);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === "tickets") loadTickets();
    else loadReports();
  }, [tab, loadTickets, loadReports]);

  const markRead = async (id) => {
    try {
      await axios.patch(`/api/admin/tickets/${id}`, {}, { withCredentials: true });
      setTickets((ts) => ts.map((t) => t._id === id ? { ...t, isRead: true } : t));
    } catch { /* noop */ }
  };

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`/api/admin/tickets/${id}`, { withCredentials: true });
      setTickets((ts) => ts.filter((t) => t._id !== id));
    } catch { /* noop */ }
  };

  const resolveReport = async (id) => {
    try {
      await axios.patch(`/api/admin/broken-links/${id}`, {}, { withCredentials: true });
      setReports((rs) => rs.map((r) => r._id === id ? { ...r, isResolved: true } : r));
    } catch { /* noop */ }
  };

  const deleteReport = async (id) => {
    try {
      await axios.delete(`/api/admin/broken-links/${id}`, { withCredentials: true });
      setReports((rs) => rs.filter((r) => r._id !== id));
    } catch { /* noop */ }
  };

  const unreadCount = tickets.filter((t) => !t.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Legal & Support Tickets</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Contact form submissions and broken link reports.
          </p>
        </div>
        <button onClick={() => tab === "tickets" ? loadTickets() : loadReports()} disabled={loading}
          className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("tickets")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === "tickets" ? "bg-red-600 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}>
          <Mail size={12} />Inquiries
          {unreadCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>
          )}
        </button>
        <button onClick={() => setTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${tab === "reports" ? "bg-red-600 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}>
          <Link2 size={12} />Broken Links
          {reports.filter((r) => !r.isResolved).length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{reports.filter((r) => !r.isResolved).length}</span>
          )}
        </button>
      </div>

      {/* ── Contact Inquiries ──────────────────────────────────────────── */}
      {tab === "tickets" && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          {loading ? (
            <div className="text-center py-12 text-white/20 text-[13px]">Loading tickets…</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-[13px]">No contact submissions yet.</div>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {tickets.map((t) => (
                <div key={t._id} className={`transition-colors ${!t.isRead ? "bg-white/[0.02]" : ""}`}>
                  <div
                    className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02]"
                    onClick={() => { setExpanded(expanded === t._id ? null : t._id); if (!t.isRead) markRead(t._id); }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {!t.isRead && <Badge>New</Badge>}
                        <span className="text-[12px] font-bold text-white truncate">{t.subject}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-white/30">
                        <span>{t.name}</span>
                        <span>·</span>
                        <span>{t.email}</span>
                        <span>·</span>
                        <span>{fmt(t.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); deleteTicket(t._id); }}
                        className="text-white/20 hover:text-red-500 transition-colors p-1" title="Delete">
                        <Trash2 size={12} />
                      </button>
                      {t.isRead
                        ? <Badge green>Read</Badge>
                        : <button onClick={(e) => { e.stopPropagation(); markRead(t._id); }}
                            className="text-white/30 hover:text-emerald-400 transition-colors p-1" title="Mark read">
                            <CheckCheck size={12} />
                          </button>
                      }
                      <Eye size={12} className="text-white/20" />
                    </div>
                  </div>
                  {expanded === t._id && (
                    <div className="px-5 pb-4">
                      <div className="bg-[#0c0d10] rounded-xl p-4 text-[13px] text-white/70 whitespace-pre-wrap leading-relaxed border border-white/5">
                        {t.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Broken Links ───────────────────────────────────────────────── */}
      {tab === "reports" && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          {loading ? (
            <div className="text-center py-12 text-white/20 text-[13px]">Loading reports…</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-white/20 text-[13px]">No broken link reports yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5">
                {["Anime", "Episode", "Server", "Reported", "Actions"].map((h) => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
                ))}
              </div>
              <div className="divide-y divide-white/[0.03] max-h-[480px] overflow-y-auto">
                {reports.map((r) => (
                  <div key={r._id} className="grid grid-cols-5 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0 pr-2">
                      <p className="text-[12px] text-white/80 truncate">{r.animeTitle || "Unknown"}</p>
                      <p className="text-[10px] font-mono text-white/30">id: {r.animeId}</p>
                    </div>
                    <span className="text-[12px] text-white/60">Ep {r.episode}</span>
                    <span className="text-[11px] text-white/40 capitalize">{r.server}</span>
                    <span className="text-[11px] text-white/30">{fmt(r.reportedAt)}</span>
                    <div className="flex items-center gap-2">
                      {r.isResolved
                        ? <Badge green>Resolved</Badge>
                        : <button onClick={() => resolveReport(r._id)}
                            className="text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40">
                            Resolve
                          </button>
                      }
                      <button onClick={() => deleteReport(r._id)} className="text-white/20 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
