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

export default function ExitBypassButton() {
  const hasBypass = getCookie("bypass_ui") === "true";
  if (!hasBypass) return null;

  return (
    <button
      onClick={() => {
        clearBypassCookies();
        window.location.reload();
      }}
      className="fixed bottom-5 right-5 z-[9999] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full shadow-lg border border-red-500 text-xs tracking-wider uppercase transition-all duration-200"
      title="Exit admin bypass and lock site into maintenance mode"
    >
      Exit Bypass
    </button>
  );
}
