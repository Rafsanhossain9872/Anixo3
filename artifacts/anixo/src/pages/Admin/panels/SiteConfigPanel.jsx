import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Save, Globe, AlertCircle, CheckCircle, Scale, Database, RefreshCw } from "lucide-react";

const inp = "w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20";

function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  return { toasts, toast: push };
}

function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-[13px] font-medium text-white ${
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

const SOCIAL_FIELDS = [
  { key: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/your-page" },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://twitter.com/your-handle" },
  { key: "messenger", label: "Messenger",   placeholder: "https://m.me/your-page" },
  { key: "reddit",    label: "Reddit",      placeholder: "https://reddit.com/r/your-community" },
  { key: "whatsapp",  label: "WhatsApp",    placeholder: "https://wa.me/your-number" },
  { key: "telegram",  label: "Telegram",    placeholder: "https://t.me/your-channel" },
  { key: "discord",   label: "Discord",     placeholder: "https://discord.gg/your-invite" },
];

const CLAUSE_LABELS = {
  acceptance:            "01. Acceptance of Terms",
  description:           "02. Description of Service",
  eligibility:           "03. User Eligibility",
  conduct:               "04. User Conduct & Acceptable Use",
  "intellectual-property": "05. Intellectual Property Rights",
  "third-party":         "06. Third-Party Content Disclaimer",
  dmca:                  "07. DMCA Compliance",
  responsibility:        "08. User Responsibility",
  liability:             "09. Limitation of Liability",
  warranties:            "10. Disclaimer of Warranties",
  termination:           "11. Termination of Access",
  changes:               "12. Changes to Terms",
  "governing-law":       "13. Governing Law & Dispute Resolution",
  contact:               "14. Contact Information",
};

export default function SiteConfigPanel() {
  const [tab, setTab]                   = useState("social");
  const [socialLinks, setSocialLinks]   = useState({});
  const [legalSections, setLegalSections] = useState({});
  const [saving, setSaving]             = useState(false);
  const [savingClause, setSavingClause] = useState("");
  const [seeding, setSeeding]           = useState(false);
  const [loadingLegal, setLoadingLegal] = useState(false);
  const { toasts, toast }               = useToast();

  const loadSocial = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/admin/config", { withCredentials: true });
      setSocialLinks(data.adminCfg?.socialLinks || {});
    } catch { /* noop */ }
  }, []);

  const loadLegal = useCallback(async () => {
    setLoadingLegal(true);
    try {
      const { data } = await axios.get("/api/admin/legal/sections");
      if (Array.isArray(data)) {
        const map = {};
        data.forEach((s) => { map[s.sectionId] = s.content || ""; });
        setLegalSections(map);
      }
    } catch { /* noop */ } finally { setLoadingLegal(false); }
  }, []);

  useEffect(() => { loadSocial(); }, [loadSocial]);
  useEffect(() => { if (tab === "legal") loadLegal(); }, [tab, loadLegal]);

  const saveSocial = async () => {
    setSaving(true);
    try {
      await axios.post("/api/admin/config", { socialLinks }, { withCredentials: true });
      toast("Social links saved.");
    } catch { toast("Failed to save.", "error"); }
    finally { setSaving(false); }
  };

  const saveClause = async (sectionId) => {
    setSavingClause(sectionId);
    try {
      await axios.put(`/api/admin/legal/sections/${sectionId}`,
        { content: legalSections[sectionId] || "" },
        { withCredentials: true },
      );
      toast(`Clause "${CLAUSE_LABELS[sectionId] || sectionId}" saved.`);
    } catch { toast("Failed to save clause.", "error"); }
    finally { setSavingClause(""); }
  };

  const seedDefaults = async () => {
    setSeeding(true);
    try {
      const { data } = await axios.post("/api/admin/legal/seed", {}, { withCredentials: true });
      toast(`Seeded ${data.seeded} of ${data.total} sections into database.`);
      loadLegal();
    } catch { toast("Seeding failed.", "error"); }
    finally { setSeeding(false); }
  };

  return (
    <div className="space-y-6">
      <Toast toasts={toasts} />
      <div>
        <h2 className="text-white font-bold text-xl">Site Configuration</h2>
        <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          Manage social media links and all 14 Terms of Service clauses.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "social", label: "Social Links",  icon: Globe  },
          { id: "legal",  label: "Legal Clauses", icon: Scale  },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === id ? "bg-red-600 text-white" : "bg-white/5 text-white/40 hover:text-white"
            }`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>

      {/* ── Social Links ───────────────────────────────────────────────── */}
      {tab === "social" && (
        <div className="rounded-2xl p-6 space-y-4" style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[12px] text-white/40">
            Override the default sharing URLs in the "Love this site?" banner. Leave blank to use auto-generated sharing links.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">{label}</label>
                <input
                  value={socialLinks[key] || ""}
                  onChange={(e) => setSocialLinks((p) => ({ ...p, [key]: e.target.value }))}
                  className={inp} placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <button onClick={saveSocial} disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all">
            <Save size={12} />{saving ? "Saving…" : "Save Social Links"}
          </button>
        </div>
      )}

      {/* ── Legal Clauses (14 ToS Sections) ───────────────────────────── */}
      {tab === "legal" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="rounded-xl px-4 py-2.5 text-[12px] text-amber-400/80 flex items-center gap-2 border border-amber-500/15"
              style={{ backgroundColor: "rgba(245,158,11,0.06)" }}>
              <AlertCircle size={13} className="shrink-0" />
              Custom text replaces the default Terms page content for each clause. Leave blank to use built-in defaults.
            </div>
            <button onClick={seedDefaults} disabled={seeding}
              className="flex items-center gap-2 ml-auto bg-white/5 hover:bg-white/10 disabled:opacity-40 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border border-white/10">
              <Database size={12} />{seeding ? "Seeding…" : "Seed Defaults to DB"}
            </button>
            <button onClick={loadLegal} disabled={loadingLegal}
              className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
              <RefreshCw size={12} className={loadingLegal ? "animate-spin" : ""} />Refresh
            </button>
          </div>

          {loadingLegal ? (
            <div className="text-center py-10 text-white/20 text-[13px]">Loading legal clauses…</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(CLAUSE_LABELS).map(([sectionId, label]) => (
                <div key={sectionId}
                  className="rounded-2xl p-5 space-y-3"
                  style={{ backgroundColor: "#14161d", border: "1px solid rgba(255,255,255,0.05)" }}>

                  <div className="flex items-center justify-between gap-3">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-white/50">{label}</label>
                    {legalSections[sectionId]?.trim() && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        DB Override Active
                      </span>
                    )}
                  </div>

                  <textarea
                    value={legalSections[sectionId] || ""}
                    onChange={(e) => setLegalSections((p) => ({ ...p, [sectionId]: e.target.value }))}
                    rows={4}
                    className={`${inp} resize-y`}
                    placeholder={`Enter custom content for "${label}"…\n\nUse double line breaks to separate paragraphs. Leave blank to use default built-in content.`}
                  />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => saveClause(sectionId)}
                      disabled={savingClause === sectionId}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all">
                      <Save size={11} />
                      {savingClause === sectionId ? "Saving…" : "Save Clause"}
                    </button>
                    {legalSections[sectionId]?.trim() && (
                      <button
                        onClick={() => {
                          setLegalSections((p) => ({ ...p, [sectionId]: "" }));
                          axios.put(
                            `/api/admin/legal/sections/${sectionId}`,
                            { content: "" },
                            { withCredentials: true },
                          ).then(() => toast(`Clause "${label}" reset to default.`))
                            .catch(() => toast("Reset failed.", "error"));
                        }}
                        className="text-[10px] text-white/30 hover:text-red-400 uppercase tracking-widest font-bold transition-colors">
                        Reset to Default
                      </button>
                    )}
                    <span className="ml-auto text-[10px] text-white/20">
                      {(legalSections[sectionId] || "").length.toLocaleString()} chars
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
