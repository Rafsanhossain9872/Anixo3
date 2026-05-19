import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Copy, Trash2, Download, Ban } from "lucide-react";

const EXPIRY_OPTIONS = [
  { value: "lifetime", label: "Lifetime" },
  { value: "24h",      label: "24 Hours" },
  { value: "7d",       label: "7 Days"   },
  { value: "30d",      label: "30 Days"  },
];

function fmtExpiry(k) {
  if (k.isRevoked)  return { label: "Revoked",  color: "text-red-400" };
  if (k.isUsed)     return { label: "Used",      color: "text-white/25" };
  if (!k.expiresAt) return { label: "Lifetime",  color: "text-emerald-400" };
  const exp = new Date(k.expiresAt);
  if (exp < new Date()) return { label: "Expired", color: "text-red-400" };
  const ms   = exp - Date.now();
  const hrs  = Math.floor(ms / 3600000);
  const days = Math.floor(hrs / 24);
  const label = days > 0 ? `${days}d left` : `${hrs}h left`;
  return { label, color: "text-amber-400" };
}

export default function KeysPanel() {
  const [keys, setKeys]           = useState([]);
  const [quantity, setQuantity]   = useState(5);
  const [expiresIn, setExpiresIn] = useState("lifetime");
  const [loading, setLoading]     = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied]       = useState("");

  const load = () => {
    setLoading(true);
    axios.get("/api/admin/keys", { withCredentials: true })
      .then(({ data }) => setKeys(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      await axios.post("/api/admin/keys/generate", { quantity, expiresIn }, { withCredentials: true });
      load();
    } catch { /* noop */ } finally { setGenerating(false); }
  };

  const remove = async (key) => {
    try {
      await axios.delete(`/api/admin/keys/${key}`, { withCredentials: true });
      setKeys((k) => k.filter((x) => x.key !== key));
    } catch { /* noop */ }
  };

  const revoke = async (key) => {
    try {
      const { data } = await axios.post(`/api/admin/keys/${key}/revoke`, {}, { withCredentials: true });
      setKeys((ks) => ks.map((k) => k.key === key ? { ...k, isRevoked: data.isRevoked } : k));
    } catch { /* noop */ }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(text); setTimeout(() => setCopied(""), 2000); });
  };

  const copyAll = () => {
    const unused = keys.filter((k) => !k.isUsed && !k.isRevoked).map((k) => k.key).join("\n");
    navigator.clipboard.writeText(unused);
  };

  const unused   = keys.filter((k) => !k.isUsed && !k.isRevoked).length;
  const used     = keys.filter((k) => k.isUsed).length;
  const revoked  = keys.filter((k) => k.isRevoked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Access Keys</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Generate single-use ANIXO-XXXX-XXXX keys for private beta access.
          </p>
        </div>
        <a href="/api/admin/export/keys" className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
          <Download size={13} />Export CSV
        </a>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Keys", value: keys.length },
          { label: "Available",  value: unused,  red: true  },
          { label: "Used",       value: used                },
          { label: "Revoked",    value: revoked, amber: true },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className={`font-black text-2xl ${s.red ? "text-red-500" : s.amber ? "text-amber-400" : "text-white"}`}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Generator */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-white font-bold text-sm mb-4">Generate New Keys</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Qty</label>
            <input type="number" min={1} max={100} value={quantity}
              onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-3 py-2 outline-none focus:border-red-600/50 text-center"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-white/40 uppercase tracking-widest font-bold">Expires</label>
            <select value={expiresIn} onChange={(e) => setExpiresIn(e.target.value)}
              className="bg-[#0c0d10] border border-white/10 text-white text-[12px] rounded-xl px-3 py-2 outline-none focus:border-red-600/50">
              {EXPIRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <button onClick={generate} disabled={generating}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
            <Plus size={13} />{generating ? "Generating…" : "Generate Keys"}
          </button>
          {unused > 0 && (
            <button onClick={copyAll}
              className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">
              <Copy size={12} />Copy All Unused
            </button>
          )}
        </div>
      </div>

      {/* Keys table */}
      {loading ? (
        <div className="text-center py-12 text-white/20 text-[13px]">Loading keys…</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 text-white/20 text-[13px]">No keys yet. Generate some above.</div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="grid grid-cols-5 px-5 py-3 border-b border-white/5">
            {["Key", "Status", "Expiry", "Created", "Actions"].map((h) => (
              <span key={h} className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{h}</span>
            ))}
          </div>
          <div className="divide-y divide-white/[0.03] max-h-[440px] overflow-y-auto">
            {keys.map((k) => {
              const expInfo = fmtExpiry(k);
              return (
                <div key={k.key} className={`grid grid-cols-5 items-center px-5 py-3 hover:bg-white/[0.02] transition-colors ${k.isRevoked ? "opacity-50" : ""}`}>
                  <span className="font-mono text-[12px] text-white/80 tracking-wider">{k.key}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${k.isUsed ? "text-white/25" : k.isRevoked ? "text-red-400" : "text-emerald-400"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${k.isUsed ? "bg-white/20" : k.isRevoked ? "bg-red-400" : "bg-emerald-400"}`} />
                    {k.isRevoked ? "Revoked" : k.isUsed ? "Used" : "Available"}
                  </span>
                  <span className={`text-[11px] font-medium ${expInfo.color}`}>{expInfo.label}</span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {new Date(k.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-3">
                    {!k.isUsed && (
                      <>
                        <button onClick={() => copy(k.key)} className="text-white/30 hover:text-white transition-colors" title="Copy">
                          <Copy size={13} />
                        </button>
                        {copied === k.key && <span className="text-[10px] text-emerald-400">Copied!</span>}
                        <button onClick={() => revoke(k.key)}
                          className={`transition-colors ${k.isRevoked ? "text-amber-400 hover:text-white" : "text-white/20 hover:text-amber-400"}`}
                          title={k.isRevoked ? "Un-revoke" : "Revoke"}>
                          <Ban size={13} />
                        </button>
                      </>
                    )}
                    <button onClick={() => remove(k.key)} className="text-white/20 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
