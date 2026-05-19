import { useState } from "react";
import axios from "axios";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/admin/login", { password }, { withCredentials: true });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0c0d10" }}>
      <div className="w-full max-w-sm">
        <div className="w-full h-px mb-12" style={{ background: "linear-gradient(to right, transparent, rgba(220,38,38,0.5), transparent)" }} />

        <div className="text-center mb-10">
          <span className="text-white font-black text-4xl tracking-tight select-none">ANI<span className="text-red-600">XO</span></span>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-600/30" style={{ backgroundColor: "rgba(220,38,38,0.07)" }}>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">God Mode Admin</span>
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ backgroundColor: "#13151a", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-white font-bold text-xl mb-1">Secure Admin Access</h2>
          <p className="text-[12px] mb-7" style={{ color: "rgba(255,255,255,0.35)" }}>
            Enter your admin password to access the control panel.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoFocus
                className="w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-3 outline-none focus:border-red-600/50 transition-colors"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-lg px-3 py-2">
                <span className="text-red-500 text-[11px] font-medium">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-[11px] uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all shadow-[0_8px_24px_rgba(220,38,38,0.25)]"
            >
              {loading ? "Authenticating…" : "Access Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: "rgba(255,255,255,0.1)" }}>
          Unauthorized access is strictly prohibited.
        </p>
      </div>
    </div>
  );
}
