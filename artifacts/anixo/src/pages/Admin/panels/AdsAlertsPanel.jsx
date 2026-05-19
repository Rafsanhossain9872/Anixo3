import { useState, useEffect } from "react";
import axios from "axios";
import { Save, Send, Megaphone, Eye, EyeOff, Layout, Layers, Monitor } from "lucide-react";

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)}
    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${value ? "bg-emerald-600" : "bg-white/10"}`}>
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${value ? "left-7" : "left-1"}`} />
  </button>
);

export default function AdsAlertsPanel() {
  const [adsEnabled, setAdsEnabled]   = useState(true);
  const [adSlots, setAdSlots]         = useState({ top: true, mid: true, footer: true });
  const [alertMsg, setAlertMsg]       = useState("");
  const [alertActive, setAlertActive] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [saved, setSaved]             = useState("");

  useEffect(() => {
    axios.get("/api/admin/config", { withCredentials: true }).then(({ data }) => {
      setAdsEnabled(data.adminCfg.adsEnabled ?? true);
      setAdSlots(data.adminCfg.adSlots ?? { top: true, mid: true, footer: true });
      setAlertMsg(data.adminCfg.liveAlert?.message || "");
      setAlertActive(data.adminCfg.liveAlert?.active || false);
    }).catch(() => {});
  }, []);

  const saveAds = async () => {
    setSaving(true);
    try {
      await axios.post("/api/admin/config", { adsEnabled, adSlots }, { withCredentials: true });
      setSaved("ads"); setTimeout(() => setSaved(""), 2500);
    } catch { /* noop */ } finally { setSaving(false); }
  };

  const sendAlert = async (active) => {
    setSendingAlert(true);
    try {
      await axios.post("/api/admin/config", { liveAlert: { message: alertMsg, active } }, { withCredentials: true });
      setAlertActive(active);
      setSaved("alert"); setTimeout(() => setSaved(""), 2500);
    } catch { /* noop */ } finally { setSendingAlert(false); }
  };

  const slotItems = [
    { key: "top",    label: "Top Ad",      desc: "Banner at top of pages",                 icon: Layout },
    { key: "mid",    label: "Mid-Page Ad", desc: "Below Next-Episode section, above Episodes list on Watch page", icon: Layers },
    { key: "footer", label: "Footer Ad",   desc: "Banner above site footer",               icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-xl">Ads & Live Alerts</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          Control ad placement per slot and broadcast live announcements to all active users.
        </p>
      </div>

      {/* Global Ad Switch */}
      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {adsEnabled ? <Eye size={18} className="text-emerald-400" /> : <EyeOff size={18} className="text-white/30" />}
            <div>
              <p className="text-white font-bold text-sm">Global Ad Master Switch</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                When OFF, ALL ad slots return null. VIP users always see no ads.
              </p>
            </div>
          </div>
          <Toggle value={adsEnabled} onChange={setAdsEnabled} />
        </div>

        {/* Per-slot controls */}
        <div className="border-t border-white/5 pt-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
            Individual Ad Slots
          </p>
          {slotItems.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
              adSlots[key] && adsEnabled ? "border-white/8 bg-white/[0.02]" : "border-white/5 opacity-60"
            }`}>
              <Icon size={15} className={adSlots[key] && adsEnabled ? "text-emerald-400" : "text-white/20"} />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-white/80">{label}</p>
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{desc}</p>
              </div>
              <Toggle
                value={adSlots[key] ?? true}
                onChange={(v) => setAdSlots((s) => ({ ...s, [key]: v }))}
              />
            </div>
          ))}
        </div>

        <button onClick={saveAds} disabled={saving}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
          <Save size={13} />{saved === "ads" ? "Saved ✓" : "Save Ad Settings"}
        </button>
      </div>

      {/* Live Alert */}
      <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3 mb-1">
          <Megaphone size={18} className="text-red-500" />
          <div>
            <p className="text-white font-bold text-sm">Live Broadcast Alert</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              Instantly shows a red toast on every active user's screen. Auto-polled every 30s.
            </p>
          </div>
        </div>

        <textarea rows={3} value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)}
          placeholder="Type your live announcement here…"
          className="w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-3 outline-none focus:border-red-600/50 transition-colors resize-none placeholder:text-white/20" />

        {alertActive && (
          <div className="flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] text-red-400 font-medium">Alert is LIVE — broadcasting to all active users</span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => sendAlert(true)} disabled={sendingAlert || !alertMsg.trim()}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
            <Send size={13} />{saved === "alert" ? "Sent ✓" : "Send Alert"}
          </button>
          {alertActive && (
            <button onClick={() => sendAlert(false)} disabled={sendingAlert}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all">
              Stop Alert
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
