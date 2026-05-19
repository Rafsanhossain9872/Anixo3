export default function MaintenancePage({ config = {} }) {
  const {
    progressPercentage = 65,
    technicalPointsCount = 24,
    customMessage = "We are currently performing scheduled maintenance. Stay tuned!",
    announcementTitle = "AniXo | Under Maintenance",
  } = config;

  const resolvedCount = Math.round((progressPercentage / 100) * technicalPointsCount);

  const checklist = config.checklist?.length > 0 ? config.checklist : [
    { label: "Database migration & cluster sync", done: true },
    { label: "Authentication system hardening", done: true },
    { label: "Streaming engine v3 deployment", done: true },
    { label: "API rate limiting & DDoS shields", done: true },
    { label: "CDN edge node configuration", done: true },
    { label: "Episode sync pipeline v2", done: true },
    { label: "Premium anime season import", done: progressPercentage >= 70 },
    { label: "Subtitle & dubbing pipeline", done: false },
    { label: "Watchlist cross-device sync", done: false },
    { label: "Final QA & smoke tests", done: false },
    { label: "DNS propagation & SSL renewal", done: false },
    { label: "Production deployment sign-off", done: false },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 font-sans"
      style={{ backgroundColor: "#0c0d10" }}
    >
      <div className="w-full max-w-2xl">

        {/* Structural sub-grid accent line */}
        <div className="w-full h-px mb-12" style={{ background: "linear-gradient(to right, transparent, rgba(220,38,38,0.4), transparent)" }} />

        {/* Logo mark */}
        <div className="mb-8 text-center">
          <span className="text-white font-black text-4xl tracking-tight select-none">
            ANI<span className="text-red-600">XO</span>
          </span>
        </div>

        {/* Status pill */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 border border-yellow-500/20 text-yellow-400 text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(234,179,8,0.07)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Under Maintenance
          </span>
        </div>

        {/* Dynamic title */}
        <h1 className="text-center text-3xl md:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
          {announcementTitle.split("|").map((part, i) =>
            i === 1
              ? <span key={i} className="text-red-500"> |{part}</span>
              : <span key={i}>{part}</span>
          )}
        </h1>

        {/* Dynamic custom message */}
        <p className="text-center text-[13px] leading-relaxed max-w-xl mx-auto mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
          {customMessage}
        </p>

        {/* Progress card */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-6"
          style={{ backgroundColor: "#13151a", border: "1px solid rgba(255,255,255,0.04)" }}
        >
          {/* Progress header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Deployment Progress
            </span>
            <span className="text-red-500 font-black text-2xl">{progressPercentage}%</span>
          </div>

          {/* Animated progress bar */}
          <div className="w-full h-[3px] rounded-full mb-2 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full relative transition-all duration-1000 ease-out"
              style={{
                width: `${progressPercentage}%`,
                background: "linear-gradient(to right, #dc2626, #ef4444, #f87171)",
                boxShadow: "0 0 10px rgba(220,38,38,0.5)",
              }}
            >
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white"
                style={{ boxShadow: "0 0 6px rgba(255,255,255,0.8)", marginRight: "-4px" }}
              />
            </div>
          </div>
          <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.25)" }}>
            {resolvedCount} of {technicalPointsCount} technical points resolved
          </p>

          {/* Checklist — sub-grid aligned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-1">
                <span
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[8px] font-black border"
                  style={item.done
                    ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#34d399", borderColor: "rgba(16,185,129,0.25)" }
                    : { backgroundColor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.07)" }
                  }
                >
                  {item.done ? "✓" : "○"}
                </span>
                <span
                  className="text-[12px] font-medium"
                  style={item.done
                    ? { color: "rgba(255,255,255,0.45)", textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.15)" }
                    : { color: "rgba(255,255,255,0.3)" }
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Status", value: "Active Maint." },
            { label: "Resolved", value: `${resolvedCount} / ${technicalPointsCount}+`, red: true },
            { label: "Expected", value: "Coming Soon" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-4 py-4 text-center"
              style={{ backgroundColor: "#13151a", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                {s.label}
              </p>
              <p className={`font-bold text-[12px] ${s.red ? "text-red-500" : "text-white"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom structural accent line */}
        <div className="w-full h-px mb-6" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.05), transparent)" }} />

        {/* Footer */}
        <p className="text-center text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>
          &copy; {new Date().getFullYear()} Anixo.online &bull; We'll be back shortly.
        </p>
      </div>
    </div>
  );
}
