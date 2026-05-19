function getCookie(name) {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}

function clearBypassCookies() {
  const past = "Thu, 01 Jan 1970 00:00:00 UTC";
  document.cookie = `admin_bypass=; expires=${past}; path=/; SameSite=None; Secure`;
  document.cookie = `bypass_ui=; expires=${past}; path=/; SameSite=None; Secure`;
}

export default function Maintenance() {
  const hasBypass = getCookie("bypass_ui") === "true";

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl text-center">

        {/* Logo */}
        <div className="mb-10">
          <span className="text-white font-black text-4xl tracking-tight">
            ANI<span className="text-[#E50914]">XO</span>
          </span>
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          Under Maintenance
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
          Anixo.online |{" "}
          <span className="text-[#E50914]">Maintenance</span>
        </h1>

        {/* Description */}
        <p className="text-white/50 text-[15px] leading-relaxed max-w-xl mx-auto mb-12">
          Anixo is currently in Maintenance Mode. I am currently resolving 24+
          technical points. Track my live progress below.
        </p>

        {/* Progress block */}
        <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-2xl p-6 md:p-8 mb-8 text-left">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-[12px] font-bold uppercase tracking-[0.15em]">
              Deployment Progress
            </span>
            <span className="text-[#E50914] font-black text-xl">65%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#E50914] to-[#ff4d4d] rounded-full relative"
              style={{ width: "65%" }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] -mr-1" />
            </div>
          </div>

          <p className="text-white/30 text-[11px]">65% Complete</p>

          {/* Checklist */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Database migration", done: true },
              { label: "Authentication system", done: true },
              { label: "Streaming engine v3", done: true },
              { label: "API rate limiting", done: true },
              { label: "CDN configuration", done: true },
              { label: "Episode sync service", done: true },
              { label: "Search optimization", done: false },
              { label: "Subtitle pipeline", done: false },
              { label: "Watchlist sync", done: false },
              { label: "Final QA & deployment", done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-1.5">
                <span
                  className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black ${
                    item.done
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/[0.04] text-white/20 border border-white/[0.08]"
                  }`}
                >
                  {item.done ? "✓" : "○"}
                </span>
                <span
                  className={`text-[12px] font-medium ${
                    item.done ? "text-white/60 line-through decoration-white/20" : "text-white/40"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-center mb-10">
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-xl px-6 py-4 flex-1">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Status</p>
            <p className="text-white font-bold text-[13px]">Active Maintenance</p>
          </div>
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-xl px-6 py-4 flex-1">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Issues Resolved</p>
            <p className="text-[#E50914] font-black text-[13px]">16 / 24+</p>
          </div>
          <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-xl px-6 py-4 flex-1">
            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Expected</p>
            <p className="text-white font-bold text-[13px]">Coming Soon</p>
          </div>
        </div>

        {/* Exit Bypass button — only visible when admin bypass cookie is active */}
        {hasBypass && (
          <div className="mb-8">
            <button
              onClick={() => {
                clearBypassCookies();
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-[11px] font-bold uppercase tracking-[0.2em] px-6 py-3 rounded-xl transition-all duration-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Exit Admin Bypass
            </button>
            <p className="text-white/20 text-[10px] mt-2">
              Clicking this will lock the site back into maintenance mode.
            </p>
          </div>
        )}

        {/* Footer note */}
        <p className="text-white/20 text-[11px]">
          &copy; {new Date().getFullYear()} Anixo.online &bull; We'll be back shortly.
        </p>
      </div>
    </div>
  );
}
