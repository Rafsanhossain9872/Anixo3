import { useAuth } from "../../hooks/useAuth";

/**
 * AdBanner — renders an ad unit for a specific slot.
 * slot: "top" | "mid" | "footer"  (defaults to "top")
 */
export default function AdBanner({ adClient, adSlot, slot = "top", className = "" }) {
  const { user } = useAuth();

  if (user?.isVIP) return null;

  return (
    <div
      className={`min-h-[90px] w-full flex items-center justify-center bg-[#0a0a0a] border-y border-white/[0.03] ${className}`}
      aria-label="Advertisement"
    >
      {adClient && adSlot ? (
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: "90px" }}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/15 select-none">
          Advertisement
        </span>
      )}
    </div>
  );
}
