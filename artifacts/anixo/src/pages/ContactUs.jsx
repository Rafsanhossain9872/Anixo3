import { useState } from "react";
import { Mail, User, MessageSquare, FileText, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function sanitize(str) {
  return String(str).replace(/<[^>]*>/g, "").replace(/[<>"'`]/g, "").trim();
}

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) return;

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) { setStatus("invalid_email"); return; }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    sanitize(form.name).slice(0, 100),
          email:   sanitize(form.email).slice(0, 200),
          subject: sanitize(form.subject).slice(0, 200),
          message: sanitize(form.message).slice(0, 5000),
        }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full bg-[#0f1015] border border-white/10 text-white text-[14px] rounded-xl px-4 py-3 outline-none focus:border-red-600/50 transition-colors placeholder:text-white/20";

  return (
    <div className="min-h-screen bg-[#07080c] text-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600/10 border border-red-600/20 rounded-2xl mb-5">
            <Mail size={22} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Contact Us</h1>
          <p className="text-white/40 text-[14px] leading-relaxed">
            Have a question, report, or legal inquiry? Send us a message and we'll get back to you.
          </p>
        </div>

        {/* Success Banner */}
        {status === "success" && (
          <div className="flex items-center gap-3 bg-emerald-900/30 border border-emerald-500/20 rounded-xl px-5 py-4 mb-6 text-emerald-400 text-[13px] font-medium">
            <CheckCircle size={16} className="shrink-0" />
            Your message was received. We'll respond to your email as soon as possible.
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/20 rounded-xl px-5 py-4 mb-6 text-red-400 text-[13px] font-medium">
            <AlertCircle size={16} className="shrink-0" />
            Failed to send. Please try again or email us directly.
          </div>
        )}
        {status === "invalid_email" && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/20 rounded-xl px-5 py-4 mb-6 text-red-400 text-[13px] font-medium">
            <AlertCircle size={16} className="shrink-0" />
            Please enter a valid email address.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-2xl p-6 md:p-8 space-y-5"
          style={{ backgroundColor: "#0d0e14", border: "1px solid rgba(255,255,255,0.05)" }}>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">
                <User size={11} />Name
              </label>
              <input name="name" value={form.name} onChange={handleChange} required maxLength={100}
                className={inp} placeholder="Your full name" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">
                <Mail size={11} />Email
              </label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required maxLength={200}
                className={inp} placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">
              <FileText size={11} />Subject
            </label>
            <input name="subject" value={form.subject} onChange={handleChange} required maxLength={200}
              className={inp} placeholder="General Inquiry / DMCA / Bug Report / Other" />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">
              <MessageSquare size={11} />Message
            </label>
            <textarea name="message" value={form.message} onChange={handleChange} required maxLength={5000} rows={6}
              className={`${inp} resize-none`}
              placeholder="Describe your inquiry in detail..." />
            <p className="text-right text-[10px] text-white/20 mt-1">{form.message.length}/5000</p>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-[12px] uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-95">
            <Send size={14} />
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-center text-[12px]">
          <Link to="/dmca" className="rounded-xl py-3 px-4 text-white/40 hover:text-white border border-white/5 hover:border-white/10 transition-all">
            DMCA Policy
          </Link>
          <Link to="/terms" className="rounded-xl py-3 px-4 text-white/40 hover:text-white border border-white/5 hover:border-white/10 transition-all">
            Terms of Service
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
