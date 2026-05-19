import { useState } from "react";
import axios from "axios";

export default function PrivateGate({ message }) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/admin/private/validate-key", { key: key.trim() }, { withCredentials: true });
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or already-used key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0c0d10" }}>
      <div className="w-full max-w-sm">
        <div className="w-full h-px mb-12" style={{ background: "linear-gradient(to right, transparent, rgba(220,38,38,0.4), transparent)" }} />

        <div className="text-center mb-10">
          <span className="text-white font-black text-3xl tracking-tight select-none">ANI<span className="text-red-600">XO</span></span>
          <div className="mt-4 inline-flex items-center gap-2 border border-red-600/20 px-4 py-1.5 rounded-full" style={{ backgroundColor: "rgba(220,38,38,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Private Access</span>
          </div>
        </div>

        <div className="rounded-2xl p-7" style={{ backgroundColor: "#13151a", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-white font-bold text-lg mb-2">Access Required</h2>
          <p className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            {message || "This site is in private beta. Enter your access key to continue."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="ANIXO-XXXX-XXXX"
              className="w-full bg-[#0c0d10] border border-white/10 text-white text-[13px] rounded-xl px-4 py-3 outline-none focus:border-red-600/50 font-mono tracking-widest placeholder:text-white/20 placeholder:font-sans placeholder:tracking-normal"
            />
            {error && <p className="text-red-500 text-[11px] font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[11px] uppercase tracking-[0.2em] py-3 rounded-xl transition-all"
            >
              {loading ? "Validating…" : "Enter Site"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] mt-6" style={{ color: "rgba(255,255,255,0.15)" }}>
          &copy; {new Date().getFullYear()} Anixo — Private Beta
        </p>
      </div>
    </div>
  );
}
