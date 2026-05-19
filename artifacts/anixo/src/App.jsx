import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/common/ScrollToTop";
import PageLoader from "./components/common/PageLoader";
import MaintenancePage from "./components/MaintenancePage";
import PrivateGate from "./components/common/PrivateGate";
import { AdminContextProvider } from "./context/AdminContext";
import { Loader } from "lucide-react";

function getCookie(name) {
  const match = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}

const Home             = lazy(() => import("./pages/Home"));
const Portal           = lazy(() => import("./pages/Portal"));
const Browse           = lazy(() => import("./pages/Browse"));
const Watch            = lazy(() => import("./pages/Watch"));
const Character        = lazy(() => import("./pages/Character"));
const Staff            = lazy(() => import("./pages/Staff"));
const Schedule         = lazy(() => import("./pages/Schedule"));
const DMCA             = lazy(() => import("./pages/DMCA"));
const TermsOfService   = lazy(() => import("./pages/TermsOfService"));
const Watchlist        = lazy(() => import("./pages/Watchlist"));
const Profile          = lazy(() => import("./pages/Profile"));
const Settings         = lazy(() => import("./pages/Settings"));
const ContinueWatching = lazy(() => import("./pages/ContinueWatching"));
const Notifications    = lazy(() => import("./pages/Notifications"));
const ImportExport     = lazy(() => import("./pages/ImportExport"));
const Stats            = lazy(() => import("./pages/Stats"));
const ForgotPassword   = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword    = lazy(() => import("./pages/ResetPassword"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const AdminPage        = lazy(() => import("./pages/Admin/AdminPage"));
const ContactUs        = lazy(() => import("./pages/ContactUs"));

function MainAppRouter() {
  return (
    <AdminContextProvider>
      <Router>
        <ScrollToTop />
        <PageLoader />
        <Suspense fallback={
          <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
            <Loader className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/admin"                  element={<AdminPage />} />
            <Route path="/"                       element={<Portal />} />
            <Route path="/home"                   element={<Home />} />
            <Route path="/browse"                 element={<Browse />} />
            <Route path="/watch/:id"              element={<Watch />} />
            <Route path="/character/:id"          element={<Character />} />
            <Route path="/staff/:id"              element={<Staff />} />
            <Route path="/schedule"               element={<Schedule />} />
            <Route path="/dmca"                   element={<DMCA />} />
            <Route path="/terms"                  element={<TermsOfService />} />
            <Route path="/watchlist"              element={<Watchlist />} />
            <Route path="/profile"                element={<Profile />} />
            <Route path="/settings"               element={<Settings />} />
            <Route path="/watching"               element={<ContinueWatching />} />
            <Route path="/notifications"          element={<Notifications />} />
            <Route path="/import"                 element={<ImportExport />} />
            <Route path="/stats"                  element={<Stats />} />
            <Route path="/forgot-password"        element={<ForgotPassword />} />
            <Route path="/reset-password/:token"  element={<ResetPassword />} />
            <Route path="/contact-us"             element={<ContactUs />} />
            <Route path="*"                       element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AdminContextProvider>
  );
}

export default function App() {
  const isAdmin     = getCookie("bypass_ui") === "true";
  const isAdminPath = window.location.pathname.startsWith("/admin");

  // Check local storage immediately
  const hasAccess = localStorage.getItem("private_access_granted") === "true";

  // Default states: LOCKED (fail-closed)
  const [config, setConfig]   = useState({ maintenanceMode: true, privateMode: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Admin users and /admin path bypass all gates
    if (isAdmin || isAdminPath) {
      setConfig({ maintenanceMode: false, privateMode: false });
      setLoading(false);
      return;
    }

    fetch("/api/admin/site-config", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // Success: update config to real server values
        setConfig({
          maintenanceMode: !!data.maintenanceMode,
          privateMode:     !!data.privateMode,
          maintenanceData: data.maintenanceData || {},
          privateMessage:  data.privateMessage  || "",
        });
      })
      .catch(() => {
        // Error: leave config locked (maintenanceMode: true, privateMode: true)
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 1. Black screen while checking — zero content leaks
  if (loading) {
    return <div style={{ height: "100vh", backgroundColor: "#000" }} />;
  }

  // 2. Maintenance gate
  if (config.maintenanceMode) {
    return <MaintenancePage config={config.maintenanceData || {}} />;
  }

  // 3. Private gate
  if (config.privateMode && !hasAccess) {
    return <PrivateGate message={config.privateMessage} />;
  }

  // 4. All gates cleared
  return <MainAppRouter />;
}
