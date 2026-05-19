import { useState } from "react";
import {
  Settings, Lock, Key, Users, MessageSquare,
  Star, Megaphone, BarChart3, LogOut, Menu, X, Film, Activity,
  Globe, Ticket,
} from "lucide-react";
import MaintenancePanel  from "./panels/MaintenancePanel";
import PrivateModePanel  from "./panels/PrivateModePanel";
import KeysPanel         from "./panels/KeysPanel";
import ContentPanel      from "./panels/ContentPanel";
import UsersPanel        from "./panels/UsersPanel";
import ModerationPanel   from "./panels/ModerationPanel";
import HeroPanel         from "./panels/HeroPanel";
import AdsAlertsPanel    from "./panels/AdsAlertsPanel";
import AnalyticsPanel    from "./panels/AnalyticsPanel";
import LogsPanel         from "./panels/LogsPanel";
import SiteConfigPanel   from "./panels/SiteConfigPanel";
import TicketsPanel      from "./panels/TicketsPanel";

const NAV = [
  { id: "maintenance", label: "Maintenance",    icon: Settings      },
  { id: "private",     label: "Private Gate",   icon: Lock          },
  { id: "keys",        label: "Access Keys",    icon: Key           },
  { id: "content",     label: "Content",        icon: Film          },
  { id: "users",       label: "Users",          icon: Users         },
  { id: "moderation",  label: "Moderation",     icon: MessageSquare },
  { id: "hero",        label: "Hero Config",    icon: Star          },
  { id: "ads",         label: "Ads & Alerts",   icon: Megaphone     },
  { id: "analytics",   label: "Analytics",      icon: Activity      },
  { id: "siteconfig",  label: "Site Config",    icon: Globe         },
  { id: "tickets",     label: "Legal & Tickets",icon: Ticket        },
  { id: "logs",        label: "Logs & Backup",  icon: BarChart3     },
];

const PANELS = {
  maintenance: MaintenancePanel,
  private:     PrivateModePanel,
  keys:        KeysPanel,
  content:     ContentPanel,
  users:       UsersPanel,
  moderation:  ModerationPanel,
  hero:        HeroPanel,
  ads:         AdsAlertsPanel,
  analytics:   AnalyticsPanel,
  siteconfig:  SiteConfigPanel,
  tickets:     TicketsPanel,
  logs:        LogsPanel,
};

function clearBypassCookies() {
  const past = "Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = `admin_bypass=; expires=${past}; path=/; SameSite=None; Secure`;
  document.cookie = `bypass_ui=; expires=${past}; path=/; SameSite=None; Secure`;
}

export default function AdminDashboard() {
  const [active, setActive]           = useState("maintenance");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActivePanel = PANELS[active] || MaintenancePanel;

  const exitAdmin = () => {
    clearBypassCookies();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0c0d10", color: "white" }}>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:z-auto`}
        style={{ backgroundColor: "#13151a", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

        <div className="px-6 py-7 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-black text-xl tracking-tight">ANI<span className="text-red-600">XO</span></span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-400">God Mode Admin</span>
              </div>
            </div>
            <button className="lg:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold transition-all text-left ${
                active === id
                  ? "bg-red-600 text-white shadow-[0_4px_14px_rgba(220,38,38,0.3)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} className={active === id ? "text-white" : "text-white/40"} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={exitAdmin}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[12px] font-bold text-white/40 hover:text-red-400 hover:bg-red-600/10 transition-all"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5" style={{ backgroundColor: "#13151a" }}>
          <button className="lg:hidden text-white/40 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-bold text-white truncate">
              {NAV.find((n) => n.id === active)?.label}
            </h1>
            <p className="text-[10px] mt-0.5 hidden sm:block" style={{ color: "rgba(255,255,255,0.3)" }}>
              AniXo Admin Control Panel · Changes take effect immediately
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20"
              style={{ backgroundColor: "rgba(16,185,129,0.07)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Session</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <ActivePanel />
          </div>
        </main>
      </div>
    </div>
  );
}
