import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Save } from "lucide-react";

const inp = "w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20";
const btn = "flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all disabled:opacity-40";

export default function MaintenancePanel() {
  const [form, setForm] = useState({ announcementTitle: "", customMessage: "", progressPercentage: 70, isMaintenanceActive: true });
  const [checklist, setChecklist] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/config", { withCredentials: true }).then(({ data }) => {
      const m = data.maintenance;
      setForm({
        announcementTitle: m.announcementTitle || "",
        customMessage: m.customMessage || "",
        progressPercentage: m.progressPercentage ?? 70,
        isMaintenanceActive: m.isMaintenanceActive ?? true,
      });
      setChecklist(m.checklist || [
        { label: "Database migration & cluster sync", done: true },
        { label: "Streaming engine v3 deployment", done: true },
        { label: "Premium anime season import", done: false },
        { label: "Final QA & smoke tests", done: false },
      ]);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await axios.post("/api/admin/maintenance", { ...form, checklist }, { withCredentials: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* noop */ }
    finally { setSaving(false); }
  };

  const addRow = () => setChecklist((c) => [...c, { label: "", done: false }]);
  const removeRow = (i) => setChecklist((c) => c.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) => setChecklist((c) => c.map((r, idx) => idx === i ? { ...r, [key]: val } : r));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Maintenance Config</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Live-edit maintenance-config.json — changes apply instantly without rebuild.</p>
        </div>
        <button onClick={save} disabled={saving} className={btn}>
          <Save size={13} />{saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      {/* Master toggle */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">Maintenance Mode</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Toggle site-wide maintenance gate</p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, isMaintenanceActive: !f.isMaintenanceActive }))}
            className={`w-12 h-6 rounded-full transition-all relative ${form.isMaintenanceActive ? "bg-red-600" : "bg-white/10"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${form.isMaintenanceActive ? "left-7" : "left-1"}`} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Announcement Title</label>
          <input className={inp} value={form.announcementTitle} onChange={(e) => setForm((f) => ({ ...f, announcementTitle: e.target.value }))} placeholder="AniXo | Under Maintenance" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Custom Message</label>
          <textarea rows={3} className={inp + " resize-none"} value={form.customMessage} onChange={(e) => setForm((f) => ({ ...f, customMessage: e.target.value }))} placeholder="Describe the ongoing maintenance work…" />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Progress Percentage ({form.progressPercentage}%)</label>
          <input type="range" min={0} max={100} value={form.progressPercentage}
            onChange={(e) => setForm((f) => ({ ...f, progressPercentage: parseInt(e.target.value) }))}
            className="w-full accent-red-600" />
        </div>
      </div>

      {/* Checklist editor */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-bold text-sm">Checklist Items</p>
          <button onClick={addRow} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
            <Plus size={12} />Add Row
          </button>
        </div>
        <div className="space-y-2">
          {checklist.map((row, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#0c0d10] rounded-xl px-3 py-2 border border-white/5">
              <button
                onClick={() => updateRow(i, "done", !row.done)}
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border text-[9px] font-black transition-all ${row.done ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/10 text-white/20"}`}
              >
                {row.done ? "✓" : "○"}
              </button>
              <input
                className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-white/20"
                style={{ color: row.done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.85)" }}
                value={row.label}
                onChange={(e) => updateRow(i, "label", e.target.value)}
                placeholder="Checklist item…"
              />
              <button onClick={() => removeRow(i)} className="text-white/20 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
