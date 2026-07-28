import { Menu } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Outlet,
  useNavigate,
} from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const handleLogout = () => {
    logout();

    toast.success(
      "Logged out successfully"
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        onLogout={handleLogout}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}

      <div className="app-content">
        <header className="mobile-header">
          <button
            type="button"
            className="menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
            aria-label="Open navigation"
          >
            <Menu size={23} />
          </button>

          <strong>CareerTrack</strong>
        </header>

        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
