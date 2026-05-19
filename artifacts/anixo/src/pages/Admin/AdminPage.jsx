import { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function getCookie(name) {
  const match = document.cookie.split("; ").find((r) => r.startsWith(name + "="));
  return match ? match.split("=")[1] : null;
}

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(getCookie("bypass_ui") === "true");

  useEffect(() => {
    document.title = "AniXo Admin";
  }, []);

  if (!isAdmin) {
    return <AdminLogin onSuccess={() => setIsAdmin(true)} />;
  }

  return <AdminDashboard />;
}
