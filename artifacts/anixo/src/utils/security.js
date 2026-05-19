/**
 * Security Utility: Protects the application from unauthorized inspections
 * and malicious third-party popup/redirect attacks from embedded video sources.
 */

export const initSecurity = () => {
  // ── Anti-Popup Shield (ALWAYS active, dev + prod) ─────────────────────────
  // Track last genuine user gesture to distinguish legitimate popups
  // (e.g. ShareBanner clicks) from auto-triggered ad redirects.
  let lastUserInteraction = 0;
  document.addEventListener("click",    () => { lastUserInteraction = Date.now(); }, true);
  document.addEventListener("touchend", () => { lastUserInteraction = Date.now(); }, true);

  const _nativeOpen = window.open.bind(window);
  window.open = function (url, target, features) {
    const timeSinceClick = Date.now() - lastUserInteraction;
    if (timeSinceClick > 1200) {
      // Blocked — no user gesture within the last 1.2 s
      return null;
    }
    return _nativeOpen(url, target, features);
  };

  // Block suspicious top-level navigation messages from embedded iframes
  window.addEventListener("message", (e) => {
    if (typeof e.data === "string") {
      const lower = e.data.toLowerCase();
      if (lower.includes("window.open") || lower.includes("location.href") || lower.includes("adredirect")) {
        // Silently discard
        e.stopImmediatePropagation();
      }
    }
  }, true);

  if (import.meta.env.DEV) return;

  // ── Console Ghosting (Production Only) ───────────────────────────────────
  const noop = () => {};
  const methods = ["log", "warn", "error", "info", "debug", "table", "clear", "dir"];
  methods.forEach((m) => {
    try {
      Object.defineProperty(console, m, {
        get: () => noop,
        set: () => { throw new Error("Security Violation"); },
        configurable: false,
      });
    } catch { /* Fallback for older browsers */ }
  });

  // ── Omega Heartbeat ───────────────────────────────────────────────────────
  const omegaShield = () => {
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    const isBrave   = navigator.brave !== undefined;
    const start     = performance.now();
    (function () { return true; })["constructor"]("debugger")();
    const limit = (isFirefox || isBrave) ? 3000 : 1000;
    if (performance.now() - start > limit) {
      // Optionally add redirect in production
    }
  };

  setInterval(omegaShield, 1000);

  // ── Keyboard DevTools Locks ───────────────────────────────────────────────
  window.addEventListener("keydown", (e) => {
    if (
      e.keyCode === 123 ||
      (e.ctrlKey && e.shiftKey && [73, 74, 67, 75].includes(e.keyCode)) ||
      (e.ctrlKey && e.keyCode === 85)
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });
};
