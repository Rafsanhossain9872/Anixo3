import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AdminContext = createContext({
  adsEnabled: true,
  adSlots:    { top: true, mid: true, footer: true },
  privateMode: false,
  heroAnimeId: null,
  liveAlert:   { active: false, message: "" },
  adminConfigLoaded: false,
});

export function AdminContextProvider({ children }) {
  const [cfg, setCfg] = useState({
    adsEnabled: true,
    adSlots:    { top: true, mid: true, footer: true },
    privateMode: false,
    heroAnimeId: null,
    liveAlert:   { active: false, message: "" },
    adminConfigLoaded: false,
  });

  const [shownAlert, setShownAlert]   = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const pollRef = useRef(null);

  const loadConfig = useCallback(() => {
    fetch("/admin-config.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setCfg((prev) => ({
          ...prev,
          adsEnabled:  data.adsEnabled  ?? true,
          adSlots:     data.adSlots     ?? { top: true, mid: true, footer: true },
          privateMode: data.privateMode ?? false,
          heroAnimeId: data.heroAnimeId ?? null,
          liveAlert:   data.liveAlert   || { active: false, message: "" },
          adminConfigLoaded: true,
        }));
      })
      .catch(() => setCfg((prev) => ({ ...prev, adminConfigLoaded: true })));
  }, []);

  useEffect(() => {
    loadConfig();
    pollRef.current = setInterval(loadConfig, 30_000);
    return () => clearInterval(pollRef.current);
  }, [loadConfig]);

  useEffect(() => {
    if (cfg.liveAlert?.active && cfg.liveAlert?.message && cfg.liveAlert.message !== shownAlert) {
      setShownAlert(cfg.liveAlert.message);
      setAlertVisible(true);
      const t = setTimeout(() => setAlertVisible(false), 8000);
      return () => clearTimeout(t);
    }
  }, [cfg.liveAlert, shownAlert]);

  return (
    <AdminContext.Provider value={cfg}>
      {children}
      {alertVisible && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] max-w-lg w-full px-4 animate-in fade-in slide-in-from-top duration-500">
          <div className="bg-[#1a0505] border border-red-600/40 rounded-xl px-5 py-4 flex items-start gap-4 shadow-[0_20px_60px_rgba(220,38,38,0.3)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mb-0.5">Live Announcement</p>
              <p className="text-[13px] text-white/90 leading-snug">{cfg.liveAlert?.message}</p>
            </div>
            <button onClick={() => setAlertVisible(false)} className="text-white/30 hover:text-white text-lg leading-none mt-0.5">×</button>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
}

export function useAdminConfig() {
  return useContext(AdminContext);
}
