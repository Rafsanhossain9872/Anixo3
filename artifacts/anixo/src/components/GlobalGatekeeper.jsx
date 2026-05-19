import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import MaintenancePage from "./MaintenancePage";
import PrivateGate from "./common/PrivateGate";

function getCookie(name) {
  const match = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader className="w-8 h-8 text-red-600 animate-spin" />
    </div>
  );
}

export default function GlobalGatekeeper({ children }) {
  // Fail-closed defaults — locked until API confirms otherwise
  const [isLoading, setIsLoading]           = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(true);
  const [privateMode, setPrivateMode]         = useState(true);
  const [maintenanceData, setMaintenanceData] = useState({});
  const [privateMessage, setPrivateMessage]   = useState("");
  const [config, setConfig]                   = useState(null);

  const isAdmin     = getCookie("bypass_ui") === "true";
  const isAdminPath = window.location.pathname.startsWith("/admin");

  useEffect(() => {
    // Admin users and the /admin path bypass all gates immediately
    if (isAdmin || isAdminPath) {
      setMaintenanceMode(false);
      setPrivateMode(false);
      setIsLoading(false);
      return;
    }

    fetch("/api/admin/site-config", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // ONLY unlock what the server says is unlocked
        setMaintenanceMode(!!data.maintenanceMode);
        setMaintenanceData(data.maintenanceData || {});
        setPrivateMode(!!data.privateMode);
        setPrivateMessage(data.privateMessage || "");
        setConfig(data);
      })
      .catch(() => {
        // Fetch failed — leave maintenanceMode and privateMode as TRUE (locked)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 1. Block render until fetch completes
  if (isLoading) return <FullScreenSpinner />;

  // 2. Maintenance gate
  if (maintenanceMode) {
    return <MaintenancePage config={maintenanceData} />;
  }

  // 3. Private gate
  if (privateMode && localStorage.getItem("private_access_granted") !== "true") {
    return <PrivateGate message={privateMessage} />;
  }

  // 4. All gates cleared — render the app
  return children;
}
