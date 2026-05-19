import { useState, useEffect } from "react";
import axios from "axios";
import { Download, Crown, Ban, Search } from "lucide-react";

export default function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState({});

  useEffect(() => {
    axios.get("/api/admin/users", { withCredentials: true })
      .then(({ data }) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id, type) => {
    setPending((p) => ({ ...p, [`${id}-${type}`]: true }));
    try {
      const { data } = await axios.post(`/api/admin/users/${id}/${type}`, {}, { withCredentials: true });
      setUsers((us) => us.map((u) => u._id === id
        ? { ...u, isVIP: data.isVIP ?? u.isVIP, isBanned: data.isBanned ?? u.isBanned }
        : u));
    } catch { /* noop */ }
    finally { setPending((p) => ({ ...p, [`${id}-${type}`]: false })); }
  };

  const filtered = users.filter((u) =>
    !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">User Management</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Manage VIP status and bans across {users.length} registered accounts.</p>
        </div>
        <a href="/api/admin/export/users" className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
          <Download size={13} />Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: users.length },
          { label: "VIP Members", value: users.filter((u) => u.isVIP).length, gold: true },
          { label: "Banned", value: users.filter((u) => u.isBanned).length, red: true },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className={`font-black text-2xl ${s.gold ? "text-yellow-400" : s.red ? "text-red-500" : "text-white"}`}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search username or email…"
          className="w-full bg-[#14161d] border border-white/10 text-white text-[13px] rounded-xl pl-10 pr-4 py-3 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-white/20 text-[13px]">Loading users…</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5">
            {["User", "Email", "Joined", "VIP", "Ban"].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-white/[0.03] max-h-[480px] overflow-y-auto">
            {filtered.map((u) => (
              <div key={u._id} className={`grid grid-cols-5 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors ${u.isBanned ? "opacity-50" : ""}`}>
                <div className="flex items-center gap-3">
                  {u.avatar
                    ? <img src={u.avatar} className="w-7 h-7 rounded-full object-cover border border-white/10" alt="" />
                    : <div className="w-7 h-7 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 font-black text-[10px]">
                        {u.username?.[0]?.toUpperCase() || "?"}
                      </div>
                  }
                  <span className="text-[12px] font-medium text-white/90 truncate">{u.username}</span>
                  {u.isVIP && <Crown size={12} className="text-yellow-400 shrink-0" />}
                </div>
                <span className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{u.email}</span>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                </span>
                <button
                  onClick={() => toggle(u._id, "vip")}
                  disabled={pending[`${u._id}-vip`]}
                  className={`w-fit flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${u.isVIP
                    ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"}`}
                >
                  <Crown size={10} />{u.isVIP ? "VIP" : "Set VIP"}
                </button>
                <button
                  onClick={() => toggle(u._id, "ban")}
                  disabled={pending[`${u._id}-ban`]}
                  className={`w-fit flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${u.isBanned
                    ? "bg-red-600/15 border-red-500/30 text-red-400 hover:bg-red-600/25"
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-red-600/10 hover:text-red-400 hover:border-red-500/20"}`}
                >
                  <Ban size={10} />{u.isBanned ? "Banned" : "Ban"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
