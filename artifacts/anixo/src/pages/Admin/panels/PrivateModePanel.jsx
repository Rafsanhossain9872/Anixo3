import { useState, useEffect } from "react";
import axios from "axios";
import { Save } from "lucide-react";

const inp = "w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20";

export default function PrivateModePanel() {
  const [privateMode, setPrivateMode] = useState(false);
  const [privateMessage, setPrivateMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/config", { withCredentials: true }).then(({ data }) => {
      setPrivateMode(data.adminCfg.privateMode ?? false);
      setPrivateMessage(data.adminCfg.privateMessage || "");
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await axios.post("/api/admin/config", { privateMode, privateMessage }, { withCredentials: true });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch { /* noop */ } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">Private Access Gate</h2>
          <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Require single-use keys for all public traffic.</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all disabled:opacity-40">
          <Save size={13} />{saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </div>

      <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-sm">Private Mode</p>
            <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              When ON, all visitors without a valid <code className="text-red-400 text-[10px]">private_access_granted</code> cookie will see the access gate.
            </p>
          </div>
          <button onClick={() => setPrivateMode(!privateMode)}
            className={`w-12 h-6 rounded-full transition-all relative ${privateMode ? "bg-red-600" : "bg-white/10"}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${privateMode ? "left-7" : "left-1"}`} />
          </button>
        </div>

        <div className="h-px bg-white/5" />

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Gate Message</label>
          <textarea rows={3} className={inp + " resize-none"} value={privateMessage}
            onChange={(e) => setPrivateMessage(e.target.value)}
            placeholder="This site is in private beta. Enter your key to access." />
          <p className="text-[10px] mt-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>This message is shown on the private access gate screen.</p>
        </div>

        <div className="bg-[#0c0d10] rounded-xl px-4 py-4 border border-white/5">
          <p className="text-[11px] font-bold text-white mb-1">How it works</p>
          <ul className="text-[11px] space-y-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            <li>• Users are blocked at the client gate and shown your message above</li>
            <li>• They must enter a valid single-use key generated in the Access Keys panel</li>
            <li>• On success, a <code className="text-red-400">private_access_granted</code> cookie is set (30 days)</li>
            <li>• Admins with the bypass cookie always skip the gate silently</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
